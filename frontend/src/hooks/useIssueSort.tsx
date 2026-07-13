import { useMemo, useState } from 'react';
import type { Issue, IssuePriority, IssueStatus } from '../types';

// 정렬 가능한 컬럼 키.
export type SortKey =
  | 'status'
  | 'progress'
  | 'id'
  | 'projectKey'
  | 'tracker'
  | 'subject'
  | 'priority'
  | 'assigneeName'
  | 'dueDate'
  | 'reviewerName'
  | 'reviewed';

type SortDir = 'asc' | 'desc';

// enum 은 정의된 순서대로 정렬되도록 순위를 매긴다.
const STATUS_ORDER: Record<IssueStatus, number> = { OPEN: 0, IN_PROGRESS: 1, CLOSED: 2 };
const PRIORITY_ORDER: Record<IssuePriority, number> = { LOW: 0, NORMAL: 1, HIGH: 2, URGENT: 3 };

// 각 컬럼에서 비교에 사용할 값을 추출한다.
function sortValue(issue: Issue, key: SortKey): number | string {
  switch (key) {
    case 'status':
      return STATUS_ORDER[issue.status];
    case 'priority':
      return PRIORITY_ORDER[issue.priority];
    case 'progress':
      return issue.progress;
    case 'id':
      return issue.id;
    case 'reviewed':
      return issue.reviewed ? 1 : 0;
    case 'projectKey':
      return issue.projectKey || '';
    case 'tracker':
      return issue.tracker;
    case 'subject':
      return issue.subject || '';
    case 'assigneeName':
      return issue.assigneeName || '';
    case 'dueDate':
      return issue.dueDate || '';
    case 'reviewerName':
      return issue.reviewerName || '';
    default:
      return '';
  }
}

// 이슈 목록에 헤더 클릭 정렬 기능을 제공하는 훅.
export function useIssueSort(issues: Issue[]) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // 같은 컬럼을 다시 누르면 오름/내림 토글, 다른 컬럼이면 오름차순부터.
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return issues;
    const arr = [...issues];
    arr.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), 'ko');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [issues, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggleSort };
}

// 정렬 가능한 테이블 헤더 셀. 클릭하면 해당 컬럼으로 정렬한다.
export function SortableTh({
  label,
  sortKey: colKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === colKey;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 hover:text-gray-700"
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`text-xs ${active ? 'text-blue-600' : 'text-gray-300'}`}>
          {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </span>
    </th>
  );
}
