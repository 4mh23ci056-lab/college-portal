import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, Role } from '../../types';
import { PageHeader } from '../../components/common/DisplayElements';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/FormElements';
import { LoadingSpinner } from '../../components/common/FeedbackState';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  Filter,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [enrollment, setEnrollment] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminService.getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createUser({
        name,
        email,
        username,
        role,
        department,
        enrollmentNumber: role === 'STUDENT' ? enrollment || `CS2022-${Math.floor(Math.random() * 900)}` : undefined,
      });

      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setUsername('');
      setEnrollment('');
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving institutional user directory..." />;
  }

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional User Administration"
        description="Provision students, faculty guides and academic administrators, configure roles and access permissions"
        actions={
          <Button
            variant="gold"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Provision User
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#536482]" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#536482]" />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-40"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="GUIDE">Guides</option>
            <option value="ADMIN">Administrators</option>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF5E8] border-b border-[#E6DCB8] text-[#17243B] font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3.5">User</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Identifier</th>
              <th className="p-3.5 text-right">Role Assignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE8D8]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#FDFAF5] transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-[#17243B]">{u.name}</div>
                  <span className="text-[11px] text-[#536482]">{u.email}</span>
                </td>
                <td className="p-3.5 text-[#536482]">{u.department}</td>
                <td className="p-3.5">
                  <Badge
                    variant={
                      u.role === 'ADMIN'
                        ? 'danger'
                        : u.role === 'GUIDE'
                        ? 'navy'
                        : 'gold'
                    }
                    size="sm"
                  >
                    {u.role}
                  </Badge>
                </td>
                <td className="p-3.5 text-[#536482] font-mono text-[11px]">
                  {u.enrollmentNumber || u.username}
                </td>
                <td className="p-3.5 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="text-[11px] font-bold border border-[#DDD0B6] rounded-md px-2 py-1 bg-white text-[#17243B] focus:ring-[#C6A15B]"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="GUIDE">Guide</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* PROVISION USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Institutional User"
        subtitle="Add student, faculty guide, or system administrator"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Prof. Arvind Menon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Institutional Email"
            type="email"
            placeholder="e.g. arvind.menon@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Username"
            placeholder="e.g. amenon"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Select
            label="User Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="STUDENT">Student</option>
            <option value="GUIDE">Faculty Guide</option>
            <option value="ADMIN">System Administrator</option>
          </Select>

          <Input
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />

          {role === 'STUDENT' && (
            <Input
              label="Enrollment / USN Number"
              placeholder="e.g. CS2022-099"
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" leftIcon={<UserPlus className="w-4 h-4" />}>
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
