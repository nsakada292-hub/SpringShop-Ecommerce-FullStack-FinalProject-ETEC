import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { userApi } from '../../api/userApi';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Search, Shield, User as UserIcon, ShieldAlert } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: User) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await userApi.updateRole(user.id, nextRole);
      success(`Updated role for ${user.name} to ${nextRole}`);
      fetchUsers();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          User & Customer Directory
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review customer accounts, grant back-office admin privileges, and manage security credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#009dff] focus:bg-white dark:focus:bg-zinc-900 rounded-xl outline-none"
          />
        </div>
        <span className="text-xs text-zinc-400">
          {filteredUsers.length} total registered accounts
        </span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-400">Loading directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gradient text-zinc-950 font-black text-xs flex items-center justify-center">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'ADMIN' ? 'success' : 'neutral'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={u.role === 'ADMIN' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleRole(u)}
                        className="text-[11px] py-1 px-3"
                      >
                        {u.role === 'ADMIN' ? (
                          <span className="text-zinc-600 dark:text-zinc-300">Demote to Customer</span>
                        ) : (
                          <span>Promote to Admin</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
