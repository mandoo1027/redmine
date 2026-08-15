import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TRACKERS,
  TRACKER_LABELS,
} from '../../types';
import { useEffect, useState } from 'react';
import type { IssueFilters as Filters } from '../../api/issues';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  filters: Filters;
  // "검색" 버튼을 누를 때만 실제 조회가 일어나도록, 확정된 필터를 상위로 올린다.
  onSearch: (filters: Filters) => void;
}

export default function IssueFilters({ filters, onSearch }: Props) {
  const select = 'rounded border px-2 py-1 text-sm';
  const input = 'rounded border px-2 py-1 text-sm';
  const { user } = useAuth();
  // 입력 중인 값은 로컬 draft 로만 들고 있다가, "검색" 버튼을 누를 때 상위로 확정한다.
  const [draft, setDraft] = useState<Filters>(filters);

  // 상위 filters 가 외부(예: 세션 복원)로 바뀌면 draft 도 동기화한다.
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  // 현재 담당자 필터가 내 계정으로 지정되어 있으면 "내 것만 보기" 체크 상태.
  const mineOnly = user != null && draft.assigneeId === user.id;
  // 검수 담당자 필터가 내 계정으로 지정되어 있으면 "검수 내 것만 보기" 체크 상태.
  const reviewMineOnly = user != null && draft.reviewerId === user.id;

  const toggleMine = (checked: boolean) => {
    if (!user) return;
    setDraft({ ...draft, assigneeId: checked ? user.id : undefined });
  };

  const toggleReviewMine = (checked: boolean) => {
    if (!user) return;
    setDraft({ ...draft, reviewerId: checked ? user.id : undefined });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(draft);
  };

  const reset = () => {
    const empty: Filters = {};
    setDraft(empty);
    onSearch(empty);
  };

  return (
    <form onSubmit={submit} className="mb-4 flex flex-wrap items-center gap-3">
      <select
        className={select}
        value={draft.status || ''}
        onChange={(e) => setDraft({ ...draft, status: e.target.value || undefined })}
      >
        <option value="">상태 전체</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        className={select}
        value={draft.priority || ''}
        onChange={(e) => setDraft({ ...draft, priority: e.target.value || undefined })}
      >
        <option value="">우선순위 전체</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>
      <select
        className={select}
        value={draft.tracker || ''}
        onChange={(e) => setDraft({ ...draft, tracker: e.target.value || undefined })}
      >
        <option value="">유형 전체</option>
        {TRACKERS.map((t) => (
          <option key={t} value={t}>
            {TRACKER_LABELS[t]}
          </option>
        ))}
      </select>
      <input
        type="text"
        className={input}
        placeholder="제목 검색"
        value={draft.subject || ''}
        onChange={(e) => setDraft({ ...draft, subject: e.target.value || undefined })}
      />
      <input
        type="text"
        className={input}
        placeholder="텍스트 검색(제목·내용)"
        value={draft.text || ''}
        onChange={(e) => setDraft({ ...draft, text: e.target.value || undefined })}
      />
      <input
        type="text"
        className={input}
        placeholder="담당자 이름 검색"
        value={draft.assigneeName || ''}
        onChange={(e) => setDraft({ ...draft, assigneeName: e.target.value || undefined })}
      />
      <input
        type="text"
        className={input}
        placeholder="검수 담당자 이름 검색"
        value={draft.reviewerName || ''}
        onChange={(e) => setDraft({ ...draft, reviewerName: e.target.value || undefined })}
      />
      {user && (
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={mineOnly}
            onChange={(e) => toggleMine(e.target.checked)}
          />
          내 것만 보기
        </label>
      )}
      {user && (
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={reviewMineOnly}
            onChange={(e) => toggleReviewMine(e.target.checked)}
          />
          검수 내 것만 보기
        </label>
      )}
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        검색
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded border px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        초기화
      </button>
    </form>
  );
}
