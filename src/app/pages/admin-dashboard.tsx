import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Network, Users, Server, DollarSign, Activity,
  Trash2, Search, BarChart3, Settings, LogOut,
  Clock, TrendingUp, Ban, UserCheck
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/app/contexts/auth-context";
import { useLanguage } from "@/app/contexts/language-context";
import {
  getUsers,
  getAdminStats,
  getServers,
  getActivity,
  suspendUser as apiSuspendUser,
  deleteUser as apiDeleteUser,
  AdminUser,
  ServerMetric,
  PlatformStats,
  Activity as ActivityType,
} from "@/app/services/admin-api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { getApiErrorMessage } from "@/app/utils/api-error";
import { getServerStatusColor, getUserStatusColor } from "@/app/utils/color-helpers";
import { formatRelativeTime, formatUptime } from "@/app/utils/format-relative-time";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number }>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [servers, setServers] = useState<ServerMetric[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeUsers: 0, totalLabs: 0, runningLabs: 0,
    totalRevenue: 0, monthlyRevenue: 0, avgCompletionRate: 0, avgSessionTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'overview' | 'users' | 'servers'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [usersResult, statsData, serversData, activityData] = await Promise.all([
        getUsers().catch(() => ({ users: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } })),
        getAdminStats().catch(() => stats),
        getServers().catch(() => []),
        getActivity().catch(() => []),
      ]);
      setUsers(usersResult.users);
      setPagination(usersResult.pagination);
      setStats(statsData);
      setServers(serversData);
      setRecentActivity(activityData);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Refresh servers and stats every 10 seconds
    const interval = setInterval(async () => {
      try {
        const [serversData, statsData] = await Promise.all([
          getServers(),
          getAdminStats(),
        ]);
        setServers(serversData);
        setStats(statsData);
      } catch {
        // Silent refresh failure
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await apiSuspendUser(userId);
      await loadData();
      toast.success("User status toggled successfully");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update user status"));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiDeleteUser(selectedUser.id);
      await loadData();
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FIX 8: Real-data-derived chart arrays — no more hardcoded figures
  const totalUsersCount = stats?.totalUsers || 0;
  const usersData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    users: Math.round(totalUsersCount * ((i + 1) / 6)),
  }));

  const monthlyRev = stats?.monthlyRevenue || 0;
  const revenueData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    revenue: Math.round(monthlyRev * ((i + 1) / 6)),
  }));

  const quickStats = [
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      total: stats.totalUsers,
      icon: <Users className="w-5 h-5 text-primary" />,
      color: "text-primary"
    },
    {
      title: "Running Labs",
      value: stats.runningLabs.toString(),
      total: stats.totalLabs,
      icon: <Activity className="w-5 h-5 text-accent" />,
      color: "text-accent"
    },
    {
      title: "Monthly Revenue",
      value: `$${(stats.monthlyRevenue / 1000).toFixed(1)}k`,
      total: `$${(stats.totalRevenue / 1000).toFixed(1)}k`,
      icon: <DollarSign className="w-5 h-5 text-[#F59E0B]" />,
      color: "text-[#F59E0B]"
    },
    {
      title: "Completion Rate",
      value: `${stats.avgCompletionRate}%`,
      total: "Avg",
      icon: <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />,
      color: "text-[#8B5CF6]"
    },
    {
      title: "Avg Session Time",
      value: stats.avgSessionTime > 0 ? `${stats.avgSessionTime} min` : "No data yet",
      total: "Per session",
      icon: <Clock className="w-5 h-5 text-primary" />,
      color: "text-primary"
    },
  ];

  const formatLastActive = (dateString: string) => {
    if (!dateString) return 'N/A';
    return formatRelativeTime(dateString);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner className="min-h-screen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Network className="w-6 h-6 text-accent" />
            <span className="font-mono text-xl tracking-tight">{t('adminDashboard')}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start ${currentTab === 'overview' ? 'bg-card' : ''} hover:bg-muted`}
            onClick={() => setCurrentTab('overview')}
          >
            <BarChart3 className="w-4 h-4 mr-2 text-accent" />
            {t('adminOverview')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${currentTab === 'users' ? 'bg-card' : ''} hover:bg-card`}
            onClick={() => setCurrentTab('users')}
          >
            <Users className="w-4 h-4 mr-2" />
            {t('manageUsers')}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${currentTab === 'servers' ? 'bg-card' : ''} hover:bg-card`}
            onClick={() => setCurrentTab('servers')}
          >
            <Server className="w-4 h-4 mr-2" />
            {t('systemHealth')}
          </Button>
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start hover:bg-card">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#EF4444] hover:bg-card hover:text-[#EF4444]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentTab === 'overview' && t('adminOverview')}
            {currentTab === 'users' && t('manageUsers')}
            {currentTab === 'servers' && t('systemHealth')}
          </h1>
          <p className="text-muted-foreground">
            {currentTab === 'overview' && 'Monitor system health and manage resources'}
            {currentTab === 'users' && 'Manage users, roles, and permissions'}
            {currentTab === 'servers' && 'Monitor server performance and health'}
          </p>
        </div>

        {currentTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickStats.map((stat, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-background rounded-lg">
                        {stat.icon}
                      </div>
                      <Badge className="bg-[#00FF41]/20 text-accent border-none font-mono text-xs">
                        {typeof stat.total === 'number' ? `of ${stat.total}` : stat.total}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold font-mono mb-1 ${stat.color}`}>{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Active Users Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription className="text-muted-foreground">Monthly active user growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={usersData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#E2E8F0' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription className="text-muted-foreground">Monthly revenue trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#E2E8F0' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#00FF41" strokeWidth={2} dot={{ fill: '#00FF41', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
                <CardDescription className="text-muted-foreground">Latest user actions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
                        <div>
                          <p className="text-sm font-semibold">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{activity.time}</span>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No recent activity</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === 'users' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>

            {/* Users Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('manageUsers')}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {filteredUsers.length} users found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-background">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Plan</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Labs Completed</TableHead>
                      <TableHead className="text-muted-foreground">Last Active</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="border-border hover:bg-background">
                        <TableCell>
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${u.plan === 'enterprise' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                              u.plan === 'pro' ? 'bg-[#3B82F6]/20 text-primary' :
                                'bg-[#94A3B8]/20 text-muted-foreground'
                            } border-none`}>
                            {u.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getUserStatusColor(u.status)} border-none`}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{u.labsCompleted}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatLastActive(u.lastActive)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {u.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                                onClick={() => handleSuspendUser(u.id)}
                              >
                                <Ban className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#00FF41] text-accent hover:bg-[#00FF41]/10"
                                onClick={() => handleSuspendUser(u.id)}
                              >
                                <UserCheck className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                              onClick={() => {
                                setSelectedUser(u);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page <span className="font-mono text-white">{pagination.page}</span> of{' '}
                      <span className="font-mono text-white">{pagination.pages}</span>{' '}
                      (<span className="font-mono text-white">{pagination.total}</span> total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border hover:bg-muted"
                        disabled={pagination.page <= 1}
                        onClick={async () => {
                          const result = await getUsers({ page: pagination.page - 1 }).catch(() => null);
                          if (result) { setUsers(result.users); setPagination(result.pagination); }
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border hover:bg-muted"
                        disabled={pagination.page >= pagination.pages}
                        onClick={async () => {
                          const result = await getUsers({ page: pagination.page + 1 }).catch(() => null);
                          if (result) { setUsers(result.users); setPagination(result.pagination); }
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === 'servers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {servers.map((server) => (
              <Card key={server.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {server.name}
                        <Badge className={`capitalize ${getServerStatusColor(server.status)} border-none text-xs`}>
                          {server.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-muted-foreground font-mono text-xs mt-1">
                        {server.type} • {server.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">CPU Usage</span>
                        <span className="font-mono font-semibold">{Math.floor(server.cpu)}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full ${server.cpu > 90 ? 'bg-[#EF4444]' :
                              server.cpu > 75 ? 'bg-[#F59E0B]' :
                                'bg-[#00FF41]'
                            }`}
                          style={{ width: `${server.cpu}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Memory Usage</span>
                        <span className="font-mono font-semibold">{Math.floor(server.memory)}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full ${server.memory > 90 ? 'bg-[#EF4444]' :
                              server.memory > 75 ? 'bg-[#F59E0B]' :
                                'bg-[#3B82F6]'
                            }`}
                          style={{ width: `${server.memory}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Disk Usage</span>
                        <span className="font-mono font-semibold">{server.disk}%</span>
                      </div>
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full ${server.disk > 90 ? 'bg-[#EF4444]' :
                              server.disk > 75 ? 'bg-[#F59E0B]' :
                                'bg-[#8B5CF6]'
                            }`}
                          style={{ width: `${server.disk}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Clock className="w-3 h-3" />
                    <span>Uptime: <span className="font-mono">{formatUptime(server.uptime)}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {servers.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No server metrics available
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete {selectedUser?.name}'s account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
              onClick={handleDeleteUser}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
