import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../api/projects';
import { fetchWikiPages } from '../api/wiki';
import type { Project, WikiPage } from '../types';

// 상단 "위키" 메뉴용 페이지. 위키는 프로젝트별이므로 먼저 프로젝트를 선택한 뒤
// 해당 프로젝트의 위키 문서 목록을 보여준다.
export default function WikiHomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [pages, setPages] = useState<WikiPage[]>([]);

  useEffect(() => {
    fetchProjects()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) setProjectId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (projectId == null) {
      setPages([]);
      return;
    }
    fetchWikiPages(projectId).then(setPages).catch(() => {});
  }, [projectId]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">위키</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <select
          className="rounded border px-2 py-1 text-sm"
          value={projectId ?? ''}
          onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">프로젝트 선택</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {projectId != null && (
          <Link
            to={`/projects/${projectId}/wiki/new/edit`}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 새 문서
          </Link>
        )}
      </div>

      {projectId == null ? (
        <p className="text-sm text-gray-400">프로젝트를 선택하세요.</p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">슬러그</th>
                <th className="px-4 py-3">수정자</th>
                <th className="px-4 py-3">수정일</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    문서가 없습니다.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${projectId}/wiki/${p.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500">{p.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{p.updatedByName || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.updatedAt?.slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
