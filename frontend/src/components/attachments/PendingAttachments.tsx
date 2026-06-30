import { useRef, useState } from 'react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 새 글 작성 시 저장 전까지 첨부할 파일을 모아두는 컴포넌트(다중 선택/드래그 지원).
export default function PendingAttachments({ files, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = (incoming: File[]) => {
    if (incoming.length === 0) return;
    onChange([...files, ...incoming]);
  };

  const remove = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">
          첨부파일{files.length > 0 && <span className="ml-1 text-sm text-gray-400">({files.length})</span>}
        </h2>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
        >
          + 파일 추가
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            add(Array.from(e.target.files || []));
            e.target.value = '';
          }}
        />
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          add(Array.from(e.dataTransfer.files || []));
        }}
        className={`mb-2 cursor-pointer rounded-md border-2 border-dashed px-3 py-4 text-center text-xs transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50 text-blue-600'
            : 'border-gray-200 text-gray-400 hover:border-gray-300'
        }`}
      >
        파일을 끌어다 놓거나 클릭해서 첨부 (여러 개 가능, 저장 시 함께 업로드)
      </div>

      {files.length > 0 && (
        <ul className="divide-y rounded border bg-white text-sm">
          {files.map((f, idx) => (
            <li key={`${f.name}-${idx}`} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{f.name}</span>
                <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs text-red-500 hover:underline"
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
