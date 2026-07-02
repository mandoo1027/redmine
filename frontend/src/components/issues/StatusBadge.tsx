import type { IssuePriority, IssueStatus, TrackerType } from '../../types';
import { PRIORITY_LABELS, STATUS_LABELS, TRACKER_LABELS } from '../../types';

const statusColors: Record<IssueStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  // 완료(종료)는 확실히 구분되도록 진한 배지 + 체크 표시.
  CLOSED: 'bg-gray-700 text-white',
};

// 상태별 앞에 붙는 아이콘/기호. 완료는 체크로 종료를 명확히 표시.
const statusPrefix: Record<IssueStatus, string> = {
  OPEN: '',
  IN_PROGRESS: '',
  CLOSED: '✓ ',
};

const priorityColors: Record<IssuePriority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const trackerColors: Record<TrackerType, string> = {
  BUG: 'bg-red-50 text-red-700 border border-red-200',
  FEATURE: 'bg-purple-50 text-purple-700 border border-purple-200',
  TASK: 'bg-sky-50 text-sky-700 border border-sky-200',
  ERROR: 'bg-rose-100 text-rose-800 border border-rose-300',
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const label = status === 'CLOSED' ? '완료 (종료)' : STATUS_LABELS[status];
  return <Badge text={statusPrefix[status] + label} className={statusColors[status]} />;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge text={PRIORITY_LABELS[priority]} className={priorityColors[priority]} />;
}

export function TrackerBadge({ tracker }: { tracker: TrackerType }) {
  return <Badge text={TRACKER_LABELS[tracker]} className={trackerColors[tracker]} />;
}
