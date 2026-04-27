export type SessionUser = {
  id: number;
  name: string;
  email: string;
};

export type UserKeyMaterial = {
  publicKey: string;
  encryptedPrivateKey: string;
  wrappingSalt: string;
  wrappingIv: string;
};

export type MemberSummary = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
};

export type CryptoMemberSummary = MemberSummary & {
  publicKey: string | null;
  hasGroupKey: boolean;
};

export type GroupSummary = {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  channelCount: number;
  joined: boolean;
};

export type ChannelSummary = {
  id: number;
  groupId: number;
  name: string;
  description: string;
  createdBy: number;
  createdAt: string;
};

export type MessageSummary = {
  id: number;
  channelId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorName: string;
  isEncrypted: boolean;
  e2eeIv: string | null;
};

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskSummary = {
  id: number;
  groupId: number;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  expectedHours: number;
  actualHours: number;
  assigneeId: number | null;
  assigneeName: string | null;
  createdBy: number;
  createdAt: string;
};

export type AvailabilitySlot = {
  id: number;
  userId: number;
  userName: string;
  day: string;
  timeLabel: string;
  status: 'available' | 'busy';
  reason: string;
};

export type WorkloadSummary = {
  memberId: number;
  memberName: string;
  plannedHours: number;
  actualHours: number;
  availableSlots: number;
  availabilityHours: number;
  progress: number;
  recommended: boolean;
  note: string;
};

export type DashboardSummary = {
  totalTasks: number;
  openTasks: number;
  totalMessages: number;
  completionRate: number;
  recentMessages: MessageSummary[];
  upcomingTasks: TaskSummary[];
  workload: WorkloadSummary[];
};

export type GroupKeyEnvelope = {
  encryptedGroupKey: string | null;
  members: CryptoMemberSummary[];
};
