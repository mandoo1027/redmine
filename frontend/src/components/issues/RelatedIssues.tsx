import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addIssueLink,
  deleteIssueLink,
  fetchIssueLinks,
  fetchIssues,
} from '../../api/issues';
import type { Issue, IssueLink } from '../../types';
import { STATUS_LABELS } from '../../types';
import { useDialog } from '../ui/DialogProvider';

interface Props {
  issueId: number;
}

export default function RelatedIssues({ issueId }: Props) {
  const { confirm } = useDialog();
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [adding, setAdding] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Issue[]>([]);
  const [searching, setSearching] = useState(false);

  const load = () => {
    fetchIssueLinks(issueId).then(setLinks).catch(() => {});
  };

  useEffect(load, [issueId]);

  // 검색어 입력 시 제목으로 이슈 검색 (자기 자신·이미 연결된 것 제외).
  useEffect(() => {
    if (!adding || keyword.trim() === '') {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      fetchIssues({ subject: keyword.trim() })
        .then((list) => {
          const linkedIds = new Set(links.map((l) => l.issueId));
          setResults(list.filter((i) => i.id !== issueId && !linkedIds.has(i.id)).slice(0, 8));
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [keyword, adding, issueId, links]);

  const handleAdd = async (targetId: number) => {
    await addIssueLink(issueId, targetId);
    setKeyword('');
    setResults([]);
    setAdding(false);
    load();
  };

  const handleRemove = async (link: IssueLink) => {
    if (!(await confirm(`관련 이슈 연결을 해제하시겠습니까?\n#${link.issueId} ${link.subject}`, {
      title: '연결 해제',
      danger: true,
    }))) {
      return;
    }
    await deleteIssueLink(link.linkId);
    load();
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">관련 이슈</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
        >
          {adding ? '닫기' : '관련 이슈 추가'}
        </button>
      </div>

      {adding && (
        <div className="mb-3 rounded border bg-gray-50 p-3">
          <input
            autoFocus
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="연결할 이슈 제목 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {searching && <p className="mt-2 text-xs text-gray-400">검색 중...</p>}
          {results.length > 0 && (
            <ul className="mt-2 divide-y rounded border bg-white">
              {results.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => handleAdd(i.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50"
                  >
                    <span className="text-gray-400">#{i.id}</span>
                    <span className="flex-1 truncate text-gray-800">{i.subject}</span>
                    <span className="text-xs text-gray-400">{STATUS_LABELS[i.status]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!searching && keyword.trim() !== '' && results.length === 0 && (
            <p className="mt-2 text-xs text-gray-400">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-sm text-gray-400">연결된 이슈가 없습니다.</p>
      ) : (
        <ul className="divide-y rounded border">
          {links.map((l) => (
            <li key={l.linkId} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="text-gray-400">#{l.issueId}</span>
              <Link
                to={`/projects/${l.projectId}/issues/${l.issueId}`}
                className="flex-1 truncate text-blue-600 hover:underline"
              >
                {l.subject}
              </Link>
              <span className="w-14 text-right text-xs text-gray-400">{l.progress}%</span>
              <span className="w-12 text-xs text-gray-500">{STATUS_LABELS[l.status]}</span>
              <button
                onClick={() => handleRemove(l)}
                className="text-xs text-red-500 hover:underline"
              >
                해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
