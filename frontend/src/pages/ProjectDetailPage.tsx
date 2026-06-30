import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { fetchProject } from '../api/projects';
import type { Project } from '../types';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProject(id).then(setProject).catch(() => {});
  }, [id]);

  const base = `/projects/${id}`;
  const tabs = [
    { to: base, label: '개요', exact: true },
    { to: `${base}/issues`, label: '이슈' },
    { to: `${base}/gantt`, label: '간트차트' },
    { to: `${base}/wiki`, label: '위키' },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div>
      <div className="mb-4">
        <Link to="/projects" className="text-sm text-blue-600 hover:underline">
          ← 프로젝트 목록
        </Link>
      </div>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">
        {project ? (
          <>
            <span className="font-mono text-gray-400">[{project.key}]</span> {project.name}
          </>
        ) : (
          '로딩 중...'
        )}
      </h1>
      {project?.description && <p className="mb-4 text-gray-500">{project.description}</p>}

      <div className="mb-6 flex gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              isActive(t.to, t.exact)
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Outlet context={{ project }} />
    </div>
  );
}
