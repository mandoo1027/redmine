import { useEffect, useState } from 'react';
import { createComment, deleteComment, listComments } from '../../api/comments';
import type { Comment } from '../../types';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  issueId: number;
}

export default function CommentSection({ issueId }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    listComments(issueId).then(setComments).catch(() => {});
  };

  useEffect(load, [issueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createComment(issueId, content.trim());
      setContent('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || '댓글 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    await deleteComment(id);
    load();
  };

  return (
    <div>
      <h2 className="mb-3 font-semibold text-gray-700">
        댓글{comments.length > 0 && <span className="ml-1 text-sm text-gray-400">({comments.length})</span>}
      </h2>

      {comments.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {comments.map((c) => {
            const canDelete = isAdmin || (user && c.authorId === user.id);
            return (
              <li key={c.id} className="rounded border bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{c.authorName || '알 수 없음'}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{c.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        {error && <div className="mb-2 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <textarea
          className="w-full rounded border px-3 py-2 text-sm"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <div className="mt-2">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </form>
    </div>
  );
}
