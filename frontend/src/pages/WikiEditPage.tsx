import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createWikiPage, fetchWikiPage, updateWikiPage } from '../api/wiki';
import MarkdownView from '../components/wiki/MarkdownView';

export default function WikiEditPage() {
  const { projectId, slug } = useParams();
  const id = Number(projectId);
  const navigate = useNavigate();
  const isNew = slug === 'new';

  const [title, setTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (isNew || !slug) return;
    fetchWikiPage(id, slug)
      .then((p) => {
        setTitle(p.title);
        setPageSlug(p.slug);
        setContent(p.content || '');
      })
      .catch(() => {});
  }, [id, slug, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isNew) {
        await createWikiPage(id, { slug: pageSlug, title, content });
      } else {
        await updateWikiPage(id, slug!, { slug: pageSlug, title, content });
      }
      navigate(`/projects/${id}/wiki/${pageSlug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    }
  };

  const input = 'w-full rounded border px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-bold text-gray-800">
        {isNew ? '새 문서' : '문서 수정'}
      </h1>
      {error && <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">제목</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">슬러그 (URL)</label>
          <input
            className={input}
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value)}
            placeholder="home"
            required
            disabled={!isNew}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-gray-600">내용 (마크다운)</label>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {preview ? '편집' : '미리보기'}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[200px] rounded border p-3">
            <MarkdownView content={content} />
          </div>
        ) : (
          <textarea
            className={`${input} font-mono`}
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => navigate(`/projects/${id}/wiki`)}
          className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}
