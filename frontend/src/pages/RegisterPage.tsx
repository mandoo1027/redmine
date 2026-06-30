import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(username, password, displayName || undefined);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-80 rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-xl font-bold text-blue-700">회원가입</h1>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>
        )}
        <label className="mb-1 block text-sm text-gray-600">아이디</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="3자 이상"
        />
        <label className="mb-1 block text-sm text-gray-600">이름 (표시명)</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="선택 (미입력 시 아이디)"
        />
        <label className="mb-1 block text-sm text-gray-600">비밀번호</label>
        <input
          type="password"
          className="mb-6 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="4자 이상"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '가입 중...' : '회원가입'}
        </button>
        <p className="mt-4 text-center text-xs text-gray-500">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
