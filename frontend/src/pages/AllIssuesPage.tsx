import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createIssue, fetchIssues, updateIssueStatus, type IssueFilters as Filters } from '../api/issues';
import { fetchProjects } from '../api/projects';
import type { Issue, IssueRequest, IssueStatus, Project } from '../types';
import { STATUSES, STATUS_LABELS } from '../types';
import IssueFilters from '../components/issues/IssueFilters';
import IssueForm from '../components/issues/IssueForm';
import { PriorityBadge, TrackerBadge } from '../components/issues/StatusBadge';
import { useIssueSort, SortableTh, type SortKey } from '../hooks/useIssueSort';
import { usePersistedState } from '../hooks/usePersistedState';

export default function AllIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // 진입 시 기본은 전체 보기(필터 없음). "내 것만 보기"는 사용자가 직접 체크한다.
  // 검색 조건은 sessionStorage 에 저장해, 상세로 갔다가 뒤로 와도 유지한다.
  // 단, "내 것만 보기"(assigneeId)는 저장/복원에서 제외해 페이지 진입 시 항상 전체 보기로 시작한다.
  const [filters, setFilters] = usePersistedState<Filters>(
    'issueFilters:all',
    () => ({}),
    { omitKeys: ['assigneeId'] },
  );
  const [showForm, setShowForm] = useState(false);
  // 새 이슈를 등록할 대상 프로젝트.
  const [formProjectId, setFormProjectId] = useState<number | null>(null);
  // 페이징: 20개씩. 검색/정렬 변경 시 1페이지로 되돌린다.
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const { sorted, sortKey, sortDir, toggleSort } = useIssueSort(issues);

  // 등록일시를 'YYYY-MM-DD HH:mm' 형태로 표시.
  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

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

  // 조회는 필터 확정(검색 버튼) 또는 프로젝트 셀렉트 변경 시에만 일어난다.
  useEffect(load, [filters]);

  // "검색" 버튼으로 확정된 필터를 저장한다(프로젝트 셀렉트 값은 유지).
  const handleSearch = (next: Filters) => {
    setPage(1);
    setFilters({ ...next, projectId: filters.projectId });
  };

  // 정렬이 바뀌면 첫 페이지부터 다시 본다.
  const handleSort = (key: SortKey) => {
    setPage(1);
    toggleSort(key);
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCreate = async (payload: IssueRequest) => {
    const created = await createIssue(payload);
    setShowForm(false);
    load();
    return created;
  };

  // 목록에서 상태만 즉시 변경 (설명·해결내용 등은 서버에서 그대로 유지).
  const handleStatusChange = async (id: number, status: IssueStatus) => {
    // 낙관적 업데이트: 먼저 화면에 반영해 즉시 반응하게 한다.
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      // 서버가 반환한 최종 이슈로 행을 교체한다(진행률 등 파생 필드까지 동기화).
      const updated = await updateIssueStatus(id, status);
      setIssues((prev) => {
        const next = prev.map((i) => (i.id === id ? updated : i));
        // 상태 필터가 걸려 있고 새 상태가 필터와 맞지 않으면 목록에서 즉시 제거.
        if (filters.status && updated.status !== filters.status) {
          return next.filter((i) => i.id !== id);
        }
        return next;
      });
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
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, projectId: e.target.value ? Number(e.target.value) : undefined });
          }}
        >
          <option value="">프로젝트 전체</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <IssueFilters filters={filters} onSearch={handleSearch} />

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-gray-500">
            <tr>
              <SortableTh label="상태" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="진행률" sortKey="progress" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="#" sortKey="id" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="프로젝트" sortKey="projectKey" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="유형" sortKey="tracker" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="제목" sortKey="subject" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="우선순위" sortKey="priority" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="담당자" sortKey="assigneeName" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="검수담당자" sortKey="reviewerName" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="검수여부" sortKey="reviewed" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="등록일시" sortKey="createdAt" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-gray-400">
                  이슈가 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((i) => {
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
                            : i.status === 'INSPECTION_REQUEST'
                            ? 'border-purple-200 bg-purple-50 text-purple-700'
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
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDateTime(i.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            총 {sorted.length}건 · {currentPage}/{totalPages} 페이지
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
              .reduce<number[]>((acc, p) => {
                if (acc.length > 0 && p - acc[acc.length - 1] > 1) acc.push(-1);
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === -1 ? (
                  <span key={`gap-${idx}`} className="px-1 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded border px-3 py-1 ${
                      p === currentPage
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              다음
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
