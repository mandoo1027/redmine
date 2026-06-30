import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-80 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="mb-6 text-center text-xl font-bold text-blue-700">Redmine Clone</h1>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>
        )}
        <label className="mb-1 block text-sm text-gray-600">아이디</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label className="mb-1 block text-sm text-gray-600">비밀번호</label>
        <input
          type="password"
          className="mb-6 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
        <p className="mt-4 text-center text-xs text-gray-400">기본 계정: admin / admin</p>
      </form>
    </div>
  );
}
