import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { projectService } from '../../services/projectService';
import { SystemStats, Project, AuditLog } from '../../types';
import { PageHeader, StatCard, ProgressBar } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Users,
  FolderGit2,
  Award,
  BookOpen,
  ShieldAlert,
  History,
  TrendingUp,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, pData, aData] = await Promise.all([
        adminService.getSystemStats(),
        projectService.getProjects(),
        adminService.getAuditLogs(),
      ]);
      setStats(sData);
      setProjects(pData);
      setAuditLogs(aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner text="Compiling institutional academic system metrics..." />;
  }

  const deptDistribution = [
    { name: 'Computer Science', count: projects.filter((p) => p.department.includes('Computer')).length },
    { name: 'Electrical Eng.', count: projects.filter((p) => p.department.includes('Electrical')).length },
    { name: 'Mechanical Eng.', count: 2 },
  ];

  const healthData = [
    { name: 'On Track', value: projects.filter((p) => p.health === 'ON_TRACK').length, color: '#2E7D32' },
    { name: 'At Risk', value: projects.filter((p) => p.health === 'AT_RISK').length, color: '#C6A15B' },
    { name: 'Critical', value: projects.filter((p) => p.health === 'CRITICAL').length, color: '#C70039' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Academic Administration"
        description="Comprehensive directorate oversight: User provisioning, guide allocations, review compliance, and audit logging"
        badge={
          <Badge variant="navy" size="sm" dot>
            Academic Directorate
          </Badge>
        }
        actions={
          <div className="flex gap-2">
            <Link to="/admin/users">
              <Button variant="gold" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/projects">
              <Button variant="outline" size="sm" leftIcon={<FolderGit2 className="w-4 h-4" />}>
                Guide Allocations
              </Button>
            </Link>
          </div>
        }
      />

      {/* Directorate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students & Guides"
          value={`${stats.totalStudents} / ${stats.totalGuides}`}
          subtitle={`${stats.totalAdmins} Institutional Administrators`}
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="Total Department Projects"
          value={stats.totalProjects}
          subtitle={`${stats.completedProjects} Completed & Archived`}
          trend="up"
          trendValue="Active"
          icon={<FolderGit2 className="w-5 h-5" />}
        />

        <StatCard
          title="Proposals Awaiting Review"
          value={stats.pendingProposals}
          subtitle="Department proposal queue"
          icon={<BookOpen className="w-5 h-5" />}
        />

        <StatCard
          title="Average Cohort Progress"
          value={`${stats.averageProgress}%`}
          subtitle="Across all departments"
          trend="up"
          trendValue="+18% this month"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader
            title="Projects by Academic Department"
            subtitle="Allocation breakdown across engineering faculties"
          />
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCB8" />
                <XAxis dataKey="name" stroke="#536482" fontSize={11} />
                <YAxis stroke="#536482" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FCFAF6', borderColor: '#DDD0B6', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#C6A15B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Health Distribution */}
        <Card>
          <CardHeader
            title="Institutional Health Matrix"
            subtitle="Schedules adhering to critical path vs at-risk milestones"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-60">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-2">
              {healthData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FDFAF5] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-[#17243B]">{item.name}</span>
                  </div>
                  <strong className="text-[#17243B]">{item.value} Projects</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Audit Trail Preview */}
      <Card>
        <CardHeader
          title="Security & Governance Audit Trail"
          subtitle="Immutable institutional event log"
          action={
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-[#C6A15B] hover:underline">
              View All Logs ({auditLogs.length})
            </Link>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User &amp; Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8D8]">
              {auditLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="hover:bg-[#FDFAF5]">
                  <td className="p-3 text-[#536482] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#17243B]">{log.userName}</div>
                    <span className="text-[10px] text-[#536482]">{log.userRole}</span>
                  </td>
                  <td className="p-3 font-semibold text-[#C6A15B]">{log.action}</td>
                  <td className="p-3 text-[#536482] max-w-sm truncate">{log.details}</td>
                  <td className="p-3 text-[#536482] font-mono text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
