import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';
import type { Issue } from '../../types';

interface Props {
  issues: Issue[];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function GanttChart({ issues }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const tasks = issues
      .filter((i) => i.startDate || i.dueDate)
      .map((i) => {
        const start = i.startDate || i.dueDate!;
        const end = i.dueDate || addDays(i.startDate!, 1);
        return {
          id: String(i.id),
          name: `#${i.id} ${i.subject}`,
          start,
          end,
          progress: i.progress || 0,
          custom_class: `tracker-${i.tracker.toLowerCase()}`,
        };
      });

    // Clear previous render
    ref.current.innerHTML = '';

    if (tasks.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-new
    new Gantt(ref.current, tasks, {
      view_mode: 'Day',
      bar_height: 24,
      padding: 18,
    });
  }, [issues]);

  const hasData = issues.some((i) => i.startDate || i.dueDate);

  return (
    <div className="overflow-auto rounded-lg bg-white p-4 shadow-sm">
      {!hasData && (
        <p className="py-8 text-center text-sm text-gray-400">
          시작일 또는 마감일이 설정된 이슈가 없습니다.
        </p>
      )}
      <svg ref={ref}></svg>
    </div>
  );
}
