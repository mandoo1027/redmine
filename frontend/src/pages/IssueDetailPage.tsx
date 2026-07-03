import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createIssue, deleteIssue, fetchIssue, updateIssue } from '../api/issues';
import type { Issue, IssueRequest } from '../types';
import IssueForm from '../components/issues/IssueForm';
import { PriorityBadge, StatusBadge, TrackerBadge } from '../components/issues/StatusBadge';
import RichTextView from '../components/editor/RichTextView';
import RichTextEditor from '../components/editor/RichTextEditor';
import AttachmentList from '../components/attachments/AttachmentList';
import CommentSection from '../components/issues/CommentSection';
import RelatedIssues from '../components/issues/RelatedIssues';
import { useDialog } from '../components/ui/DialogProvider';
import { uploadAttachment, attachmentDownloadUrl } from '../api/attachments';

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const pid = Number(projectId);
  const iid = Number(issueId);
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [editing, setEditing] = useState(false);
  // 복사 모드: 기존 값이 채워진 폼을 새 이슈로 등록.
  const [copying, setCopying] = useState(false);
  // 해결 내용만 인라인으로 편집하기 위한 상태.
  const [editingResolution, setEditingResolution] = useState(false);
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);
  // 진행률만 인라인으로 편집하기 위한 상태.
  const [progressDraft, setProgressDraft] = useState<number | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  const load = () => {
    fetchIssue(iid).then(setIssue).catch(() => {});
  };

  useEffect(load, [iid]);

  const handleUpdate = async (payload: IssueRequest) => {
    await updateIssue(iid, payload);
    setEditing(false);
    load();
  };

  // 복사: 폼에서 확인/수정한 값으로 새 이슈를 생성하고 그 상세로 이동.
  const handleCopy = async (payload: IssueRequest) => {
    const created = await createIssue(payload);
    setCopying(false);
    navigate(`/projects/${created.projectId}/issues/${created.id}`);
    return created;
  };

  // 제목·설명 등 다른 필드는 그대로 두고 해결 내용만 저장한다.
  const startEditResolution = () => {
    setResolutionDraft(issue?.resolution || '');
    setEditingResolution(true);
  };

  const saveResolution = async () => {
    if (!issue) return;
    setSavingResolution(true);
    try {
      await updateIssue(iid, {
        projectId: issue.projectId,
        subject: issue.subject,
        description: issue.description,
        resolution: resolutionDraft,
        tracker: issue.tracker,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        milestoneId: issue.milestoneId,
        startDate: issue.startDate,
        dueDate: issue.dueDate,
        progress: issue.progress,
      });
      setEditingResolution(false);
      load();
    } finally {
      setSavingResolution(false);
    }
  };

  // 진행률만 인라인으로 저장 (다른 필드는 그대로 유지).
  const saveProgress = async (value: number) => {
    if (!issue) return;
    setSavingProgress(true);
    try {
      await updateIssue(iid, {
        projectId: issue.projectId,
        subject: issue.subject,
        description: issue.description,
        resolution: issue.resolution,
        tracker: issue.tracker,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        milestoneId: issue.milestoneId,
        startDate: issue.startDate,
        dueDate: issue.dueDate,
        progress: value,
      });
      setProgressDraft(null);
      load();
    } finally {
      setSavingProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirm('이 이슈를 삭제하시겠습니까?', { title: '이슈 삭제', danger: true }))) return;
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

  if (copying) {
    // id 를 제거해 새 이슈로 취급하고, 제목 앞에 [복사] 표기.
    const { id: _omit, ...rest } = issue;
    const copyInitial = { ...rest, subject: `[복사] ${issue.subject}` } as Issue;
    return (
      <div>
        <div className="mb-3 rounded bg-blue-50 p-3 text-sm text-blue-700">
          #{issue.id} 이슈를 복사해 새 이슈를 만듭니다. 내용을 확인하고 저장하세요.
        </div>
        <IssueForm
          projectId={pid}
          initial={copyInitial}
          onSubmit={handleCopy}
          onCancel={() => setCopying(false)}
        />
      </div>
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
            onClick={() => setCopying(true)}
            className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            복사
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
        {row(
          '진행률',
          progressDraft === null ? (
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${
                    issue.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${issue.progress}%` }}
                />
              </div>
              <span className="w-10 text-right text-gray-700">{issue.progress}%</span>
              <button
                onClick={() => setProgressDraft(issue.progress)}
                className="rounded border px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                변경
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progressDraft}
                onChange={(e) => setProgressDraft(Number(e.target.value))}
                className="w-40"
              />
              <span className="w-10 text-right text-gray-700">{progressDraft}%</span>
              <button
                onClick={() => saveProgress(progressDraft)}
                disabled={savingProgress}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingProgress ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setProgressDraft(null)}
                disabled={savingProgress}
                className="rounded border px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          )
        )}
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-700">설명</h2>
        {issue.description ? (
          <RichTextView content={issue.description} />
        ) : (
          <p className="text-sm text-gray-400">설명이 없습니다.</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-green-800">해결 내용</h2>
          {!editingResolution && (
            <button
              onClick={startEditResolution}
              className="rounded border border-green-300 bg-white px-3 py-1 text-sm text-green-700 hover:bg-green-100"
            >
              {issue.resolution ? '해결 내용 수정' : '해결 내용 작성'}
            </button>
          )}
        </div>

        {editingResolution ? (
          <div>
            <RichTextEditor
              value={resolutionDraft}
              onChange={setResolutionDraft}
              placeholder="이슈 해결 내용을 입력하세요"
              onImageUpload={async (file) => {
                const att = await uploadAttachment('ISSUE', issue.id, file);
                return attachmentDownloadUrl(att.id, true);
              }}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveResolution}
                disabled={savingResolution}
                className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {savingResolution ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setEditingResolution(false)}
                disabled={savingResolution}
                className="rounded border px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          </div>
        ) : issue.resolution ? (
          <RichTextView content={issue.resolution} />
        ) : (
          <p className="text-sm text-green-700/70">아직 해결 내용이 없습니다.</p>
        )}
      </div>

      <div className="mb-6 border-t pt-4">
        <RelatedIssues issueId={issue.id} />
      </div>

      <div className="border-t pt-4">
        <AttachmentList parentType="ISSUE" parentId={issue.id} />
      </div>

      <div className="mt-6 border-t pt-4">
        <CommentSection issueId={issue.id} />
      </div>
    </div>
  );
}
