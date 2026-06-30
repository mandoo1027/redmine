import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteIssue, fetchIssue, updateIssue } from '../api/issues';
import type { Issue, IssueRequest } from '../types';
import IssueForm from '../components/issues/IssueForm';
import { PriorityBadge, StatusBadge, TrackerBadge } from '../components/issues/StatusBadge';
import RichTextView from '../components/editor/RichTextView';
import AttachmentList from '../components/attachments/AttachmentList';

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const pid = Number(projectId);
  const iid = Number(issueId);
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [editing, setEditing] = useState(false);

  const load = () => {
    fetchIssue(iid).then(setIssue).catch(() => {});
  };

  useEffect(load, [iid]);

  const handleUpdate = async (payload: IssueRequest) => {
    await updateIssue(iid, payload);
    setEditing(false);
    load();
  };

  const handleDelete = async () => {
    if (!confirm('이 이슈를 삭제하시겠습니까?')) return;
    await deleteIssue(iid);
    navigate(`/projects/${pid}/issues`);
  };

  if (!issue) return <div className="text-gray-400">로딩 중...</div>;

  if (editing) {
    return (
      <IssueForm
        projectId={pid}
        initial={issue}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex border-b py-2 text-sm last:border-0">
      <div className="w-28 text-gray-500">{label}</div>
      <div className="flex-1 text-gray-800">{value}</div>
    </div>
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <TrackerBadge tracker={issue.tracker} />
            <span className="text-gray-400">#{issue.id}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{issue.subject}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-x-8">
        {row('상태', <StatusBadge status={issue.status} />)}
        {row('우선순위', <PriorityBadge priority={issue.priority} />)}
        {row('등록자', issue.reporterName || '-')}
        {row('담당자', issue.assigneeName || '미지정')}
        {row('마일스톤', issue.milestoneName || '없음')}
        {row('시작일', issue.startDate || '-')}
        {row('마감일', issue.dueDate || '-')}
        {row('진행률', `${issue.progress}%`)}
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-700">설명</h2>
        {issue.description ? (
          <RichTextView content={issue.description} />
        ) : (
          <p className="text-sm text-gray-400">설명이 없습니다.</p>
        )}
      </div>

      <div className="border-t pt-4">
        <AttachmentList parentType="ISSUE" parentId={issue.id} />
      </div>
    </div>
  );
}
