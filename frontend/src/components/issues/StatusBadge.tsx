import type { IssuePriority, IssueStatus, TrackerType } from '../../types';

const statusColors: Record<IssueStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-200 text-gray-600',
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
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge text={status} className={statusColors[status]} />;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge text={priority} className={priorityColors[priority]} />;
}

export function TrackerBadge({ tracker }: { tracker: TrackerType }) {
  return <Badge text={tracker} className={trackerColors[tracker]} />;
}
