import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteWikiPage, fetchWikiPage } from '../api/wiki';
import type { WikiPage } from '../types';
import MarkdownView from '../components/wiki/MarkdownView';

export default function WikiViewPage() {
  const { projectId, slug } = useParams();
  const id = Number(projectId);
  const navigate = useNavigate();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchWikiPage(id, slug)
      .then(setPage)
      .catch(() => setNotFound(true));
  }, [id, slug]);

  const handleDelete = async () => {
    if (!slug || !confirm('이 문서를 삭제하시겠습니까?')) return;
    await deleteWikiPage(id, slug);
    navigate(`/projects/${id}/wiki`);
  };

  if (notFound) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="mb-4 text-gray-500">문서를 찾을 수 없습니다.</p>
        <Link to={`/projects/${id}/wiki`} className="text-blue-600 hover:underline">
          위키 목록으로
        </Link>
      </div>
    );
  }

  if (!page) return <div className="text-gray-400">로딩 중...</div>;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{page.title}</h1>
        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/wiki/${page.slug}/edit`}
            className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
      <MarkdownView content={page.content || ''} />
    </div>
  );
}
