import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectIssues } from '../api/issues';
import type { Issue } from '../types';
import GanttChart from '../components/gantt/GanttChart';

export default function GanttPage() {
  const { projectId } = useParams();
  const id = Number(projectId);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchProjectIssues(id).then(setIssues).catch(() => {});
  }, [id]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-700">간트차트</h2>
      <GanttChart issues={issues} />
    </div>
  );
}
