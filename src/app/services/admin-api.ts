import api from './api'

// ── Types ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor';
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  labsCompleted: number;
  lastActive: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServerMetric {
  id: string;
  name: string;
  type: 'web' | 'database' | 'cache' | 'lab-vm';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  location: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalLabs: number;
  runningLabs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  avgCompletionRate: number;
  avgSessionTime: number;
  avgScore?: number;
  completedLabs?: number;
  newUsersThisWeek?: number;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  email?: string;
  avatar?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  plan?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
}

interface RawServer {
  id?: string;
  serverId?: string;
  _id?: string;
  name?: string;
  type?: string;
  status?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  uptime?: number;
  location?: string;
}

interface RawActivity {
  id?: string;
  _id?: string;
  user?: string;
  action?: string;
  time?: string;
  email?: string;
  avatar?: string;
}

// ── API Functions ────────────────────────────────────────────────

export async function getUsers(filters?: UserFilters): Promise<{ users: AdminUser[]; pagination: Pagination }> {
  const { data } = await api.get('/users', { params: filters })
  const users = data.data?.users ?? []
  const pagination: Pagination = data.data?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 }
  return { users: users.map(normalizeAdminUser), pagination }
}

export async function getUserById(id: string): Promise<AdminUser> {
  const { data } = await api.get(`/users/${id}`)
  return normalizeAdminUser(data.data?.user ?? data.user)
}

export async function updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
  const { data } = await api.patch(`/users/${id}`, updates)
  return normalizeAdminUser(data.data?.user ?? data.user)
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

export async function suspendUser(id: string): Promise<AdminUser> {
  const { data } = await api.patch(`/users/${id}/suspend`)
  return normalizeAdminUser(data.data?.user ?? data.user)
}

export async function getAdminStats(): Promise<PlatformStats> {
  const { data } = await api.get('/admin/stats')
  const stats = data.data?.stats ?? data.stats ?? {}
  return {
    totalUsers: stats.totalUsers ?? 0,
    activeUsers: stats.activeUsers ?? 0,
    totalLabs: stats.totalLabs ?? 0,
    runningLabs: stats.runningLabs ?? 0,
    totalRevenue: stats.totalRevenue ?? 0,
    monthlyRevenue: stats.monthlyRevenue ?? 0,
    avgCompletionRate: stats.avgCompletionRate ?? 0,
    avgSessionTime: stats.avgSessionTime ?? 0,
    avgScore: stats.avgScore,
    completedLabs: stats.completedLabs,
    newUsersThisWeek: stats.newUsersThisWeek,
  }
}

export async function getServers(): Promise<ServerMetric[]> {
  const { data } = await api.get('/admin/servers')
  return (data.data?.servers ?? []).map((srv: RawServer) => ({
    id: srv.id ?? srv.serverId ?? srv._id ?? '',
    name: srv.name ?? '',
    type: (srv.type ?? 'web') as ServerMetric['type'],
    status: (srv.status ?? 'healthy') as ServerMetric['status'],
    cpu: srv.cpu ?? 0,
    memory: srv.memory ?? 0,
    disk: srv.disk ?? 0,
    uptime: srv.uptime ?? 0,
    location: srv.location ?? '',
  }))
}

export async function getActivity(): Promise<Activity[]> {
  const { data } = await api.get('/admin/activity')
  return (data.data?.activity ?? []).map((a: RawActivity) => ({
    id: a.id ?? a._id ?? '',
    user: a.user ?? 'Unknown',
    action: a.action ?? '',
    time: formatRelativeTime(a.time ?? ''),
    email: a.email,
    avatar: a.avatar,
  }))
}

// ── Helpers ──────────────────────────────────────────────────────

interface RawAdminUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'student' | 'admin' | 'instructor';
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended';
  isActive?: boolean;
  labStats?: { labsCompleted?: number };
  labsCompleted?: number;
  lastActive?: string;
  updatedAt?: string;
  createdAt?: string;
}

function normalizeAdminUser(raw: RawAdminUser): AdminUser {
  return {
    id: raw._id ?? raw.id ?? '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? 'student',
    plan: raw.plan ?? 'free',
    status: raw.status ?? (raw.isActive === false ? 'suspended' : 'active'),
    labsCompleted: raw.labStats?.labsCompleted ?? raw.labsCompleted ?? 0,
    lastActive: raw.lastActive ?? raw.updatedAt ?? raw.createdAt ?? '',
    createdAt: raw.createdAt ?? '',
  }
}

function formatRelativeTime(timestamp: string | Date): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
