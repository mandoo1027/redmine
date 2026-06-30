import { useEffect, useState } from 'react';
import axios from 'axios';
import { createUser, deleteUser, listUsers, updateUser } from '../api/users';
import { useAuth } from '../auth/AuthContext';
import type { Role, User } from '../types';

interface FormState {
  username: string;
  displayName: string;
  password: string;
  role: Role;
}

const emptyForm: FormState = { username: '', displayName: '', password: '', role: 'USER' };

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 추가 폼
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);

  // 인라인 수정
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ displayName: string; role: Role; password: string }>({
    displayName: '',
    role: 'USER',
    password: '',
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  const load = () => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch(() => setError('사용자 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const errMsg = (err: unknown, fallback: string) =>
    axios.isAxiosError(err) && err.response?.data?.message ? err.response.data.message : fallback;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createUser({
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
        role: form.role,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(errMsg(err, '사용자 생성에 실패했습니다.'));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (u: User) => {
    setEditId(u.id);
    setEditForm({ displayName: u.displayName ?? '', role: u.role, password: '' });
    setError('');
  };

  const handleUpdate = async (id: number) => {
    setError('');
    try {
      await updateUser(id, {
        displayName: editForm.displayName || undefined,
        role: editForm.role,
        password: editForm.password || undefined,
      });
      setEditId(null);
      load();
    } catch (err) {
      setError(errMsg(err, '수정에 실패했습니다.'));
    }
  };

  const handleDelete = async (u: User) => {
    if (!window.confirm(`'${u.username}' 계정을 삭제할까요?`)) return;
    setError('');
    try {
      await deleteUser(u.id);
      load();
    } catch (err) {
      setError(errMsg(err, '삭제에 실패했습니다.'));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-800">사용자 관리</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>
      )}

      {/* 추가 폼 */}
      <form
        onSubmit={handleCreate}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs text-gray-500">아이디</label>
          <input
            className="w-36 rounded border px-2 py-1 text-sm"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">이름</label>
          <input
            className="w-36 rounded border px-2 py-1 text-sm"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">비밀번호</label>
          <input
            type="password"
            className="w-36 rounded border px-2 py-1 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">역할</label>
          <select
            className="rounded border px-2 py-1 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="USER">일반</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? '추가 중...' : '사용자 추가'}
        </button>
      </form>

      {/* 목록 */}
      {loading ? (
        <div className="text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border bg-white text-sm shadow-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">아이디</th>
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">역할</th>
              <th className="px-4 py-2 text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isLastAdmin = u.role === 'ADMIN' && adminCount <= 1;
              const isSelf = me?.id === u.id;
              return (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2 font-medium text-gray-800">{u.username}</td>
                  {editId === u.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          className="w-32 rounded border px-2 py-1 text-sm"
                          value={editForm.displayName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, displayName: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="rounded border px-2 py-1 text-sm"
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm({ ...editForm, role: e.target.value as Role })
                          }
                        >
                          <option value="USER">일반</option>
                          <option value="ADMIN">관리자</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="password"
                            placeholder="새 비밀번호(선택)"
                            className="w-36 rounded border px-2 py-1 text-sm"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm({ ...editForm, password: e.target.value })
                            }
                          />
                          <button
                            onClick={() => handleUpdate(u.id)}
                            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                          >
                            취소
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-gray-700">{u.displayName || '-'}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role === 'ADMIN' ? '관리자' : '일반'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isSelf || isLastAdmin}
                            title={
                              isSelf
                                ? '본인 계정은 삭제할 수 없습니다'
                                : isLastAdmin
                                  ? '마지막 관리자는 삭제할 수 없습니다'
                                  : ''
                            }
                            className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
