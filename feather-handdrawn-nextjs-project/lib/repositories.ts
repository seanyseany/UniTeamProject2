import { db } from './db';
import type {
  AvailabilitySlot,
  ChannelSummary,
  CryptoMemberSummary,
  DashboardSummary,
  GroupKeyEnvelope,
  GroupSummary,
  MemberSummary,
  MessageSummary,
  SessionUser,
  TaskPriority,
  TaskStatus,
  TaskSummary,
  UserKeyMaterial,
  WorkloadSummary,
} from './types';

type UserRow = SessionUser & {
  password_hash: string;
};

const taskStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Completed'];
const taskPriorities: TaskPriority[] = ['Low', 'Medium', 'High'];

export function createUser(name: string, email: string, passwordHash: string) {
  const result = db
    .prepare(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `,
    )
    .run(name, email.toLowerCase(), passwordHash);

  return result.lastInsertRowid as number;
}

export function saveUserKeyMaterial(userId: number, keyMaterial: UserKeyMaterial) {
  db.prepare(
    `
      INSERT INTO user_key_material (
        user_id,
        public_key,
        encrypted_private_key,
        wrapping_salt,
        wrapping_iv
      )
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET
        public_key = excluded.public_key,
        encrypted_private_key = excluded.encrypted_private_key,
        wrapping_salt = excluded.wrapping_salt,
        wrapping_iv = excluded.wrapping_iv,
        updated_at = CURRENT_TIMESTAMP
    `,
  ).run(
    userId,
    keyMaterial.publicKey,
    keyMaterial.encryptedPrivateKey,
    keyMaterial.wrappingSalt,
    keyMaterial.wrappingIv,
  );
}

export function getUserKeyMaterial(userId: number) {
  return db.prepare(
    `
      SELECT
        public_key as publicKey,
        encrypted_private_key as encryptedPrivateKey,
        wrapping_salt as wrappingSalt,
        wrapping_iv as wrappingIv
      FROM user_key_material
      WHERE user_id = ?
    `,
  ).get(userId) as UserKeyMaterial | undefined;
}

export function getUserByEmail(email: string) {
  return db
    .prepare(
      `
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = ?
      `,
    )
    .get(email.toLowerCase()) as UserRow | undefined;
}

export function getUserById(id: number) {
  return db
    .prepare(
      `
        SELECT id, name, email
        FROM users
        WHERE id = ?
      `,
    )
    .get(id) as SessionUser | undefined;
}

function requireGroupMembership(groupId: number, userId: number) {
  if (!isGroupMember(groupId, userId)) {
    throw new Error('FORBIDDEN');
  }
}

function requireGroupOwner(groupId: number, userId: number) {
  const group = db
    .prepare(
      `
        SELECT owner_id as ownerId
        FROM groups_table
        WHERE id = ?
      `,
    )
    .get(groupId) as { ownerId: number } | undefined;

  if (!group) {
    throw new Error('NOT_FOUND');
  }

  if (group.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }
}

export function listGroups(userId: number) {
  return db
    .prepare(
      `
        SELECT
          g.id,
          g.name,
          g.description,
          g.owner_id as ownerId,
          u.name as ownerName,
          COUNT(DISTINCT gm.user_id) as memberCount,
          COUNT(DISTINCT c.id) as channelCount,
          CASE WHEN EXISTS (
            SELECT 1
            FROM group_members membership
            WHERE membership.group_id = g.id AND membership.user_id = ?
          ) THEN 1 ELSE 0 END as joined
        FROM groups_table g
        JOIN users u ON u.id = g.owner_id
        LEFT JOIN group_members gm ON gm.group_id = g.id
        LEFT JOIN channels c ON c.group_id = g.id
        GROUP BY g.id, g.name, g.description, g.owner_id, u.name
        ORDER BY g.created_at DESC
      `,
    )
    .all(userId)
    .map((groupRow) => {
      const group = groupRow as Omit<GroupSummary, 'joined'> & { joined: number };

      return {
        ...group,
        joined: Boolean(group.joined),
      };
    }) as GroupSummary[];
}

export function createGroup(userId: number, name: string, description: string) {
  const transaction = db.transaction(() => {
    const groupResult = db
      .prepare(
        `
          INSERT INTO groups_table (name, description, owner_id)
          VALUES (?, ?, ?)
        `,
      )
      .run(name, description, userId);

    const groupId = Number(groupResult.lastInsertRowid);

    db.prepare(
      `
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
      `,
    ).run(groupId, userId);

    db.prepare(
      `
        INSERT INTO channels (group_id, name, description, created_by)
        VALUES (?, 'general', 'Default group chat channel.', ?)
      `,
    ).run(groupId, userId);

    return groupId;
  });

  return transaction();
}

export function joinGroup(groupId: number, userId: number) {
  db.prepare(
    `
      INSERT OR IGNORE INTO group_members (group_id, user_id)
      VALUES (?, ?)
    `,
  ).run(groupId, userId);
}

export function leaveGroup(groupId: number, userId: number) {
  const group = db
    .prepare('SELECT owner_id FROM groups_table WHERE id = ?')
    .get(groupId) as { owner_id: number } | undefined;

  if (!group) {
    throw new Error('NOT_FOUND');
  }

  if (group.owner_id === userId) {
    throw new Error('OWNER_CANNOT_LEAVE');
  }

  db.prepare(
    `
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `,
  ).run(groupId, userId);
}

export function updateGroup(groupId: number, userId: number, name: string, description: string) {
  const updated = db
    .prepare(
      `
        UPDATE groups_table
        SET name = ?, description = ?
        WHERE id = ? AND owner_id = ?
      `,
    )
    .run(name, description, groupId, userId);

  if (updated.changes === 0) {
    throw new Error('FORBIDDEN');
  }
}

export function deleteGroup(groupId: number, userId: number) {
  const deleted = db
    .prepare(
      `
        DELETE FROM groups_table
        WHERE id = ? AND owner_id = ?
      `,
    )
    .run(groupId, userId);

  if (deleted.changes === 0) {
    throw new Error('FORBIDDEN');
  }
}

export function isGroupMember(groupId: number, userId: number) {
  const membership = db
    .prepare(
      `
        SELECT 1
        FROM group_members
        WHERE group_id = ? AND user_id = ?
      `,
    )
    .get(groupId, userId);

  return Boolean(membership);
}

export function listGroupMembers(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  return db
    .prepare(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          gm.joined_at as joinedAt
        FROM group_members gm
        JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = ?
        ORDER BY u.name COLLATE NOCASE ASC
      `,
    )
    .all(groupId) as MemberSummary[];
}

export function listGroupCryptoMembers(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  return db.prepare(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        gm.joined_at as joinedAt,
        ukm.public_key as publicKey,
        CASE WHEN gke.encrypted_group_key IS NOT NULL THEN 1 ELSE 0 END as hasGroupKey
      FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      LEFT JOIN user_key_material ukm ON ukm.user_id = u.id
      LEFT JOIN group_key_envelopes gke
        ON gke.group_id = gm.group_id
        AND gke.user_id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY u.name COLLATE NOCASE ASC
    `,
  )
    .all(groupId)
    .map((memberRow) => {
      const member = memberRow as Omit<CryptoMemberSummary, 'hasGroupKey'> & { hasGroupKey: number };
      return {
        ...member,
        hasGroupKey: Boolean(member.hasGroupKey),
      };
    }) as CryptoMemberSummary[];
}

export function getGroupKeyEnvelope(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  const row = db.prepare(
    `
      SELECT encrypted_group_key as encryptedGroupKey
      FROM group_key_envelopes
      WHERE group_id = ? AND user_id = ?
    `,
  ).get(groupId, userId) as { encryptedGroupKey: string } | undefined;

  return {
    encryptedGroupKey: row?.encryptedGroupKey ?? null,
    members: listGroupCryptoMembers(groupId, userId),
  } as GroupKeyEnvelope;
}

export function upsertGroupKeyEnvelopes(
  groupId: number,
  sharedBy: number,
  envelopes: Array<{ userId: number; encryptedGroupKey: string }>,
) {
  requireGroupMembership(groupId, sharedBy);

  const insert = db.prepare(
    `
      INSERT INTO group_key_envelopes (
        group_id,
        user_id,
        encrypted_group_key,
        shared_by
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(group_id, user_id)
      DO UPDATE SET
        encrypted_group_key = excluded.encrypted_group_key,
        shared_by = excluded.shared_by,
        updated_at = CURRENT_TIMESTAMP
    `,
  );

  const transaction = db.transaction(() => {
    for (const envelope of envelopes) {
      if (!isGroupMember(groupId, envelope.userId)) {
        throw new Error('FORBIDDEN');
      }

      insert.run(groupId, envelope.userId, envelope.encryptedGroupKey, sharedBy);
    }
  });

  transaction();
}

export function listChannels(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  return db
    .prepare(
      `
        SELECT
          id,
          group_id as groupId,
          name,
          description,
          created_by as createdBy,
          created_at as createdAt
        FROM channels
        WHERE group_id = ?
        ORDER BY created_at ASC
      `,
    )
    .all(groupId) as ChannelSummary[];
}

export function createChannel(groupId: number, userId: number, name: string, description: string) {
  requireGroupMembership(groupId, userId);

  db.prepare(
    `
      INSERT INTO channels (group_id, name, description, created_by)
      VALUES (?, ?, ?, ?)
    `,
  ).run(groupId, name, description, userId);
}

export function updateChannel(channelId: number, userId: number, name: string, description: string) {
  const group = db
    .prepare(
      `
        SELECT c.group_id as groupId, g.owner_id as ownerId
        FROM channels c
        JOIN groups_table g ON g.id = c.group_id
        WHERE c.id = ?
      `,
    )
    .get(channelId) as { groupId: number; ownerId: number } | undefined;

  if (!group) {
    throw new Error('NOT_FOUND');
  }

  if (group.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }

  db.prepare(
    `
      UPDATE channels
      SET name = ?, description = ?
      WHERE id = ?
    `,
  ).run(name, description, channelId);
}

export function deleteChannel(channelId: number, userId: number) {
  const group = db
    .prepare(
      `
        SELECT g.owner_id as ownerId
        FROM channels c
        JOIN groups_table g ON g.id = c.group_id
        WHERE c.id = ?
      `,
    )
    .get(channelId) as { ownerId: number } | undefined;

  if (!group) {
    throw new Error('NOT_FOUND');
  }

  if (group.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }

  db.prepare('DELETE FROM channels WHERE id = ?').run(channelId);
}

export function listMessages(channelId: number, userId: number) {
  const row = db
    .prepare(
      `
        SELECT c.group_id as groupId
        FROM channels c
        WHERE c.id = ?
      `,
    )
    .get(channelId) as { groupId: number } | undefined;

  if (!row) {
    throw new Error('NOT_FOUND');
  }

  requireGroupMembership(row.groupId, userId);

  return db
    .prepare(
      `
        SELECT
          m.id,
          m.channel_id as channelId,
          m.body,
          m.created_at as createdAt,
          m.updated_at as updatedAt,
          m.user_id as authorId,
          u.name as authorName,
          m.is_encrypted as isEncrypted,
          m.e2ee_iv as e2eeIv
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.channel_id = ?
        ORDER BY m.created_at ASC
      `,
    )
    .all(channelId)
    .map((messageRow) => {
      const message = messageRow as Omit<MessageSummary, 'isEncrypted'> & { isEncrypted: number };
      return {
        ...message,
        isEncrypted: Boolean(message.isEncrypted),
      };
    }) as MessageSummary[];
}

export function createMessage(channelId: number, userId: number, body: string) {
  const row = db
    .prepare(
      `
        SELECT group_id as groupId
        FROM channels
        WHERE id = ?
      `,
    )
    .get(channelId) as { groupId: number } | undefined;

  if (!row) {
    throw new Error('NOT_FOUND');
  }

  requireGroupMembership(row.groupId, userId);

  db.prepare(
    `
      INSERT INTO messages (channel_id, user_id, body)
      VALUES (?, ?, ?)
    `,
  ).run(channelId, userId, body);
}

export function createEncryptedMessage(channelId: number, userId: number, body: string, e2eeIv: string) {
  const row = db
    .prepare(
      `
        SELECT group_id as groupId
        FROM channels
        WHERE id = ?
      `,
    )
    .get(channelId) as { groupId: number } | undefined;

  if (!row) {
    throw new Error('NOT_FOUND');
  }

  requireGroupMembership(row.groupId, userId);

  db.prepare(
    `
      INSERT INTO messages (channel_id, user_id, body, is_encrypted, e2ee_iv)
      VALUES (?, ?, ?, 1, ?)
    `,
  ).run(channelId, userId, body, e2eeIv);
}

export function updateMessage(messageId: number, userId: number, body: string) {
  const result = db
    .prepare(
      `
        UPDATE messages
        SET body = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `,
    )
    .run(body, messageId, userId);

  if (result.changes === 0) {
    throw new Error('FORBIDDEN');
  }
}

export function updateEncryptedMessage(messageId: number, userId: number, body: string, e2eeIv: string) {
  const result = db
    .prepare(
      `
        UPDATE messages
        SET body = ?, e2ee_iv = ?, is_encrypted = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `,
    )
    .run(body, e2eeIv, messageId, userId);

  if (result.changes === 0) {
    throw new Error('FORBIDDEN');
  }
}

export function deleteMessage(messageId: number, userId: number) {
  const ownership = db
    .prepare(
      `
        SELECT m.user_id as authorId, g.owner_id as ownerId
        FROM messages m
        JOIN channels c ON c.id = m.channel_id
        JOIN groups_table g ON g.id = c.group_id
        WHERE m.id = ?
      `,
    )
    .get(messageId) as { authorId: number; ownerId: number } | undefined;

  if (!ownership) {
    throw new Error('NOT_FOUND');
  }

  if (ownership.authorId !== userId && ownership.ownerId !== userId) {
    throw new Error('FORBIDDEN');
  }

  db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
}

function normalizeTaskStatus(status: string) {
  return taskStatuses.includes(status as TaskStatus) ? (status as TaskStatus) : 'To Do';
}

function normalizeTaskPriority(priority: string) {
  return taskPriorities.includes(priority as TaskPriority) ? (priority as TaskPriority) : 'Medium';
}

export function listTasks(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  return db
    .prepare(
      `
        SELECT
          t.id,
          t.group_id as groupId,
          t.title,
          t.description,
          t.due_date as dueDate,
          t.status,
          t.priority,
          t.expected_hours as expectedHours,
          t.actual_hours as actualHours,
          t.assignee_id as assigneeId,
          assignee.name as assigneeName,
          t.created_by as createdBy,
          t.created_at as createdAt
        FROM tasks t
        LEFT JOIN users assignee ON assignee.id = t.assignee_id
        WHERE t.group_id = ?
        ORDER BY t.due_date ASC, t.created_at ASC
      `,
    )
    .all(groupId)
    .map((taskRow) => {
      const task = taskRow as TaskSummary;
      return {
        ...task,
        status: normalizeTaskStatus(task.status),
        priority: normalizeTaskPriority(task.priority),
      };
    }) as TaskSummary[];
}

export function createTask(
  groupId: number,
  userId: number,
  input: {
    title: string;
    description: string;
    dueDate: string;
    status: TaskStatus;
    priority: TaskPriority;
    expectedHours: number;
    actualHours: number;
    assigneeId: number | null;
  },
) {
  requireGroupMembership(groupId, userId);

  if (input.assigneeId !== null && !isGroupMember(groupId, input.assigneeId)) {
    throw new Error('FORBIDDEN');
  }

  db.prepare(
    `
      INSERT INTO tasks (
        group_id,
        title,
        description,
        due_date,
        status,
        priority,
        expected_hours,
        actual_hours,
        assignee_id,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    groupId,
    input.title,
    input.description,
    input.dueDate,
    input.status,
    input.priority,
    input.expectedHours,
    input.actualHours,
    input.assigneeId,
    userId,
  );
}

export function updateTask(
  taskId: number,
  userId: number,
  input: {
    title: string;
    description: string;
    dueDate: string;
    status: TaskStatus;
    priority: TaskPriority;
    expectedHours: number;
    actualHours: number;
    assigneeId: number | null;
  },
) {
  const task = db
    .prepare(
      `
        SELECT group_id as groupId
        FROM tasks
        WHERE id = ?
      `,
    )
    .get(taskId) as { groupId: number } | undefined;

  if (!task) {
    throw new Error('NOT_FOUND');
  }

  requireGroupMembership(task.groupId, userId);

  if (input.assigneeId !== null && !isGroupMember(task.groupId, input.assigneeId)) {
    throw new Error('FORBIDDEN');
  }

  db.prepare(
    `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        due_date = ?,
        status = ?,
        priority = ?,
        expected_hours = ?,
        actual_hours = ?,
        assignee_id = ?
      WHERE id = ?
    `,
  ).run(
    input.title,
    input.description,
    input.dueDate,
    input.status,
    input.priority,
    input.expectedHours,
    input.actualHours,
    input.assigneeId,
    taskId,
  );
}

export function deleteTask(taskId: number, userId: number) {
  const task = db
    .prepare(
      `
        SELECT group_id as groupId
        FROM tasks
        WHERE id = ?
      `,
    )
    .get(taskId) as { groupId: number } | undefined;

  if (!task) {
    throw new Error('NOT_FOUND');
  }

  requireGroupMembership(task.groupId, userId);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
}

export function listAvailability(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  return db
    .prepare(
      `
        SELECT
          availability_slots.id,
          availability_slots.user_id as userId,
          users.name as userName,
          availability_slots.day,
          availability_slots.time_label as timeLabel,
          availability_slots.status,
          availability_slots.reason
        FROM availability_slots
        JOIN users ON users.id = availability_slots.user_id
        WHERE availability_slots.group_id = ?
        ORDER BY availability_slots.day ASC, availability_slots.time_label ASC, users.name ASC
      `,
    )
    .all(groupId) as AvailabilitySlot[];
}

export function upsertAvailabilitySlot(
  groupId: number,
  userId: number,
  input: {
    day: string;
    timeLabel: string;
    status: 'available' | 'busy';
    reason: string;
  },
) {
  requireGroupMembership(groupId, userId);

  db.prepare(
    `
      INSERT INTO availability_slots (group_id, user_id, day, time_label, status, reason)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(group_id, user_id, day, time_label)
      DO UPDATE SET
        status = excluded.status,
        reason = excluded.reason,
        updated_at = CURRENT_TIMESTAMP
    `,
  ).run(groupId, userId, input.day, input.timeLabel, input.status, input.reason);
}

export function listWorkload(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  const members = listGroupMembers(groupId, userId);
  const tasks = listTasks(groupId, userId);
  const availability = listAvailability(groupId, userId);

  const summaries = members.map((member) => {
    const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
    const plannedHours = memberTasks.reduce((sum, task) => sum + task.expectedHours, 0);
    const actualHours = memberTasks.reduce((sum, task) => sum + task.actualHours, 0);
    const availableSlots = availability.filter(
      (slot) => slot.userId === member.id && slot.status === 'available',
    ).length;
    const availabilityHours = availableSlots * 2;
    const progress = plannedHours === 0
      ? 0
      : Math.min(100, Math.round((actualHours / plannedHours) * 100));

    return {
      memberId: member.id,
      memberName: member.name,
      plannedHours,
      actualHours,
      availableSlots,
      availabilityHours,
      progress,
      recommended: false,
      note: plannedHours > availabilityHours
        ? 'Workload exceeds current availability.'
        : 'Capacity looks healthy for this week.',
    };
  });

  const recommendedMember = [...summaries]
    .sort((left, right) => {
      const leftGap = left.availabilityHours - left.plannedHours;
      const rightGap = right.availabilityHours - right.plannedHours;
      return rightGap - leftGap;
    })[0];

  return summaries.map((summary) => ({
    ...summary,
    recommended: recommendedMember?.memberId === summary.memberId,
  })) as WorkloadSummary[];
}

export function getDashboardSummary(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  const tasks = listTasks(groupId, userId);
  const channels = listChannels(groupId, userId);
  const recentMessages = channels.flatMap((channel) => listMessages(channel.id, userId))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((message) => ({
      ...message,
      body: message.isEncrypted ? '[Encrypted message]' : message.body,
    }));
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;

  return {
    totalTasks: tasks.length,
    openTasks: tasks.filter((task) => task.status !== 'Completed').length,
    totalMessages: recentMessages.length,
    completionRate: tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100),
    recentMessages,
    upcomingTasks: tasks.slice(0, 4),
    workload: listWorkload(groupId, userId),
  } as DashboardSummary;
}

export function getBestMeetingTime(groupId: number, userId: number) {
  requireGroupMembership(groupId, userId);

  const availability = listAvailability(groupId, userId).filter((slot) => slot.status === 'available');
  const grouped = new Map<string, { count: number; people: string[] }>();

  for (const slot of availability) {
    const key = `${slot.day} ${slot.timeLabel}`;
    const existing = grouped.get(key) ?? { count: 0, people: [] };
    existing.count += 1;
    existing.people.push(slot.userName);
    grouped.set(key, existing);
  }

  const best = [...grouped.entries()]
    .sort((left, right) => right[1].count - left[1].count)[0];

  if (!best) {
    return null;
  }

  return {
    slot: best[0],
    count: best[1].count,
    people: best[1].people,
  };
}

export function canManageGroup(groupId: number, userId: number) {
  try {
    requireGroupOwner(groupId, userId);
    return true;
  } catch {
    return false;
  }
}
