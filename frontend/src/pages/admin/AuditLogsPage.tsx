import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import { PageHeader } from '../../components/common/DisplayElements';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Select, Input } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import { History, Search, Shield, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await adminService.getAuditLogs();
      setLogs(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving immutable security audit trails..." />;
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Security & Audit Trail"
        description="Immutable governance log: Authentication events, proposal transitions, evaluation submissions and role alterations"
        badge={
          <Badge variant="navy" size="sm" dot>
            {logs.length} Total Audit Records
          </Badge>
        }
      />

      {/* Filter Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by user, action, details, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#536482]" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#536482]" />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-44"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">Authentication</option>
            <option value="PROPOSAL">Proposals</option>
            <option value="TASK">Tasks & Deliverables</option>
            <option value="EVALUATION">Evaluations</option>
            <option value="SYSTEM">System & Guides</option>
            <option value="SECURITY">Security & Roles</option>
          </Select>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Event Details</th>
              <th className="p-3.5">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE8D8]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#FDFAF5] transition-colors">
                <td className="p-3.5 text-[#536482] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3.5 font-bold text-[#17243B]">{log.userName}</td>
                <td className="p-3.5">
                  <Badge variant="ivory" size="sm">
                    {log.userRole}
                  </Badge>
                </td>
                <td className="p-3.5">
                  <Badge
                    variant={
                      log.category === 'SECURITY' || log.category === 'AUTH'
                        ? 'danger'
                        : log.category === 'EVALUATION'
                        ? 'gold'
                        : 'navy'
                    }
                    size="sm"
                  >
                    {log.category}
                  </Badge>
                </td>
                <td className="p-3.5 font-bold text-[#17243B]">{log.action}</td>
                <td className="p-3.5 text-[#536482] max-w-md">{log.details}</td>
                <td className="p-3.5 font-mono text-[11px] text-[#536482]">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
