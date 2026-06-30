import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchWikiPages } from '../api/wiki';
import type { WikiPage } from '../types';

export default function WikiListPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [pages, setPages] = useState<WikiPage[]>([]);

  useEffect(() => {
    fetchWikiPages(id).then(setPages).catch(() => {});
  }, [id]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">위키</h2>
        <Link
          to={`/projects/${id}/wiki/new/edit`}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 새 문서
        </Link>
      </div>

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
                      to={`/projects/${id}/wiki/${p.slug}`}
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
    </div>
  );
}
