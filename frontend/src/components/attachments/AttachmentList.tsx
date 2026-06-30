import { useEffect, useRef, useState } from 'react';
import {
  attachmentDownloadUrl,
  deleteAttachment,
  listAttachments,
  uploadAttachment,
  type Attachment,
  type ParentType,
} from '../../api/attachments';

interface Props {
  parentType: ParentType;
  parentId: number;
  editable?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ parentType, parentId, editable = true }: Props) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    listAttachments(parentType, parentId)
      .then(setItems)
      .catch(() => {});
  };

  useEffect(load, [parentType, parentId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await uploadAttachment(parentType, parentId, file);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return;
    await deleteAttachment(id);
    load();
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">첨부파일</h2>
        {editable && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : '+ 파일 추가'}
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          </>
        )}
      </div>
      {error && <div className="mb-2 rounded bg-red-50 p-2 text-xs text-red-700">{error}</div>}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">첨부된 파일이 없습니다.</p>
      ) : (
        <ul className="divide-y rounded border bg-white text-sm">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <a
                  href={attachmentDownloadUrl(a.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {a.originalName}
                </a>
                <span className="text-xs text-gray-400">
                  {formatSize(a.fileSize)}
                  {a.uploadedByName ? ` · ${a.uploadedByName}` : ''}
                </span>
              </div>
              {editable && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
