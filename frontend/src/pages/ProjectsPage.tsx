import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProject, deleteProject, fetchProjects } from '../api/projects';
import type { Project } from '../types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    fetchProjects().then(setProjects).catch(() => {});
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createProject({ key, name, description });
      setKey('');
      setName('');
      setDescription('');
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '생성 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return;
    await deleteProject(id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">프로젝트</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? '취소' : '+ 새 프로젝트'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg bg-white p-5 shadow-sm">
          {error && <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">키 (고유)</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="WEB"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">이름</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="웹사이트"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm text-gray-600">설명</label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            생성
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">키</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">설명</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  프로젝트가 없습니다.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">{p.key}</td>
                  <td className="px-4 py-3">
                    <Link to={`/projects/${p.id}`} className="text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.description}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
