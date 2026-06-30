import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TRACKERS,
  TRACKER_LABELS,
} from '../../types';
import type { IssueFilters as Filters } from '../../api/issues';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function IssueFilters({ filters, onChange }: Props) {
  const select = 'rounded border px-2 py-1 text-sm';

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <select
        className={select}
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
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
        value={filters.priority || ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined })}
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
        value={filters.tracker || ''}
        onChange={(e) => onChange({ ...filters, tracker: e.target.value || undefined })}
      >
        <option value="">유형 전체</option>
        {TRACKERS.map((t) => (
          <option key={t} value={t}>
            {TRACKER_LABELS[t]}
          </option>
        ))}
      </select>
    </div>
  );
}
