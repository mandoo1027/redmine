import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createWikiPage, fetchWikiPage, updateWikiPage } from '../api/wiki';
import RichTextEditor from '../components/editor/RichTextEditor';
import AttachmentList from '../components/attachments/AttachmentList';
import PendingAttachments from '../components/attachments/PendingAttachments';
import { uploadAttachment, uploadDraftAttachment, attachmentDownloadUrl } from '../api/attachments';

export default function WikiEditPage() {
  const { projectId, slug } = useParams();
  const id = Number(projectId);
  const navigate = useNavigate();
  const isNew = slug === 'new';

  const [title, setTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [content, setContent] = useState('');
  const [pageId, setPageId] = useState<number | null>(null);
  const [error, setError] = useState('');
  // 새 문서 작성 시 저장 전까지 보류해 둘 파일들.
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isNew || !slug) return;
    fetchWikiPage(id, slug)
      .then((p) => {
        setTitle(p.title);
        setPageSlug(p.slug);
        setContent(p.content || '');
        setPageId(p.id);
      })
      .catch(() => {});
  }, [id, slug, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isNew) {
        const created = await createWikiPage(id, { slug: pageSlug, title, content });
        // 새 문서이고 보류 파일이 있으면 생성된 문서에 일괄 업로드.
        for (const f of pendingFiles) {
          try {
            await uploadAttachment('WIKI', created.id, f);
          } catch {
            /* 개별 파일 실패는 무시하고 계속 */
          }
        }
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
        <label className="mb-1 block text-sm text-gray-600">내용</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          onImageUpload={async (file) => {
            // 기존 문서 수정 시엔 서버 첨부로 업로드 후 URL 삽입,
            // 새 문서 작성 중(ID 없음)엔 draft 첨부로 업로드 후 URL 삽입.
            // 어느 경우든 base64 를 본문에 넣지 않아 본문이 가벼워진다.
            const att = pageId
              ? await uploadAttachment('WIKI', pageId, file)
              : await uploadDraftAttachment('WIKI', file);
            return attachmentDownloadUrl(att.id, true);
          }}
        />
      </div>

      <div className="mb-4 border-t pt-4">
        {isNew ? (
          <PendingAttachments files={pendingFiles} onChange={setPendingFiles} />
        ) : (
          pageId && <AttachmentList parentType="WIKI" parentId={pageId} />
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
