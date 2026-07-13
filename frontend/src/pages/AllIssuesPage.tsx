import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createIssue, fetchIssues, updateIssueStatus, type IssueFilters as Filters } from '../api/issues';
import { fetchProjects } from '../api/projects';
import type { Issue, IssueRequest, IssueStatus, Project } from '../types';
import { STATUSES, STATUS_LABELS } from '../types';
import IssueFilters from '../components/issues/IssueFilters';
import IssueForm from '../components/issues/IssueForm';
import { PriorityBadge, TrackerBadge } from '../components/issues/StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { useIssueSort, SortableTh } from '../hooks/useIssueSort';
import { usePersistedState } from '../hooks/usePersistedState';

export default function AllIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // 진입 시 기본으로 "내 것만 보기" 체크 상태로 시작 (로그인 사용자 담당 이슈).
  // 검색 조건은 sessionStorage 에 저장해, 상세로 갔다가 뒤로 와도 유지한다.
  const [filters, setFilters] = usePersistedState<Filters>(
    'issueFilters:all',
    () => (user ? { assigneeId: user.id } : {}),
  );
  const [showForm, setShowForm] = useState(false);
  // 새 이슈를 등록할 대상 프로젝트.
  const [formProjectId, setFormProjectId] = useState<number | null>(null);

  const { sorted, sortKey, sortDir, toggleSort } = useIssueSort(issues);

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

  // 목록에서 상태만 즉시 변경 (설명·해결내용 등은 서버에서 그대로 유지).
  const handleStatusChange = async (id: number, status: IssueStatus) => {
    // 낙관적 업데이트: 먼저 화면에 반영하고, 실패 시 다시 로드.
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await updateIssueStatus(id, status);
    } catch {
      load();
    }
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
              <SortableTh label="상태" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="진행률" sortKey="progress" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="#" sortKey="id" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="프로젝트" sortKey="projectKey" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="유형" sortKey="tracker" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="제목" sortKey="subject" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="우선순위" sortKey="priority" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="담당자" sortKey="assigneeName" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="검수담당자" sortKey="reviewerName" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="검수여부" sortKey="reviewed" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-400">
                  이슈가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((i) => {
                const closed = i.status === 'CLOSED';
                return (
                  <tr
                    key={i.id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${
                      closed ? 'bg-gray-50 text-gray-400' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <select
                        value={i.status}
                        onChange={(e) => handleStatusChange(i.id, e.target.value as IssueStatus)}
                        className={`rounded border px-2 py-1 text-xs font-medium focus:outline-none ${
                          i.status === 'CLOSED'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : i.status === 'IN_PROGRESS'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
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
                    <td className="px-4 py-3 text-gray-600">{i.reviewerName || '-'}</td>
                    <td className="px-4 py-3">
                      {i.reviewed ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          예
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          아니요
                        </span>
                      )}
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
