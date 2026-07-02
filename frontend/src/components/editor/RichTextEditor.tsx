import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useDialog } from '../ui/DialogProvider';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onImageUpload,
}: {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const { alert } = useDialog();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onImageUpload) return;
    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      await alert('이미지 업로드에 실패했습니다.', { title: '오류' });
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-2 py-1">
      <ToolbarButton
        title="굵게"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        title="기울임"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        title="제목 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        title="제목 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="글머리 기호"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • 목록
      </ToolbarButton>
      <ToolbarButton
        title="번호 매기기"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. 목록
      </ToolbarButton>
      <ToolbarButton
        title="인용"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolbarButton>
      <ToolbarButton
        title="코드 블록"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {'</>'}
      </ToolbarButton>
      <ToolbarButton title="링크" active={editor.isActive('link')} onClick={setLink}>
        🔗
      </ToolbarButton>
      {onImageUpload && (
        <>
          <ToolbarButton title="이미지" onClick={() => fileRef.current?.click()}>
            🖼
          </ToolbarButton>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />
        </>
      )}
    </div>
  );
}

export default function RichTextEditor({ value, onChange, onImageUpload, placeholder }: Props) {
  const { alert } = useDialog();
  // 드롭/붙여넣기 핸들러에서 항상 최신 editor·업로더를 참조하기 위한 ref.
  const editorRef = useRef<Editor | null>(null);
  const uploadRef = useRef(onImageUpload);
  uploadRef.current = onImageUpload;

  const insertImageFile = async (file: File) => {
    const uploader = uploadRef.current;
    const ed = editorRef.current;
    if (!uploader || !ed) return;
    try {
      const url = await uploader(file);
      ed.chain().focus().setImage({ src: url }).run();
    } catch {
      await alert('이미지 업로드에 실패했습니다.', { title: '오류' });
    }
  };

  const imageFilesFrom = (list?: FileList | null) =>
    Array.from(list || []).filter((f) => f.type.startsWith('image/'));

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose-sm min-h-[200px] max-w-none px-3 py-2 text-sm leading-relaxed text-gray-800 focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
      // 이미지 파일을 에디터에 드롭하면 업로드 후 삽입.
      handleDrop: (_view, event) => {
        const files = imageFilesFrom((event as DragEvent).dataTransfer?.files);
        if (files.length === 0 || !uploadRef.current) return false;
        event.preventDefault();
        files.forEach((f) => insertImageFile(f));
        return true;
      },
      // 클립보드 이미지를 붙여넣으면(Ctrl+V) 업로드 후 삽입.
      handlePaste: (_view, event) => {
        const files = imageFilesFrom((event as ClipboardEvent).clipboardData?.files);
        if (files.length === 0 || !uploadRef.current) return false;
        event.preventDefault();
        files.forEach((f) => insertImageFile(f));
        return true;
      },
    },
  });

  editorRef.current = editor;

  // 외부에서 초기값이 비동기로 들어오는 경우(수정 화면)에만 동기화.
  // 사용자가 편집 중(포커스 상태)이면 덮어쓰지 않음 → 입력 중 커서 리셋 방지.
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rounded border bg-white">
      <Toolbar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} />
    </div>
  );
}
