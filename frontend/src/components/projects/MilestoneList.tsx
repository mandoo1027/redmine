import { useEffect, useState } from 'react';
import { createMilestone, deleteMilestone, fetchMilestones } from '../../api/milestones';
import type { Milestone } from '../../types';
import DateField from '../common/DateField';

export default function MilestoneList({ projectId }: { projectId: number }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');

  const load = () => {
    fetchMilestones(projectId).then(setMilestones).catch(() => {});
  };

  useEffect(load, [projectId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await createMilestone(projectId, { name, dueDate: dueDate || undefined });
    setName('');
    setDueDate('');
    load();
  };

  const handleDelete = async (id: number) => {
    await deleteMilestone(id);
    load();
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold text-gray-700">마일스톤</h2>
      <ul className="mb-4 space-y-2">
        {milestones.length === 0 && (
          <li className="text-sm text-gray-400">마일스톤이 없습니다.</li>
        )}
        {milestones.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <span>
              {m.name} {m.dueDate && <span className="text-gray-400">({m.dueDate})</span>}
            </span>
            <button
              onClick={() => handleDelete(m.id)}
              className="text-xs text-red-500 hover:underline"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="마일스톤 이름"
        />
        <DateField value={dueDate} onChange={setDueDate} />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
          추가
        </button>
      </form>
    </div>
  );
}
