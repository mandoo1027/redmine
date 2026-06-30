import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MemberList from '../components/projects/MemberList';
import MilestoneList from '../components/projects/MilestoneList';
import { fetchProjectIssues } from '../api/issues';
import type { Issue } from '../types';

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchProjectIssues(id).then(setIssues).catch(() => {});
  }, [id]);

  const count = (status: string) => issues.filter((i) => i.status === status).length;

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">이슈 요약</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{count('OPEN')}</div>
              <div className="text-xs text-gray-500">열림</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{count('IN_PROGRESS')}</div>
              <div className="text-xs text-gray-500">진행중</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500">{count('CLOSED')}</div>
              <div className="text-xs text-gray-500">완료</div>
            </div>
          </div>
        </div>
        <MilestoneList projectId={id} />
      </div>
      <MemberList projectId={id} />
    </div>
  );
}
