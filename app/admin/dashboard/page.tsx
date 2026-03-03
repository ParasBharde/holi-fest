'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRow = { id: string; name: string; created_at: string };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, countRes] = await Promise.all([fetch('/api/admin/users'), fetch('/api/user-count')]);
      if (usersRes.status === 401) {
        router.push('/admin');
        return;
      }
      const usersData = await usersRes.json();
      const countData = await countRes.json();
      setUsers(usersData.users || []);
      setCount(countData.count || 0);
      setLoading(false);
    };
    load();
  }, [router]);

  const filteredUsers = useMemo(
    () => users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-300">Track Holi participants in real-time</p>
          </div>
          <button onClick={logout} className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900">
            Logout
          </button>
        </div>

        <div className="glass mb-6 rounded-xl p-6">
          <p className="text-slate-300">Total Users</p>
          <p className="text-4xl font-extrabold text-cyan-300">{count}</p>
        </div>

        <div className="mb-4">
          <input
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300"
            placeholder="Search users by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-white/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-xs text-slate-300">{user.id}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
