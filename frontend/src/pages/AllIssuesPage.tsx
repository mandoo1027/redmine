import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createIssue, fetchIssues, type IssueFilters as Filters } from '../api/issues';
import { fetchProjects } from '../api/projects';
import type { Issue, IssueRequest, Project } from '../types';
import IssueFilters from '../components/issues/IssueFilters';
import IssueForm from '../components/issues/IssueForm';
import { PriorityBadge, StatusBadge, TrackerBadge } from '../components/issues/StatusBadge';
import { useAuth } from '../auth/AuthContext';

export default function AllIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // 진입 시 기본으로 "내 것만 보기" 체크 상태로 시작 (로그인 사용자 담당 이슈).
  const [filters, setFilters] = useState<Filters>(() => (user ? { assigneeId: user.id } : {}));
  const [showForm, setShowForm] = useState(false);
  // 새 이슈를 등록할 대상 프로젝트.
  const [formProjectId, setFormProjectId] = useState<number | null>(null);

  const load = () => {
    fetchIssues(filters).then(setIssues).catch(() => {});
  };

  useEffect(() => {
    fetchProjects()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) setFormProjectId((prev) => prev ?? list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(load, [filters]);

  const handleCreate = async (payload: IssueRequest) => {
    const created = await createIssue(payload);
    setShowForm(false);
    load();
    return created;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">전체 이슈</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={projects.length === 0}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {showForm ? '취소' : '+ 새 이슈'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <label className="text-sm text-gray-600">프로젝트</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={formProjectId ?? ''}
              onChange={(e) => setFormProjectId(e.target.value ? Number(e.target.value) : null)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {formProjectId != null && (
            <IssueForm
              key={formProjectId}
              projectId={formProjectId}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded border px-2 py-1 text-sm"
          value={filters.projectId || ''}
          onChange={(e) =>
            setFilters({ ...filters, projectId: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">프로젝트 전체</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <IssueFilters filters={filters} onChange={setFilters} />

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">프로젝트</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">우선순위</th>
              <th className="px-4 py-3">담당자</th>
              <th className="px-4 py-3">진행률</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  이슈가 없습니다.
                </td>
              </tr>
            ) : (
              issues.map((i) => {
                const closed = i.status === 'CLOSED';
                return (
                  <tr
                    key={i.id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${
                      closed ? 'bg-gray-50 text-gray-400' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">#{i.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{i.projectKey}</td>
                    <td className="px-4 py-3">
                      <TrackerBadge tracker={i.tracker} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${i.projectId}/issues/${i.id}`}
                        className={`hover:underline ${
                          closed ? 'text-gray-500 line-through' : 'text-blue-600'
                        }`}
                      >
                        {i.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={i.priority} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{i.assigneeName || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full ${
                              i.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${i.progress}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs text-gray-500">{i.progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
