import { useEffect, useState } from 'react';
import { fetchUsers } from '../../api/auth';
import { fetchMilestones } from '../../api/milestones';
import {
  PRIORITIES,
  STATUSES,
  TRACKERS,
  type Issue,
  type IssueRequest,
  type Milestone,
  type User,
} from '../../types';

interface Props {
  projectId: number;
  initial?: Issue;
  onSubmit: (payload: IssueRequest) => Promise<void>;
  onCancel: () => void;
}

export default function IssueForm({ projectId, initial, onSubmit, onCancel }: Props) {
  const [subject, setSubject] = useState(initial?.subject || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [tracker, setTracker] = useState(initial?.tracker || 'TASK');
  const [status, setStatus] = useState(initial?.status || 'OPEN');
  const [priority, setPriority] = useState(initial?.priority || 'NORMAL');
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId?.toString() || '');
  const [milestoneId, setMilestoneId] = useState(initial?.milestoneId?.toString() || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [progress, setProgress] = useState(initial?.progress ?? 0);
  const [users, setUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => {});
    fetchMilestones(projectId).then(setMilestones).catch(() => {});
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        projectId,
        subject,
        description,
        tracker: tracker as IssueRequest['tracker'],
        status: status as IssueRequest['status'],
        priority: priority as IssueRequest['priority'],
        assigneeId: assigneeId ? Number(assigneeId) : null,
        milestoneId: milestoneId ? Number(milestoneId) : null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        progress: Number(progress),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    }
  };

  const label = 'mb-1 block text-sm text-gray-600';
  const input = 'w-full rounded border px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-sm">
      {error && <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="mb-4">
        <label className={label}>제목</label>
        <input className={input} value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className={label}>설명</label>
        <textarea
          className={input}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className={label}>유형</label>
          <select className={input} value={tracker} onChange={(e) => setTracker(e.target.value as any)}>
            {TRACKERS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>상태</label>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>우선순위</label>
          <select className={input} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className={label}>담당자</label>
          <select className={input} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">미지정</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.username}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>마일스톤</label>
          <select className={input} value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
            <option value="">없음</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className={label}>시작일</label>
          <input
            type="date"
            className={input}
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>마감일</label>
          <input
            type="date"
            className={input}
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>진행률 ({progress}%)</label>
          <input
            type="range"
            min={0}
            max={100}
            className="w-full"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}
