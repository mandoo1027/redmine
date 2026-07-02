import { useEffect, useRef, useState } from 'react';
import {
  attachmentDownloadUrl,
  deleteAttachment,
  listAttachments,
  uploadAttachment,
  type Attachment,
  type ParentType,
} from '../../api/attachments';
import { useDialog } from '../ui/DialogProvider';
import LoadingOverlay from '../ui/LoadingOverlay';

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
  const { confirm } = useDialog();
  const [items, setItems] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    listAttachments(parentType, parentId)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [parentType, parentId]);

  // 여러 파일을 순차 업로드한다(실패한 파일은 메시지로 모아 표시).
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError('');
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadAttachment(parentType, parentId, files[i]);
      } catch (err: any) {
        failed.push(files[i].name);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setUploading(false);
    setProgress(null);
    if (failed.length > 0) {
      setError(`업로드 실패: ${failed.join(', ')}`);
    }
    load();
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    uploadFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!editable || uploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    uploadFiles(files);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('이 첨부파일을 삭제하시겠습니까?', { title: '첨부파일 삭제', danger: true }))) return;
    setLoading(true);
    await deleteAttachment(id);
    load();
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">
          첨부파일{items.length > 0 && <span className="ml-1 text-sm text-gray-400">({items.length})</span>}
        </h2>
        {editable && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {uploading && progress
                ? `업로드 중 ${progress.done}/${progress.total}`
                : '+ 파일 추가'}
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleSelect}
            />
          </>
        )}
      </div>

      {error && <div className="mb-2 rounded bg-red-50 p-2 text-xs text-red-700">{error}</div>}

      {editable && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mb-2 cursor-pointer rounded-md border-2 border-dashed px-3 py-4 text-center text-xs transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 text-blue-600'
              : 'border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          파일을 끌어다 놓거나 클릭해서 첨부 (여러 개 가능)
        </div>
      )}

      <div className="relative min-h-[40px]">
        <LoadingOverlay
          show={loading || uploading}
          label={
            uploading && progress
              ? `업로드 중 ${progress.done}/${progress.total}`
              : '불러오는 중...'
          }
        />
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
    </div>
  );
}
