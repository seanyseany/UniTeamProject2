'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
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
  TaskStatus,
  TaskSummary,
  UserKeyMaterial,
  WorkloadSummary,
} from '@/lib/types';

type AuthMode = 'login' | 'signup';
type SectionKey = 'main' | 'tasks' | 'availability' | 'workload' | 'chat';

const sectionItems: { key: SectionKey; label: string }[] = [
  { key: 'main', label: 'Main screen' },
  { key: 'tasks', label: 'Task creation' },
  { key: 'availability', label: 'Availability' },
  { key: 'workload', label: 'Workload distribution' },
  { key: 'chat', label: 'Chat' },
];

const taskStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Completed'];
const availabilityDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const availabilityTimes = Array.from({ length: 17 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function textToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToText(bytes: ArrayBuffer) {
  return new TextDecoder().decode(bytes);
}

async function deriveWrappingKey(password: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textToBytes(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: 250000,
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function generateUserKeyMaterial(password: string) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(password, salt);
  const encryptedPrivateKey = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    wrappingKey,
    privateKeyBuffer,
  );

  return {
    privateKey: keyPair.privateKey,
    bundle: {
      publicKey: bytesToBase64(new Uint8Array(publicKeyBuffer)),
      encryptedPrivateKey: bytesToBase64(new Uint8Array(encryptedPrivateKey)),
      wrappingSalt: bytesToBase64(salt),
      wrappingIv: bytesToBase64(iv),
    },
  };
}

async function unlockPrivateKey(bundle: UserKeyMaterial, password: string) {
  const salt = base64ToBytes(bundle.wrappingSalt);
  const iv = base64ToBytes(bundle.wrappingIv);
  const wrappingKey = await deriveWrappingKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    wrappingKey,
    base64ToBytes(bundle.encryptedPrivateKey),
  );

  return crypto.subtle.importKey(
    'pkcs8',
    decrypted,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt'],
  );
}

async function importMemberPublicKey(serializedKey: string) {
  return crypto.subtle.importKey(
    'spki',
    base64ToBytes(serializedKey),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  );
}

async function createGroupKey() {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

async function wrapGroupKeyForMember(groupKey: CryptoKey, memberPublicKey: string) {
  const exportedKey = await crypto.subtle.exportKey('raw', groupKey);
  const publicKey = await importMemberPublicKey(memberPublicKey);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    exportedKey,
  );

  return bytesToBase64(new Uint8Array(encrypted));
}

async function unwrapGroupKey(privateKey: CryptoKey, encryptedGroupKey: string) {
  const rawKey = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    base64ToBytes(encryptedGroupKey),
  );

  return crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptMessageBody(groupKey: CryptoKey, body: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    groupKey,
    textToBytes(body),
  );

  return {
    body: bytesToBase64(new Uint8Array(encrypted)),
    e2eeIv: bytesToBase64(iv),
  };
}

async function decryptMessageBody(groupKey: CryptoKey, body: string, e2eeIv: string) {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(e2eeIv),
    },
    groupKey,
    base64ToBytes(body),
  );

  return bytesToText(decrypted);
}

async function apiRequest<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
  }).format(parsed);
}

function emptyDashboard(): DashboardSummary {
  return {
    totalTasks: 0,
    openTasks: 0,
    totalMessages: 0,
    completionRate: 0,
    recentMessages: [],
    upcomingTasks: [],
    workload: [],
  };
}

export default function Page() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary>(emptyDashboard());
  const [workload, setWorkload] = useState<WorkloadSummary[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionKey>('main');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedTimelineCell, setSelectedTimelineCell] = useState<{ day: string; time: string } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [groupKey, setGroupKey] = useState<CryptoKey | null>(null);
  const [groupEnvelope, setGroupEnvelope] = useState<GroupKeyEnvelope | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
  const [taskDecisions, setTaskDecisions] = useState<Record<number, 'accepted' | 'declined'>>({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('Checking your session...');
  const [isLoading, setIsLoading] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [tasks, editingTaskId],
  );

  const isGroupOwner = Boolean(selectedGroup && user && selectedGroup.ownerId === user.id);

  const tasksByStatus = useMemo(() => {
    return taskStatuses.map((status) => ({
      status,
      items: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  const importantMessages = useMemo(() => {
    return [...messages].slice(-3).reverse();
  }, [messages]);

  const availabilityMatrix = useMemo(() => {
    return availabilityTimes.map((time) => ({
      time,
      cells: availabilityDays.map((day) => {
        const slots = availability.filter((slot) => slot.day === day && slot.timeLabel === time);
        return {
          day,
          count: slots.filter((slot) => slot.status === 'available').length,
        };
      }),
    }));
  }, [availability]);

  const selectedTimelineDetails = useMemo(() => {
    if (!selectedTimelineCell) {
      return null;
    }

    const assignedMembers = members.filter((member) =>
      availability.some(
        (slot) =>
          slot.userId === member.id
          && slot.day === selectedTimelineCell.day
          && slot.timeLabel === selectedTimelineCell.time
          && slot.status === 'available',
      ),
    );

    const assignedIds = new Set(assignedMembers.map((member) => member.id));
    const unassignedMembers = members.filter((member) => !assignedIds.has(member.id));

    return {
      assignedMembers,
      unassignedMembers,
      currentUserAssigned: Boolean(user && assignedIds.has(user.id)),
    };
  }, [availability, members, selectedTimelineCell, user]);

  async function loadSession() {
    try {
      const payload = await apiRequest<{ user: SessionUser | null }>('/api/session', {
        method: 'GET',
      });

      setUser(payload.user);
      setInfo(payload.user ? '' : 'Create an account or sign in to start collaborating.');
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load session.');
      setInfo('');
    }
  }

  async function unlockE2EE(passwordValue: string) {
    const payload = await apiRequest<{ keyMaterial: UserKeyMaterial | null }>('/api/e2ee/me', {
      method: 'GET',
    });

    if (!payload.keyMaterial) {
      throw new Error('No E2EE key material is registered for this user.');
    }

    const unlockedKey = await unlockPrivateKey(payload.keyMaterial, passwordValue);
    setPrivateKey(unlockedKey);
    setInfo('E2EE keys unlocked for this session.');
    return unlockedKey;
  }

  async function bootstrapE2EEForCurrentUser(passwordValue: string) {
    const generatedKeys = await generateUserKeyMaterial(passwordValue);

    await apiRequest<{ keyMaterial: UserKeyMaterial }>('/api/e2ee/me', {
      method: 'POST',
      body: JSON.stringify(generatedKeys.bundle),
    });

    setPrivateKey(generatedKeys.privateKey);
    setInfo('A new encrypted chat key was created automatically for this existing account.');
    return generatedKeys.privateKey;
  }

  async function unlockOrBootstrapE2EE(passwordValue: string) {
    const payload = await apiRequest<{ keyMaterial: UserKeyMaterial | null }>('/api/e2ee/me', {
      method: 'GET',
    });

    if (!payload.keyMaterial) {
      return bootstrapE2EEForCurrentUser(passwordValue);
    }

    const unlockedKey = await unlockPrivateKey(payload.keyMaterial, passwordValue);
    setPrivateKey(unlockedKey);
    setInfo('E2EE keys unlocked for this session.');
    return unlockedKey;
  }

  async function ensureUnlockedPrivateKey() {
    if (privateKey) {
      return privateKey;
    }

    const promptedPassword = window.prompt('Enter your password to unlock encrypted chat for this session.');
    if (!promptedPassword) {
      throw new Error('Encrypted chat remains locked until you unlock it.');
    }

    return unlockOrBootstrapE2EE(promptedPassword);
  }

  async function loadGroups() {
    const payload = await apiRequest<{ groups: GroupSummary[] }>('/api/groups', { method: 'GET' });
    setGroups(payload.groups);

    setSelectedGroupId((currentId) => {
      const existing = payload.groups.find((group) => group.id === currentId);
      if (existing) {
        return existing.id;
      }

      const firstJoined = payload.groups.find((group) => group.joined);
      return firstJoined?.id ?? payload.groups[0]?.id ?? null;
    });
  }

  async function shareGroupKeyWithMembers(
    groupId: number,
    targetGroupKey: CryptoKey,
    targetMembers: CryptoMemberSummary[],
  ) {
    const encryptableMembers = targetMembers.filter((member) => member.publicKey);

    if (encryptableMembers.length === 0) {
      return;
    }

    const envelopes = await Promise.all(
      encryptableMembers.map(async (member) => ({
        userId: member.id,
        encryptedGroupKey: await wrapGroupKeyForMember(targetGroupKey, member.publicKey as string),
      })),
    );

    await apiRequest(`/api/groups/${groupId}/e2ee`, {
      method: 'POST',
      body: JSON.stringify({ envelopes }),
    });
  }

  async function ensureGroupKey(groupId: number, incomingEnvelope?: GroupKeyEnvelope) {
    const envelope = incomingEnvelope ?? await apiRequest<GroupKeyEnvelope>(`/api/groups/${groupId}/e2ee`, {
      method: 'GET',
    });

    setGroupEnvelope(envelope);

    if (!privateKey) {
      setGroupKey(null);
      return null;
    }

    if (envelope.encryptedGroupKey) {
      const unlockedGroupKey = await unwrapGroupKey(privateKey, envelope.encryptedGroupKey);
      setGroupKey(unlockedGroupKey);

      const missingMembers = envelope.members.filter((member) => member.publicKey && !member.hasGroupKey);
      if (missingMembers.length > 0) {
        await shareGroupKeyWithMembers(groupId, unlockedGroupKey, missingMembers);
        const refreshedEnvelope = await apiRequest<GroupKeyEnvelope>(`/api/groups/${groupId}/e2ee`, {
          method: 'GET',
        });
        setGroupEnvelope(refreshedEnvelope);
      }

      return unlockedGroupKey;
    }

    const anyExistingEnvelope = envelope.members.some((member) => member.hasGroupKey);
    if (anyExistingEnvelope) {
      setGroupKey(null);
      setInfo('Encrypted chat is enabled, but this account has not received the group key yet. Ask a member with access to open the group once.');
      return null;
    }

    const newGroupKey = await createGroupKey();
    await shareGroupKeyWithMembers(groupId, newGroupKey, envelope.members);
    const refreshedEnvelope = await apiRequest<GroupKeyEnvelope>(`/api/groups/${groupId}/e2ee`, {
      method: 'GET',
    });
    setGroupEnvelope(refreshedEnvelope);
    setGroupKey(newGroupKey);
    return newGroupKey;
  }

  async function loadGroupWorkspace(groupId: number) {
    const [membersPayload, channelsPayload, tasksPayload, availabilityPayload, dashboardPayload, envelopePayload] = await Promise.all([
      apiRequest<{ members: MemberSummary[] }>(`/api/groups/${groupId}/members`, { method: 'GET' }),
      apiRequest<{ channels: ChannelSummary[] }>(`/api/groups/${groupId}/channels`, { method: 'GET' }),
      apiRequest<{ tasks: TaskSummary[] }>(`/api/groups/${groupId}/tasks`, { method: 'GET' }),
      apiRequest<{ availability: AvailabilitySlot[] }>(`/api/groups/${groupId}/availability`, { method: 'GET' }),
      apiRequest<{ summary: DashboardSummary; workload: WorkloadSummary[] }>(
        `/api/groups/${groupId}/dashboard`,
        { method: 'GET' },
      ),
      apiRequest<GroupKeyEnvelope>(`/api/groups/${groupId}/e2ee`, { method: 'GET' }),
    ]);

    setMembers(membersPayload.members);
    setChannels(channelsPayload.channels);
    setTasks(tasksPayload.tasks);
    setAvailability(availabilityPayload.availability);
    setDashboard(dashboardPayload.summary);
    setWorkload(dashboardPayload.workload);
    setGroupEnvelope(envelopePayload);

    const nextChannelId = channelsPayload.channels.find((channel) => channel.id === selectedChannelId)?.id
      ?? channelsPayload.channels[0]?.id
      ?? null;

    if (privateKey) {
      await ensureGroupKey(groupId, envelopePayload);
    } else {
      setGroupKey(null);
    }

    setSelectedChannelId(nextChannelId);

    if (nextChannelId) {
      const messagesPayload = await apiRequest<{ messages: MessageSummary[] }>(
        `/api/channels/${nextChannelId}/messages`,
        { method: 'GET' },
      );
      setMessages(messagesPayload.messages);
    } else {
      setMessages([]);
    }
  }

  async function loadMessages(channelId: number) {
    const payload = await apiRequest<{ messages: MessageSummary[] }>(
      `/api/channels/${channelId}/messages`,
      { method: 'GET' },
    );
    setMessages(payload.messages);
  }

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setMembers([]);
      setChannels([]);
      setMessages([]);
      setTasks([]);
      setAvailability([]);
      setDashboard(emptyDashboard());
      setWorkload([]);
      setSelectedGroupId(null);
      setSelectedChannelId(null);
      setPrivateKey(null);
      setGroupKey(null);
      setGroupEnvelope(null);
      setDecryptedMessages({});
      return;
    }

    setIsLoading(true);
    void loadGroups()
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load groups.');
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !selectedGroupId || !selectedGroup?.joined) {
      setMembers([]);
      setChannels([]);
      setMessages([]);
      setTasks([]);
      setAvailability([]);
      setDashboard(emptyDashboard());
      setWorkload([]);
      setGroupEnvelope(null);
      setGroupKey(null);
      return;
    }

    setIsLoading(true);
    void loadGroupWorkspace(selectedGroupId)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load group workspace.');
      })
      .finally(() => setIsLoading(false));
  }, [selectedGroupId, selectedGroup?.joined, user, privateKey]);

  useEffect(() => {
    if (!user || !selectedChannelId || !selectedGroupId || !selectedGroup?.joined) {
      return;
    }

    void loadMessages(selectedChannelId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load messages.');
    });
  }, [selectedChannelId]);

  useEffect(() => {
    let isCancelled = false;

    async function decryptMessages() {
      if (!messages.length) {
        setDecryptedMessages({});
        return;
      }

      if (!groupKey) {
        setDecryptedMessages(
          Object.fromEntries(
            messages.map((message) => [
              message.id,
              message.isEncrypted ? '[Encrypted - unlock chat to view]' : message.body,
            ]),
          ),
        );
        return;
      }

      const entries = await Promise.all(
        messages.map(async (message) => {
          if (!message.isEncrypted || !message.e2eeIv) {
            return [message.id, message.body] as const;
          }

          try {
            const decrypted = await decryptMessageBody(groupKey, message.body, message.e2eeIv);
            return [message.id, decrypted] as const;
          } catch {
            return [message.id, '[Unable to decrypt message]'] as const;
          }
        }),
      );

      if (!isCancelled) {
        setDecryptedMessages(Object.fromEntries(entries));
      }
    }

    void decryptMessages();

    return () => {
      isCancelled = true;
    };
  }, [groupKey, messages]);

  function clearTaskForm() {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskStatus('To Do');
    setTaskAssigneeId('');
  }

  async function refreshCurrentGroup() {
    await loadGroups();

    if (selectedGroupId && selectedGroup?.joined) {
      await loadGroupWorkspace(selectedGroupId);
    }
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

      if (authMode === 'signup') {
        const generatedKeys = await generateUserKeyMaterial(password);
        const payload = await apiRequest<{ user: SessionUser }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            ...generatedKeys.bundle,
          }),
        });

        setPrivateKey(generatedKeys.privateKey);
        setUser(payload.user);
      } else {
        const payload = await apiRequest<{ user: SessionUser }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const unlockedKey = await unlockOrBootstrapE2EE(password);
        setPrivateKey(unlockedKey);
        setUser(payload.user);
      }

      setPassword('');
      setInfo('Authentication successful. Transport is protected by HTTPS/TLS in secure deployment, and chat uses E2EE.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed.');
    }
  }

  async function handleLogout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setInfo('You have been signed out.');
    setSelectedSection('main');
  }

  async function handleCreateGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await apiRequest('/api/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });

      setGroupName('');
      setGroupDescription('');
      setInfo('Group created with a default general chat channel.');
      await loadGroups();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create group.');
    }
  }

  async function handleJoinLeaveGroup(group: GroupSummary) {
    try {
      await apiRequest(`/api/groups/${group.id}/join`, {
        method: group.joined ? 'DELETE' : 'POST',
      });

      setInfo(group.joined ? 'You left the group.' : 'You joined the group.');
      await loadGroups();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update membership.');
    }
  }

  function beginTaskEdit(task: TaskSummary) {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate);
    setTaskStatus(task.status);
    setTaskAssigneeId(task.assigneeId ? String(task.assigneeId) : '');
    setSelectedSection('tasks');
  }

  async function handleTaskSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGroupId) {
      return;
    }

    const payload = {
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      status: taskStatus,
      priority: 'Medium',
      expectedHours: 0,
      actualHours: 0,
      assigneeId: taskAssigneeId || null,
    };

    try {
      if (editingTaskId) {
        await apiRequest(`/api/tasks/${editingTaskId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setInfo('Task updated.');
      } else {
        await apiRequest(`/api/groups/${selectedGroupId}/tasks`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setInfo('Task created.');
      }

      clearTaskForm();
      await loadGroupWorkspace(selectedGroupId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save task.');
    }
  }

  async function handleDeleteTask(taskId: number) {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setInfo('Task deleted.');

      if (editingTaskId === taskId) {
        clearTaskForm();
      }

      if (selectedGroupId) {
        await loadGroupWorkspace(selectedGroupId);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete task.');
    }
  }

  async function handleAvailabilityToggle(day: string, timeLabel: string) {
    if (!selectedGroupId || !user) {
      return;
    }

    const isAssigned = availability.some(
      (slot) =>
        slot.userId === user.id
        && slot.day === day
        && slot.timeLabel === timeLabel
        && slot.status === 'available',
    );

    try {
      await apiRequest(`/api/groups/${selectedGroupId}/availability`, {
        method: 'POST',
        body: JSON.stringify({
          day,
          timeLabel,
          status: isAssigned ? 'busy' : 'available',
          reason: '',
        }),
      });

      setSelectedTimelineCell(isAssigned ? null : { day, time: timeLabel });
      setInfo(isAssigned ? 'Assignment removed from the selected time.' : 'You were assigned to the selected time.');
      await loadGroupWorkspace(selectedGroupId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update availability.');
    }
  }

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedChannelId || !selectedGroupId) {
      return;
    }

    try {
      await ensureUnlockedPrivateKey();
      const activeGroupKey = groupKey ?? await ensureGroupKey(selectedGroupId, groupEnvelope ?? undefined);
      if (!activeGroupKey) {
        throw new Error('No group encryption key is available for this chat yet.');
      }

      const encrypted = await encryptMessageBody(activeGroupKey, messageBody);

      await apiRequest(`/api/channels/${selectedChannelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          body: encrypted.body,
          e2eeIv: encrypted.e2eeIv,
          isEncrypted: true,
        }),
      });

      setMessageBody('');
      await loadMessages(selectedChannelId);

      if (selectedGroupId) {
        const dashboardPayload = await apiRequest<{ summary: DashboardSummary; workload: WorkloadSummary[] }>(
          `/api/groups/${selectedGroupId}/dashboard`,
          { method: 'GET' },
        );
        setDashboard(dashboardPayload.summary);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send message.');
    }
  }

  async function handleEditMessage(message: MessageSummary) {
    const updatedBody = window.prompt('Edit message', decryptedMessages[message.id] ?? message.body);

    if (!updatedBody || !selectedGroupId) {
      return;
    }

    if (message.isEncrypted) {
      try {
        await ensureUnlockedPrivateKey();
        const activeGroupKey = groupKey ?? await ensureGroupKey(selectedGroupId, groupEnvelope ?? undefined);
        if (!activeGroupKey) {
          throw new Error('No group encryption key is available for this chat yet.');
        }

        const encrypted = await encryptMessageBody(activeGroupKey, updatedBody);
        await apiRequest(`/api/messages/${message.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            body: encrypted.body,
            e2eeIv: encrypted.e2eeIv,
            isEncrypted: true,
          }),
        });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update message.');
        return;
      }
    } else {
      try {
        await apiRequest(`/api/messages/${message.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ body: updatedBody }),
        });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update message.');
        return;
      }
    }

    setInfo('Message updated.');
    if (selectedChannelId) {
      await loadMessages(selectedChannelId);
    }
  }

  async function handleDeleteMessage(messageId: number) {
    const confirmed = window.confirm('Delete this message?');
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/messages/${messageId}`, { method: 'DELETE' });
      setInfo('Message deleted.');
      if (selectedChannelId) {
        await loadMessages(selectedChannelId);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete message.');
    }
  }

  function handleTaskDecision(taskId: number, decision: 'accepted' | 'declined') {
    setTaskDecisions((current) => ({
      ...current,
      [taskId]: decision,
    }));
  }
 
  function jumpToMessage(messageId: number) {
    const target = document.getElementById(`message-${messageId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderMainScreen() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.heroBoard}>
          <div>
            <p className={styles.eyebrow}>Main screen / customisable</p>
            <h1 className={styles.title}>Dashboard overview</h1>
          </div>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Tasks</span>
              <strong className={styles.summaryValue}>{dashboard.totalTasks}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Open tasks</span>
              <strong className={styles.summaryValue}>{dashboard.openTasks}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Messages</span>
              <strong className={styles.summaryValue}>{dashboard.totalMessages}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Progress</span>
              <strong className={styles.summaryValue}>{dashboard.completionRate}%</strong>
            </div>
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Workspace overview</p>
                <h2 className={styles.panelTitle}>Workspace overview</h2>
              </div>
            </div>
            <div className={styles.noteStack}>
              <div className={styles.noteCard}>
                <strong>Group</strong>
                <p>{selectedGroup?.description || 'Use this workspace to coordinate project tasks and messages.'}</p>
              </div>
              <div className={styles.noteCard}>
                <strong>Members</strong>
                <p>{members.map((member) => member.name).join(', ') || 'No members loaded yet.'}</p>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Task board</p>
                <h2 className={styles.panelTitle}>Task board</h2>
              </div>
            </div>
            <div className={styles.kanbanVertical}>
              {tasksByStatus.map((column) => (
                <div key={column.status} className={styles.kanbanColumn}>
                  <div className={styles.kanbanHeading}>{column.status}</div>
                  <div className={styles.kanbanTaskViewport}>
                    <div className={styles.miniTaskStack}>
                      {column.items.length === 0 ? (
                        <div className={styles.emptyMiniCard}>No tasks</div>
                      ) : (
                        column.items.map((task) => (
                          <button
                            key={task.id}
                            className={styles.miniTaskCard}
                            onClick={() => beginTaskEdit(task)}
                            type="button"
                          >
                            <strong>{task.title}</strong>
                            <span>{task.assigneeName ?? 'Unassigned'}</span>
                            <span>Due {formatShortDate(task.dueDate)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Chat summary</p>
                <h2 className={styles.panelTitle}>Chat summary</h2>
              </div>
            </div>
            <div className={styles.listStack}>
              {dashboard.recentMessages.length === 0 ? (
                <div className={styles.emptyCard}>No recent messages yet.</div>
              ) : (
                dashboard.recentMessages.map((message) => (
                  <div key={message.id} className={styles.messageSummaryCard}>
                    <div className={styles.messageSummaryTop}>
                      <strong>{message.authorName}</strong>
                      <span>{formatTimestamp(message.createdAt)}</span>
                    </div>
                    <p>{message.body}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  function renderTasks() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Task creation</p>
              <h2 className={styles.panelTitle}>
                {selectedTask ? `Editing: ${selectedTask.title}` : 'Create and assign project tasks'}
              </h2>
            </div>
            {editingTaskId ? (
              <button className={styles.secondarySmall} onClick={clearTaskForm} type="button">
                Cancel edit
              </button>
            ) : null}
          </div>

          <form className={styles.taskFormGrid} onSubmit={handleTaskSubmit}>
            <label className={styles.field}>
              <span>Task title</span>
              <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Due date</span>
              <input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} />
            </label>
            <label className={styles.fieldWide}>
              <span>Description</span>
              <textarea rows={4} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value as TaskStatus)}>
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Assignee</span>
              <select value={taskAssigneeId} onChange={(event) => setTaskAssigneeId(event.target.value)}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
            <button className={styles.primaryButton} type="submit">
              {editingTaskId ? 'Update task' : 'Create task'}
            </button>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Task board</p>
              <h2 className={styles.panelTitle}>Simplified task tracking</h2>
            </div>
          </div>
          <div className={styles.taskColumns}>
            {tasksByStatus.map((column) => (
              <div key={column.status} className={styles.taskColumn}>
                <div className={styles.taskColumnHeader}>{column.status}</div>
                <div className={styles.taskColumnStack}>
                  {column.items.length === 0 ? (
                    <div className={styles.emptyMiniCard}>No tasks in this column.</div>
                  ) : (
                    column.items.map((task) => (
                      <article key={task.id} className={styles.taskCard}>
                        <div className={styles.taskCardTop}>
                          <strong>{task.title}</strong>
                          <span className={styles.statusTag}>{task.status}</span>
                        </div>
                        <p>{task.description || 'No description provided.'}</p>
                        <div className={styles.metaWrap}>
                          <span>Due: {formatShortDate(task.dueDate)}</span>
                          <span>Owner: {task.assigneeName ?? 'Unassigned'}</span>
                        </div>
                        <div className={styles.inlineActions}>
                          <button className={styles.secondaryTiny} onClick={() => beginTaskEdit(task)} type="button">
                            Edit
                          </button>
                          <button className={styles.dangerTiny} onClick={() => void handleDeleteTask(task.id)} type="button">
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderAvailability() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Availability</p>
              <h2 className={styles.panelTitle}>Weekly assignment timeline</h2>
            </div>
          </div>

          <div className={styles.availabilityLayout}>
            <div className={styles.timelineCard}>
              <div className={styles.timelineScroller}>
                <div className={styles.tableHeaderRow}>
                  <div className={styles.tableLabel}>Time</div>
                  {availabilityDays.map((day) => (
                    <div key={day} className={styles.tableLabel}>{day}</div>
                  ))}
                </div>
                {availabilityMatrix.map((row) => (
                  <div key={row.time} className={styles.tableRow}>
                    <div className={styles.tableTime}>{row.time}</div>
                    {row.cells.map((cell) => (
                      <button
                        key={`${row.time}-${cell.day}`}
                        className={
                          selectedTimelineCell?.day === cell.day && selectedTimelineCell?.time === row.time
                            ? styles.tableCellActive
                            : styles.tableCellButton
                        }
                        onClick={() => void handleAvailabilityToggle(cell.day, row.time)}
                        type="button"
                      >
                        <span className={cell.count > 0 ? styles.dotFilled : styles.dotEmpty} />
                        <small>{cell.count}</small>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sideFormCard}>
              <h3>Selected time slot</h3>
              {selectedTimelineCell ? (
                <>
                  <div className={styles.noteCard}>
                    <strong>{selectedTimelineCell.day} {selectedTimelineCell.time}</strong>
                    <p>Assigned: {selectedTimelineDetails?.assignedMembers.length ?? 0} member(s)</p>
                  </div>
                  <div className={styles.assignmentLegend}>
                    <div>
                      <strong>Assigned</strong>
                      <div className={styles.nameList}>
                        {selectedTimelineDetails?.assignedMembers.length
                          ? selectedTimelineDetails.assignedMembers.map((member) => (
                              <span key={member.id} className={styles.nameAssigned}>{member.name}</span>
                            ))
                          : <span className={styles.nameMuted}>None</span>}
                      </div>
                    </div>
                    <div>
                      <strong>Not assigned</strong>
                      <div className={styles.nameList}>
                        {selectedTimelineDetails?.unassignedMembers.length
                          ? selectedTimelineDetails.unassignedMembers.map((member) => (
                              <span key={member.id} className={styles.nameUnassigned}>{member.name}</span>
                            ))
                          : <span className={styles.nameMuted}>None</span>}
                      </div>
                    </div>
                  </div>
                  <p className={styles.helperText}>
                    Click a cell once to assign yourself. Click the same cell again to remove yourself.
                  </p>
                </>
              ) : (
                <p className={styles.helperText}>Click a date cell to see who is assigned and who is not assigned.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderWorkload() {
    const suggestedMember = workload.find((entry) => entry.recommended) ?? null;

    return (
      <div className={styles.sectionStack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Workload distribution</p>
              <h2 className={styles.panelTitle}>Visibility board and assignment hint</h2>
            </div>
          </div>

          <div className={styles.workloadLayout}>
            <div className={styles.workloadBoard}>
              {workload.length === 0 ? (
                <div className={styles.emptyCard}>No workload data yet. Create tasks and assignments first.</div>
              ) : (
                workload.map((entry) => (
                  <div key={entry.memberId} className={styles.workloadCard}>
                    <div className={styles.workloadHeader}>
                      <strong>{entry.memberName}</strong>
                      <span>{entry.recommended ? 'Suggested' : 'Member'}</span>
                    </div>
                    <div className={styles.workloadMeta}>
                      <span>Planned: {entry.plannedHours}h</span>
                      <span>Actual: {entry.actualHours}h</span>
                      <span>Available: {entry.availabilityHours}h</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${entry.progress}%` }} />
                    </div>
                    <p>{entry.note}</p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.sideFormCard}>
              <h3>Auto assign</h3>
              {suggestedMember ? (
                <>
                  <div className={styles.assignName}>{suggestedMember.memberName}</div>
                  <ul className={styles.simpleList}>
                    <li>Best capacity gap right now</li>
                    <li>{suggestedMember.availabilityHours} available hours this week</li>
                    <li>{suggestedMember.plannedHours} planned task hours</li>
                  </ul>
                  <p>{suggestedMember.note}</p>
                </>
              ) : (
                <p>Add members, tasks, and assignments to get a recommendation.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderChat() {
    return (
      <div className={styles.sectionStack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Chat</p>
              <h2 className={styles.panelTitle}>Group communication</h2>
            </div>
          </div>

          <div className={styles.chatLayout}>
            <div className={styles.chatSidebar}>
              <div className={styles.listStack}>
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    className={channel.id === selectedChannelId ? styles.channelButtonActive : styles.channelButton}
                    onClick={() => setSelectedChannelId(channel.id)}
                    type="button"
                  >
                    <strong>#{channel.name}</strong>
                    <span>{channel.description || 'Group discussion room'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.chatMain}>
              <div className={styles.chatFeed}>
                {messages.length === 0 ? (
                  <div className={styles.emptyCard}>No messages yet in this channel.</div>
                ) : (
                  messages.map((message) => {
                    const canEdit = user?.id === message.authorId;
                    const canDelete = canEdit || isGroupOwner;

                    return (
                      <article id={`message-${message.id}`} key={message.id} className={styles.messageCard}>
                        <div className={styles.messageHeader}>
                          <div>
                            <strong>{message.authorName}</strong>
                            <div className={styles.messageTime}>
                              {formatTimestamp(message.createdAt)}
                              {message.isEncrypted ? ' · E2EE' : ''}
                            </div>
                          </div>
                          <div className={styles.inlineActions}>
                            {canEdit ? (
                              <button className={styles.secondaryTiny} onClick={() => void handleEditMessage(message)} type="button">
                                Edit
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button className={styles.dangerTiny} onClick={() => void handleDeleteMessage(message.id)} type="button">
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <p>{decryptedMessages[message.id] ?? '[Encrypted - decrypting...]'}</p>
                      </article>
                    );
                  })
                )}
              </div>

              <form className={styles.composeForm} onSubmit={handleSendMessage}>
                <textarea
                  rows={4}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Write your encrypted group update here..."
                />
                <div className={styles.composeFooter}>
                  <button className={styles.secondarySmall} onClick={() => void refreshCurrentGroup()} type="button">
                    Refresh
                  </button>
                  <button className={styles.primaryButton} type="submit">Send encrypted message</button>
                </div>
              </form>
            </div>

            <aside className={styles.summaryPanel}>
              <h3>Summary</h3>
              <h4 className={styles.summarySubheading}>Important</h4>
              <div className={styles.listStack}>
                {importantMessages.length === 0 ? (
                  <div className={styles.emptyMiniCard}>No important messages yet.</div>
                ) : (
                  importantMessages.map((message) => (
                    <div key={message.id} className={styles.noteCard}>
                      <p>{decryptedMessages[message.id] ?? '[Encrypted message]'}</p>
                      <button className={styles.timeButton} onClick={() => jumpToMessage(message.id)} type="button">
                        {formatTimestamp(message.createdAt)}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <h4 className={styles.summarySubheading}>Actionable Tasks</h4>
              <div className={styles.listStack}>
                {dashboard.upcomingTasks.length === 0 ? (
                  <div className={styles.emptyMiniCard}>No actionable tasks yet.</div>
                ) : (
                  dashboard.upcomingTasks.map((task) => (
                    <div key={task.id} className={styles.summaryTaskCard}>
                      <strong>{task.assigneeName ?? 'You'}</strong>
                      <p>{task.title}</p>
                      <div className={styles.inlineActions}>
                        <button
                          className={styles.secondaryTiny}
                          onClick={() => handleTaskDecision(task.id, 'accepted')}
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className={styles.dangerTiny}
                          onClick={() => handleTaskDecision(task.id, 'declined')}
                          type="button"
                        >
                          Decline
                        </button>
                      </div>
                      {taskDecisions[task.id] ? (
                        <div className={styles.taskDecision}>
                          {taskDecisions[task.id] === 'accepted' ? 'Accepted' : 'Declined'}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  function renderSection() {
    if (!selectedGroup || !selectedGroup.joined) {
      return (
        <section className={styles.panel}>
          <div className={styles.emptyCard}>
            Join a group from the left sidebar to unlock the five reconstructed sections.
          </div>
        </section>
      );
    }

    if (selectedSection === 'tasks') {
      return renderTasks();
    }

    if (selectedSection === 'availability') {
      return renderAvailability();
    }

    if (selectedSection === 'workload') {
      return renderWorkload();
    }

    if (selectedSection === 'chat') {
      return renderChat();
    }

    return renderMainScreen();
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {info ? <div className={styles.infoBanner}>{info}</div> : null}

        {!user ? (
          <section className={styles.authLayout}>
            <div className={styles.authPanel}>
              <h1 className={styles.title}>Group Project Communication</h1>
              <p className={styles.subtitle}>
                Sign in to use the reconstructed team workflow with secure password storage, authenticated sessions, HTTPS/TLS-ready transport, and end-to-end encrypted chat.
              </p>
            </div>

            <form className={styles.panel} onSubmit={handleAuthSubmit}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Authentication</p>
                  <h2 className={styles.panelTitle}>
                    {authMode === 'login' ? 'Login' : 'Create account'}
                  </h2>
                </div>
                <div className={styles.inlineActions}>
                  <button
                    className={authMode === 'login' ? styles.primarySmall : styles.secondarySmall}
                    onClick={() => setAuthMode('login')}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className={authMode === 'signup' ? styles.primarySmall : styles.secondarySmall}
                    onClick={() => setAuthMode('signup')}
                    type="button"
                  >
                    Sign up
                  </button>
                </div>
              </div>
              <div className={styles.formStack}>
                {authMode === 'signup' ? (
                  <label className={styles.field}>
                    <span>Name</span>
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                  </label>
                ) : null}
                <label className={styles.field}>
                  <span>Email</span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Password</span>
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <button className={styles.primaryButton} type="submit">
                  {authMode === 'login' ? 'Login' : 'Create account'}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div className={styles.appLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.userCard}>
                <div>
                  <p className={styles.panelEyebrow}>Signed in</p>
                  <h2 className={styles.userName}>{user.name}</h2>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
                <button className={styles.secondaryButton} onClick={handleLogout} type="button">
                  Logout
                </button>
              </div>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelEyebrow}>Navigation</p>
                    <h2 className={styles.panelTitle}>Main functions</h2>
                  </div>
                </div>
                <div className={styles.navStack}>
                  {sectionItems.map((item) => (
                    <button
                      key={item.key}
                      className={selectedSection === item.key ? styles.navButtonActive : styles.navButton}
                      onClick={() => setSelectedSection(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.panelEyebrow}>Groups</p>
                    <h2 className={styles.panelTitle}>Workspace access</h2>
                  </div>
                </div>
                <form className={styles.formStack} onSubmit={handleCreateGroup}>
                  <label className={styles.field}>
                    <span>Group name</span>
                    <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
                  </label>
                  <label className={styles.field}>
                    <span>Description</span>
                    <textarea rows={3} value={groupDescription} onChange={(event) => setGroupDescription(event.target.value)} />
                  </label>
                  <button className={styles.primaryButton} type="submit">Create group</button>
                </form>

                <div className={styles.listStack}>
                  {groups.map((group) => (
                    <div key={group.id} className={group.id === selectedGroupId ? styles.groupCardActive : styles.groupCard}>
                      <button className={styles.groupButton} onClick={() => setSelectedGroupId(group.id)} type="button">
                        <strong>{group.name}</strong>
                        <span>{group.description || 'No description yet.'}</span>
                        <span>{group.memberCount} members · {group.channelCount} channels</span>
                      </button>
                      <div className={styles.inlineActions}>
                        <button className={styles.secondaryTiny} onClick={() => void handleJoinLeaveGroup(group)} type="button">
                          {group.joined ? 'Leave' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>

            <section className={styles.mainStage}>
              <div className={styles.stageHeader}>
                <div>
                  <p className={styles.eyebrow}>Current group</p>
                  <h1 className={styles.stageTitle}>{selectedGroup?.name ?? 'Choose a group'}</h1>
                  <p className={styles.stageSubtitle}>
                    {selectedGroup?.description || 'Select a joined group to access the reconstructed screens.'}
                  </p>
                </div>
                <div className={styles.stageMeta}>
                  <span>{isLoading ? 'Loading...' : `${members.length} member(s)`}</span>
                  <span>{channels.length} channel(s)</span>
                  <span>{tasks.length} task(s)</span>
                </div>
              </div>

              {renderSection()}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
