import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, type IssueFilters as Filters } from '../api/issues';
import { fetchProjects } from '../api/projects';
import type { Issue, Project } from '../types';
import IssueFilters from '../components/issues/IssueFilters';
import { PriorityBadge, StatusBadge, TrackerBadge } from '../components/issues/StatusBadge';

export default function AllIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    fetchIssues(filters).then(setIssues).catch(() => {});
  }, [filters]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">전체 이슈</h1>

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
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">프로젝트</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">우선순위</th>
              <th className="px-4 py-3">담당자</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  이슈가 없습니다.
                </td>
              </tr>
            ) : (
              issues.map((i) => (
                <tr key={i.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">#{i.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{i.projectKey}</td>
                  <td className="px-4 py-3">
                    <TrackerBadge tracker={i.tracker} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${i.projectId}/issues/${i.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {i.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={i.priority} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.assigneeName || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
