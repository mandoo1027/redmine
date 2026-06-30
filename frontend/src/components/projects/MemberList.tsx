import { useEffect, useState } from 'react';
import { addMember, fetchMembers, removeMember } from '../../api/projects';
import { fetchUsers } from '../../api/auth';
import type { ProjectMember, User } from '../../types';

export default function MemberList({ projectId }: { projectId: number }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('member');

  const load = () => {
    fetchMembers(projectId).then(setMembers).catch(() => {});
  };

  useEffect(() => {
    load();
    fetchUsers().then(setUsers).catch(() => {});
  }, [projectId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await addMember(projectId, { userId: Number(selectedUser), role });
    setSelectedUser('');
    load();
  };

  const handleRemove = async (userId: number) => {
    await removeMember(projectId, userId);
    load();
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold text-gray-700">멤버</h2>
      <ul className="mb-4 space-y-2">
        {members.length === 0 && <li className="text-sm text-gray-400">멤버가 없습니다.</li>}
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <span>
              {m.displayName || m.username}{' '}
              <span className="text-gray-400">({m.role})</span>
            </span>
            <button
              onClick={() => handleRemove(m.userId)}
              className="text-xs text-red-500 hover:underline"
            >
              제거
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <select
          className="flex-1 rounded border px-2 py-1 text-sm"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">사용자 선택</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName || u.username}
            </option>
          ))}
        </select>
        <input
          className="w-28 rounded border px-2 py-1 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="역할"
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
          추가
        </button>
      </form>
    </div>
  );
}
