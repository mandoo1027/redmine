import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../api/projects';
import { fetchIssues } from '../api/issues';
import type { Issue, Project } from '../types';
import { PriorityBadge, StatusBadge } from '../components/issues/StatusBadge';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {});
    fetchIssues().then(setIssues).catch(() => {});
  }, []);

  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const closedCount = issues.filter((i) => i.status === 'CLOSED').length;

  const stat = (label: string, value: number, color: string) => (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">대시보드</h1>
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stat('프로젝트', projects.length, 'text-blue-600')}
        {stat('열림', openCount, 'text-green-600')}
        {stat('진행중', inProgressCount, 'text-yellow-600')}
        {stat('완료', closedCount, 'text-gray-500')}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">프로젝트</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400">프로젝트가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    [{p.key}] {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">최근 이슈</h2>
          {issues.length === 0 ? (
            <p className="text-sm text-gray-400">이슈가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {issues.slice(0, 8).map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-sm">
                  <StatusBadge status={i.status} />
                  <PriorityBadge priority={i.priority} />
                  <Link
                    to={`/projects/${i.projectId}/issues/${i.id}`}
                    className="text-gray-700 hover:underline"
                  >
                    {i.subject}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
