import { useEffect, useState } from 'react';
import { fetchUsers } from '../../api/auth';
import { fetchMilestones } from '../../api/milestones';
import RichTextEditor from '../editor/RichTextEditor';
import DateField from '../common/DateField';
import AttachmentList from '../attachments/AttachmentList';
import PendingAttachments from '../attachments/PendingAttachments';
import { uploadAttachment, uploadDraftAttachment, attachmentDownloadUrl } from '../../api/attachments';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  TRACKERS,
  TRACKER_LABELS,
  type Issue,
  type IssueRequest,
  type Milestone,
  type User,
} from '../../types';

interface Props {
  projectId: number;
  initial?: Issue;
  // 새 이슈 생성 시 보류 첨부 업로드를 위해 생성된 Issue 를 반환할 수 있다.
  onSubmit: (payload: IssueRequest) => Promise<Issue | void>;
  onCancel: () => void;
}

export default function IssueForm({ projectId, initial, onSubmit, onCancel }: Props) {
  const [subject, setSubject] = useState(initial?.subject || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [resolution, setResolution] = useState(initial?.resolution || '');
  const [tracker, setTracker] = useState(initial?.tracker || 'TASK');
  const [status, setStatus] = useState(initial?.status || 'OPEN');
  const [priority, setPriority] = useState(initial?.priority || 'NORMAL');
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId?.toString() || '');
  const [milestoneId, setMilestoneId] = useState(initial?.milestoneId?.toString() || '');
  const [reviewerId, setReviewerId] = useState(initial?.reviewerId?.toString() || '');
  const [reviewedDate, setReviewedDate] = useState(initial?.reviewedDate || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [progress, setProgress] = useState(initial?.progress ?? 0);
  const [users, setUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [error, setError] = useState('');
  // 새 이슈 작성 시 저장 전까지 보류해 둘 파일들.
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isNew = !initial?.id;

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => {});
    fetchMilestones(projectId).then(setMilestones).catch(() => {});
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await onSubmit({
        projectId,
        subject,
        description,
        resolution,
        tracker: tracker as IssueRequest['tracker'],
        status: status as IssueRequest['status'],
        priority: priority as IssueRequest['priority'],
        assigneeId: assigneeId ? Number(assigneeId) : null,
        milestoneId: milestoneId ? Number(milestoneId) : null,
        reviewerId: reviewerId ? Number(reviewerId) : null,
        reviewedDate: reviewedDate || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
        progress: Number(progress),
      });
      // 새 이슈이고 보류 파일이 있으면 생성된 이슈에 일괄 업로드.
      if (isNew && result && 'id' in result && pendingFiles.length > 0) {
        for (const f of pendingFiles) {
          try {
            await uploadAttachment('ISSUE', result.id, f);
          } catch {
            /* 개별 파일 실패는 무시하고 계속 */
          }
        }
        setPendingFiles([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '저장 실패');
    } finally {
      setSubmitting(false);
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
        <RichTextEditor
          value={description}
          onChange={setDescription}
          onImageUpload={async (file) => {
            // 기존 이슈 수정 시엔 서버 첨부로 업로드 후 URL 삽입,
            // 새 이슈 작성 중(ID 없음)엔 draft 첨부로 업로드 후 URL 삽입.
            // 어느 경우든 base64 를 본문에 넣지 않아 본문이 가벼워진다.
            const att = initial?.id
              ? await uploadAttachment('ISSUE', initial.id, file)
              : await uploadDraftAttachment('ISSUE', file);
            return attachmentDownloadUrl(att.id, true);
          }}
        />
      </div>
      <div className="mb-4">
        <label className={label}>해결 내용</label>
        <RichTextEditor
          value={resolution}
          onChange={setResolution}
          placeholder="이슈 해결 내용을 입력하세요"
          onImageUpload={async (file) => {
            const att = initial?.id
              ? await uploadAttachment('ISSUE', initial.id, file)
              : await uploadDraftAttachment('ISSUE', file);
            return attachmentDownloadUrl(att.id, true);
          }}
        />
      </div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className={label}>유형</label>
          <select className={input} value={tracker} onChange={(e) => setTracker(e.target.value as any)}>
            {TRACKERS.map((t) => (
              <option key={t} value={t}>
                {TRACKER_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>상태</label>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>우선순위</label>
          <select className={input} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
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
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className={label}>검수 담당자</label>
          <select className={input} value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}>
            <option value="">미지정</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName || u.username}
              </option>
            ))}
          </select>
        </div>
        <DateField label="검수 일자" value={reviewedDate} onChange={setReviewedDate} />
      </div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <DateField label="시작일" value={startDate} onChange={setStartDate} />
        <DateField label="마감일" value={dueDate} onChange={setDueDate} />
        <div className="min-w-[180px] flex-1">
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

      <div className="mb-4 border-t pt-4">
        {isNew ? (
          <PendingAttachments files={pendingFiles} onChange={setPendingFiles} />
        ) : (
          <AttachmentList parentType="ISSUE" parentId={initial!.id} />
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '저장 중...' : '저장'}
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
