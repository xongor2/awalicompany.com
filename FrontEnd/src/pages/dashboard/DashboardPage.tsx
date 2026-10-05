import React, { useState, useEffect } from 'react';
import {
  Building2,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Newspaper
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ActionMenu } from '../../components/ui/Dropdown';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Property, User, DashboardStats } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { NavSection } from '../../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (section: NavSection) => void;
  onOpenAddProperty: () => void;
  onOpenAddService: () => void;
  onOpenAddUser: () => void;
  onViewProperty: (prop: Property) => void;
  onEditProperty: (prop: Property) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddProperty,
  onOpenAddService,
  onOpenAddUser,
  onViewProperty,
  onEditProperty,
  onViewUser,
  onEditUser,
}) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [chartData, setChartData] = useState<{ month: string; listings: number; sales: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'property' | 'user'; id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, propsRes, usersRes, chartRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentProperties(),
        api.getRecentUsers(),
        api.getChartData(),
      ]);

      setStats(statsRes);
      setRecentProperties(propsRes);
      setRecentUsers(usersRes);
      setChartData(chartRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      showToast('Could not load recent dashboard data. Using local cache.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'property') {
        await api.deleteProperty(deleteTarget.id);
        showToast('Property deleted successfully.', 'success');
      } else {
        await api.deleteUser(deleteTarget.id);
        showToast('User account deleted successfully.', 'success');
      }
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `Rs ${val.toLocaleString('en-PK')}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back to AW Ali Company management system"
        action={
          <Button
            variant="accent"
            onClick={onOpenAddProperty}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Property
          </Button>
        }
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1: Total Properties */}
        <Card className="hover:border-[#FF7817]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
              Total Properties
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-heading text-2xl font-bold text-[#171A2B] dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalProperties || 128}
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-[#FF7817]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{stats?.changes.properties || '+12 this month'}</span>
          </div>
        </Card>

        {/* Stat 2: Total Services */}
        <Card className="hover:border-[#FF7817]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
              Total Services
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817]">
              <BriefcaseBusiness className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-heading text-2xl font-bold text-[#171A2B] dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalServices || 24}
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-[#FF7817]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{stats?.changes.services || '+3 this month'}</span>
          </div>
        </Card>

        {/* Stat 3: Total Users */}
        <Card className="hover:border-[#FF7817]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-heading text-2xl font-bold text-[#171A2B] dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 56}
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-[#FF7817]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{stats?.changes.users || '+8 this month'}</span>
          </div>
        </Card>

        {/* Stat 4: Active Listings */}
        <Card className="hover:border-[#FF7817]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F667A] dark:text-[#8A90A2]">
              Active Listings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E4] dark:bg-[#252B5C] flex items-center justify-center text-[#FF7817]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="font-heading text-2xl font-bold text-[#171A2B] dark:text-white">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.activeListings || 89}
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-[#FF7817]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{stats?.changes.activeListings || '+5 this week'}</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Left Column (Recent Properties + Chart) & Right Column (Recent Users + Quick Actions + Promo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Properties */}
          <Card
            title="Recent Properties"
            action={
              <button
                onClick={() => onNavigate('properties')}
                className="text-xs font-semibold text-[#FF7817] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC]/60 dark:bg-[#0B1030]/40 text-[#5F667A] dark:text-[#8A90A2] font-semibold">
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-10 w-full mb-2" />
                        <Skeleton className="h-10 w-full mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ) : recentProperties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#8A90A2]">
                        No properties found. Add your first property!
                      </td>
                    </tr>
                  ) : (
                    recentProperties.map((prop) => (
                      <tr
                        key={prop.id}
                        className="hover:bg-[#EEF0F5]/50 dark:hover:bg-[#252B5C]/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prop.image}
                              alt={prop.title}
                              className="w-10 h-10 rounded-lg object-cover border border-[#D9DDE8] dark:border-[#252B5C] shrink-0"
                            />
                            <div className="min-w-0">
                              <span
                                onClick={() => onViewProperty(prop)}
                                className="font-semibold text-[#171A2B] dark:text-white truncate block hover:text-[#FF7817] cursor-pointer"
                              >
                                {prop.title}
                              </span>
                              <span className="text-[11px] text-[#8A90A2] block">
                                {prop.property_type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#5F667A] dark:text-[#D9DDE8]">
                          {prop.location}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#171A2B] dark:text-white">
                          {formatCurrency(prop.price)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              prop.status === 'Active'
                                ? 'active'
                                : prop.status === 'Pending'
                                ? 'pending'
                                : 'sold'
                            }
                          >
                            {prop.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#8A90A2] whitespace-nowrap">
                          {formatDate(prop.created_at)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ActionMenu
                            actions={[
                              {
                                label: 'View Details',
                                icon: <Eye className="w-4 h-4 text-blue-500" />,
                                onClick: () => onViewProperty(prop),
                              },
                              {
                                label: 'Edit Property',
                                icon: <Edit2 className="w-4 h-4 text-[#FF7817]" />,
                                onClick: () => onEditProperty(prop),
                              },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                                onClick: () =>
                                  setDeleteTarget({
                                    type: 'property',
                                    id: prop.id,
                                    title: prop.title,
                                  }),
                                variant: 'danger',
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Property Listings Overview Chart */}
          <Card
            title="Property Listings Overview"
            action={
              <div className="text-xs text-[#8A90A2] font-medium bg-[#EEF0F5] dark:bg-[#0B1030] px-2.5 py-1 rounded-md border border-[#D9DDE8] dark:border-[#252B5C]">
                Last 6 Months
              </div>
            }
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D9DDE8" opacity={0.3} vertical={false} />
                  <XAxis dataKey="month" stroke="#8A90A2" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8A90A2" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151A46',
                      borderColor: '#252B5C',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'rgba(255, 120, 23, 0.08)' }}
                  />
                  <Bar
                    dataKey="listings"
                    name="Listings"
                    fill="#FF7817"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="sales"
                    name="Completed"
                    fill="#151A46"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Users */}
          <Card
            title="Recent Users"
            action={
              <button
                onClick={() => onNavigate('users')}
                className="text-xs font-semibold text-[#FF7817] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
            noPadding
          >
            <div className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8A90A2]">
                  No registered users found.
                </div>
              ) : (
                recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 px-4 flex items-center justify-between hover:bg-[#EEF0F5]/40 dark:hover:bg-[#252B5C]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.profile_image} name={u.name} size="md" />
                      <div className="min-w-0">
                        <span
                          onClick={() => onViewUser(u)}
                          className="text-xs font-bold text-[#171A2B] dark:text-white truncate block hover:text-[#FF7817] cursor-pointer"
                        >
                          {u.name}
                        </span>
                        <span className="text-[11px] text-[#8A90A2] truncate block">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={u.role.toLowerCase() as any}>{u.role}</Badge>
                      <ActionMenu
                        actions={[
                          {
                            label: 'View Profile',
                            icon: <Eye className="w-4 h-4 text-blue-500" />,
                            onClick: () => onViewUser(u),
                          },
                          {
                            label: 'Edit User',
                            icon: <Edit2 className="w-4 h-4 text-[#FF7817]" />,
                            onClick: () => onEditUser(u),
                          },
                          {
                            label: 'Delete User',
                            icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                            onClick: () =>
                              setDeleteTarget({
                                type: 'user',
                                id: u.id,
                                title: u.name,
                              }),
                            variant: 'danger',
                          },
                        ]}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card title="Quick Actions">
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenAddProperty}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030]/50 hover:border-[#FF7817] dark:hover:border-[#FF7817] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF7817]/10 text-[#FF7817] flex items-center justify-center group-hover:bg-[#FF7817] group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A2B] dark:text-white">
                      Add Property
                    </p>
                    <p className="text-[11px] text-[#8A90A2]">
                      List a new commercial or residential property
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A90A2] group-hover:text-[#FF7817] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={onOpenAddService}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030]/50 hover:border-[#FF7817] dark:hover:border-[#FF7817] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#151A46]/10 dark:bg-blue-900/30 text-[#151A46] dark:text-blue-300 flex items-center justify-center group-hover:bg-[#151A46] group-hover:text-white transition-colors">
                    <BriefcaseBusiness className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A2B] dark:text-white">
                      Add Service
                    </p>
                    <p className="text-[11px] text-[#8A90A2]">
                      Create a new service offering in catalog
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A90A2] group-hover:text-[#151A46] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={onOpenAddUser}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030]/50 hover:border-[#FF7817] dark:hover:border-[#FF7817] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A2B] dark:text-white">
                      Add User
                    </p>
                    <p className="text-[11px] text-[#8A90A2]">
                      Register or invite a new administrator or agent
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A90A2] group-hover:text-[#FF7817] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('blogs')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030]/50 hover:border-[#FF7817] dark:hover:border-[#FF7817] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF7817]/10 dark:bg-[#FF7817]/20 text-[#FF7817] flex items-center justify-center group-hover:bg-[#FF7817] group-hover:text-white transition-colors">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171A2B] dark:text-white">
                      Blog Articles
                    </p>
                    <p className="text-[11px] text-[#8A90A2]">
                      Manage publications, news, and market reports
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A90A2] group-hover:text-[#FF7817] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </Card>

          {/* Branded Identity Promotional Card (Figure 1 & 2) */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#151A46] to-[#0B1030] text-white p-6 shadow-md border border-[#252B5C]">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#FF7817]/10 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FF7817] text-white mb-3">
                AW Ali Mission
              </span>
              <h3 className="font-heading text-lg font-bold leading-snug mb-2">
                Together for a Brighter Tomorrow
              </h3>
              <p className="text-xs text-[#D9DDE8] leading-relaxed mb-4">
                Quality properties. Trusted services. Stronger communities across Pakistan and beyond.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#FF7817] font-semibold">
                <span>Centralized Management v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete ${deleteTarget?.type === 'property' ? 'Property' : 'User Account'}`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This record will be permanently purged from the database.`}
      />
    </div>
  );
};
