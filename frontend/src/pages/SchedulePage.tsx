import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  createScheduleEvent,
  deleteScheduleEvent,
  downloadScheduleAttachment,
  fetchScheduleEvents,
  fetchScheduleTasks,
  updateScheduleEvent,
  updateScheduleTask,
  uploadScheduleAttachment,
} from '../api/schedule';
import type {
  ScheduleEvent,
  ScheduleEventRequest,
  ScheduleTask,
  ScheduleTaskStatus,
} from '../types';
import { TASK_STATUS_LABELS } from '../types';

/* ---------- 날짜 유틸 (로컬 기준, 타임존 드리프트 없이) ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const shortDate = (s: string) => {
  const d = parseYmd(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};
const rangeText = (e: { startDate: string; endDate: string | null }) =>
  e.endDate && e.endDate !== e.startDate
    ? `${shortDate(e.startDate)} ~ ${shortDate(e.endDate)}`
    : shortDate(e.startDate);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameYmd = (a: Date, b: Date) => ymd(a) === ymd(b);

// 시작일 기준 경과일수(오늘 - 시작일). 예: 9/8 접수 → 9/18 이면 10.
const daysSince = (startDate: string) => {
  const start = parseYmd(startDate);
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((t.getTime() - start.getTime()) / 86400000);
};
// "N일째" 배지 라벨(당일/미래는 별도 표기)
const dayBadge = (startDate: string) => {
  const n = daysSince(startDate);
  if (n < 0) return `D${n}`;
  if (n === 0) return '오늘';
  return `${n}일째`;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const COLORS = [
  { hex: '#3b82f6', name: '파랑' },
  { hex: '#ef4444', name: '빨강' },
  { hex: '#10b981', name: '초록' },
  { hex: '#f59e0b', name: '주황' },
  { hex: '#8b5cf6', name: '보라' },
  { hex: '#ec4899', name: '분홍' },
  { hex: '#14b8a6', name: '청록' },
  { hex: '#64748b', name: '회색' },
];
const DEFAULT_COLOR = COLORS[0].hex;

// 작업 항목 상태 배지 색
const STATUS_STYLE: Record<ScheduleTaskStatus, string> = {
  PENDING: 'bg-slate-500 text-white',
  IN_PROGRESS: 'bg-amber-500 text-white',
  DONE: 'bg-emerald-500 text-white',
};
const STATUS_ORDER: ScheduleTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];

interface EditorState {
  id: number | null;
  title: string;
  startDate: string;
  endDate: string;
  timeText: string;
  color: string;
  description: string;
  pinned: boolean;
  attachmentName: string | null;
}

const emptyEditor = (date: string): EditorState => ({
  id: null,
  title: '',
  startDate: date,
  endDate: '',
  timeText: '',
  color: DEFAULT_COLOR,
  description: '',
  pinned: false,
  attachmentName: null,
});

export default function SchedulePage() {
  const { user } = useAuth();
  const canEdit = !!user;

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [viewEvent, setViewEvent] = useState<ScheduleEvent | null>(null);
  const [saving, setSaving] = useState(false);

  // 6주(42칸) 그리드 시작/끝
  const gridStart = useMemo(() => {
    const first = startOfMonth(cursor);
    return addDays(first, -first.getDay());
  }, [cursor]);
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  );

  // 달력 + 오른쪽 아젠다 목록에 함께 쓰므로 전체 일정을 한 번에 불러온다(달력은 날짜별로 필터).
  const load = useCallback(() => {
    setLoading(true);
    fetchScheduleEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 각 날짜에 걸치는 이벤트
  const eventsForDay = useCallback(
    (day: Date) => {
      const key = ymd(day);
      return events
        .filter((e) => {
          const start = e.startDate;
          const end = e.endDate && e.endDate >= e.startDate ? e.endDate : e.startDate;
          return start <= key && key <= end;
        })
        .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : a.id - b.id));
    },
    [events],
  );

  const today = new Date();
  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;

  const openCreate = (date: string) => {
    if (!canEdit) return;
    setEditor(emptyEditor(date));
  };
  const openEdit = (e: ScheduleEvent) => {
    setEditor({
      id: e.id,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate ?? '',
      timeText: e.timeText ?? '',
      color: e.color ?? DEFAULT_COLOR,
      description: e.description ?? '',
      pinned: e.pinned,
      attachmentName: e.attachmentName,
    });
  };

  // 상단 고정(하이라이트) 일정 — 시작일 오름차순
  const pinnedEvents = useMemo(
    () =>
      [...events]
        .filter((e) => e.pinned)
        .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : a.id - b.id)),
    [events],
  );
  // 오른쪽 아젠다 — 전체 일정 시작일 오름차순
  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : a.id - b.id)),
    [events],
  );
  const todayKey = ymd(today);

  // 첨부 업로드(수정 중인 기존 일정 대상)
  const onUploadAttachment = async (file: File) => {
    if (!editor?.id) return;
    setSaving(true);
    try {
      const updated = await uploadScheduleAttachment(editor.id, file);
      setEditor({ ...editor, attachmentName: updated.attachmentName });
      load();
    } catch {
      alert('첨부 업로드에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };
  const onDownload = async (e: { id: number; attachmentName: string | null }) => {
    if (!e.attachmentName) return;
    try {
      await downloadScheduleAttachment(e.id, e.attachmentName);
    } catch {
      alert('다운로드에 실패했습니다.');
    }
  };

  /* ----- 작업 항목(체크리스트) ----- */
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    if (!viewEvent) {
      setTasks([]);
      return;
    }
    setTasksLoading(true);
    fetchScheduleTasks(viewEvent.id)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [viewEvent]);

  // 상태 변경(대기/수정중/수정완료) — 낙관적 업데이트 후 실패 시 롤백
  const changeTaskStatus = async (task: ScheduleTask, status: ScheduleTaskStatus) => {
    if (!canEdit || task.status === status) return;
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await updateScheduleTask(task.id, { status });
      load(); // 목록의 진행률(taskDone) 갱신
    } catch {
      setTasks(prev);
      alert('상태 변경에 실패했습니다. 로그인 상태를 확인해 주세요.');
    }
  };

  const submit = async () => {
    if (!editor || !editor.title.trim() || !editor.startDate) return;
    const payload: ScheduleEventRequest = {
      title: editor.title.trim(),
      startDate: editor.startDate,
      endDate: editor.endDate || null,
      timeText: editor.timeText.trim() || null,
      color: editor.color || null,
      description: editor.description.trim() || null,
      pinned: editor.pinned,
    };
    setSaving(true);
    try {
      if (editor.id == null) await createScheduleEvent(payload);
      else await updateScheduleEvent(editor.id, payload);
      setEditor(null);
      load();
    } catch {
      alert('저장에 실패했습니다. 로그인 상태를 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (editor?.id == null) return;
    if (!confirm('이 일정을 삭제할까요?')) return;
    setSaving(true);
    try {
      await deleteScheduleEvent(editor.id);
      setEditor(null);
      load();
    } catch {
      alert('삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const loginHref = `${import.meta.env.BASE_URL}login`;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">📅 공유 일정</h1>
            {loading && <span className="text-sm text-slate-400">불러오는 중…</span>}
          </div>
          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                onClick={() => openCreate(ymd(new Date()))}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                ＋ 일정 추가
              </button>
            ) : (
              <a href={loginHref} className="text-sm text-slate-500 hover:text-blue-600 hover:underline">
                관리자 로그인
              </a>
            )}
          </div>
        </div>

        {/* 상단 고정: 하이라이트 일정(심사 현황 등) */}
        {pinnedEvents.length > 0 && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {pinnedEvents.map((e) => (
              <div
                key={e.id}
                onClick={() => setViewEvent(e)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm hover:shadow"
                style={{ borderLeftColor: e.color || DEFAULT_COLOR }}
              >
                <div
                  className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: e.color || DEFAULT_COLOR }}
                >
                  <span className="text-base font-bold leading-none">{dayBadge(e.startDate)}</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-bold text-slate-800">{e.title}</div>
                  <div className="text-xs text-slate-500">
                    {shortDate(e.startDate)} 접수{e.description ? ` · ${e.description}` : ''}
                  </div>
                  {e.attachmentName && (
                    <div className="mt-0.5 truncate text-xs text-slate-400">📎 {e.attachmentName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* 왼쪽: 달력 */}
          <div className="min-w-0 flex-1">
        {/* 월 네비게이션 */}
        <div className="mb-3 flex items-center justify-center gap-4">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="h-9 w-9 rounded-full text-xl text-slate-500 hover:bg-slate-200"
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="min-w-[140px] text-center text-xl font-bold text-slate-800">{monthLabel}</div>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="h-9 w-9 rounded-full text-xl text-slate-500 hover:bg-slate-200"
            aria-label="다음 달"
          >
            ›
          </button>
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            오늘
          </button>
        </div>

        {/* 달력 */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`py-2 text-center text-sm font-semibold ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'
                }`}
              >
                {w}
              </div>
            ))}
          </div>
          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const inMonth = day.getMonth() === cursor.getMonth();
              const isToday = sameYmd(day, today);
              const dow = day.getDay();
              const dayEvents = eventsForDay(day);
              return (
                <div
                  key={idx}
                  onClick={() => openCreate(ymd(day))}
                  className={`min-h-[116px] border-b border-r border-slate-100 p-1.5 ${
                    inMonth ? 'bg-white' : 'bg-slate-50/60'
                  } ${canEdit ? 'cursor-pointer hover:bg-blue-50/40' : ''}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        isToday ? 'bg-blue-600 font-bold text-white' : ''
                      } ${
                        !isToday && inMonth && dow === 0 ? 'text-red-500' : ''
                      } ${!isToday && inMonth && dow === 6 ? 'text-blue-500' : ''} ${
                        !inMonth ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => {
                      const color = e.color || DEFAULT_COLOR;
                      return (
                        <button
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setViewEvent(e);
                          }}
                          className="block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium text-white"
                          style={{ backgroundColor: color }}
                          title={e.title}
                        >
                          {e.timeText ? <span className="opacity-80">{e.timeText} </span> : null}
                          {e.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="px-1 text-[11px] text-slate-400">+{dayEvents.length - 3} 더보기</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          {canEdit
            ? '날짜 칸을 클릭하면 일정 추가, 일정을 클릭하면 수정할 수 있어요.'
            : '이 달력은 공유용입니다. 편집은 관리자 로그인 후 가능합니다.'}
        </p>
          </div>

          {/* 오른쪽: 일정 목록(아젠다) */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3 text-base font-bold text-slate-800">
                일정 목록
              </div>
              <div className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                {sortedEvents.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-400">등록된 일정이 없습니다.</div>
                ) : (
                  sortedEvents.map((e) => {
                    const past =
                      (e.endDate && e.endDate >= e.startDate ? e.endDate : e.startDate) < todayKey;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setViewEvent(e)}
                        className={`flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-slate-50 ${
                          past ? 'opacity-50' : ''
                        }`}
                      >
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: e.color || DEFAULT_COLOR }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-400">{rangeText(e)}</div>
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {e.pinned ? '📌 ' : ''}
                            {e.title}
                          </div>
                          {e.timeText && <div className="text-xs text-slate-500">{e.timeText}</div>}
                          {e.attachmentName && (
                            <div className="truncate text-xs text-slate-400">📎 {e.attachmentName}</div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 편집 모달 */}
      {editor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setEditor(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-lg font-bold text-slate-800">{editor.id == null ? '일정 추가' : '일정 수정'}</h2>
              <button onClick={() => setEditor(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">제목 *</label>
                <input
                  autoFocus
                  value={editor.title}
                  onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="예: 팀 회의"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-600">시작일 *</label>
                  <input
                    type="date"
                    value={editor.startDate}
                    onChange={(e) => setEditor({ ...editor, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-600">종료일</label>
                  <input
                    type="date"
                    value={editor.endDate}
                    min={editor.startDate}
                    onChange={(e) => setEditor({ ...editor, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">시간 메모</label>
                <input
                  value={editor.timeText}
                  onChange={(e) => setEditor({ ...editor, timeText: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="예: 오후 2시, 10:00~12:00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">색상</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setEditor({ ...editor, color: c.hex })}
                      title={c.name}
                      className={`h-7 w-7 rounded-full ${editor.color === c.hex ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">메모</label>
                <textarea
                  value={editor.description}
                  onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="상세 내용(선택)"
                />
              </div>

              {/* 상단 고정(하이라이트) */}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editor.pinned}
                  onChange={(e) => setEditor({ ...editor, pinned: e.target.checked })}
                  className="h-4 w-4"
                />
                상단에 고정(하이라이트) — 접수일 기준 “N일째” 표시
              </label>

              {/* 첨부파일 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">첨부파일</label>
                {editor.id == null ? (
                  <p className="text-xs text-slate-400">일정을 먼저 저장한 뒤 첨부할 수 있어요.</p>
                ) : (
                  <div className="space-y-2">
                    {editor.attachmentName && (
                      <button
                        type="button"
                        onClick={() => onDownload({ id: editor.id!, attachmentName: editor.attachmentName })}
                        className="block max-w-full truncate text-left text-sm text-blue-600 hover:underline"
                      >
                        📎 {editor.attachmentName}
                      </button>
                    )}
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUploadAttachment(f);
                        e.target.value = '';
                      }}
                      disabled={saving}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
                    />
                    <p className="text-[11px] text-slate-400">다운로드는 누구나 가능합니다(공개).</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t px-5 py-3">
              <div>
                {editor.id != null && (
                  <button
                    onClick={remove}
                    disabled={saving}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditor(null)}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={submit}
                  disabled={saving || !editor.title.trim() || !editor.startDate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 일정 상세 팝업 — 작업 목록(대기/수정중/수정완료) 포함 */}
      {viewEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewEvent(null)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between rounded-t-xl px-5 py-3 text-white"
              style={{ backgroundColor: viewEvent.color || DEFAULT_COLOR }}
            >
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{viewEvent.title}</h2>
                <p className="text-xs opacity-90">
                  {rangeText(viewEvent)}
                  {viewEvent.timeText ? ` · ${viewEvent.timeText}` : ''}
                </p>
              </div>
              <button onClick={() => setViewEvent(null)} className="ml-2 text-2xl leading-none">
                &times;
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-slate-700">
              {viewEvent.description && <div className="whitespace-pre-wrap">{viewEvent.description}</div>}
              {viewEvent.attachmentName && (
                <div>
                  <span className="text-slate-400">첨부 </span>
                  <button
                    type="button"
                    onClick={() => onDownload({ id: viewEvent.id, attachmentName: viewEvent.attachmentName })}
                    className="text-blue-600 hover:underline"
                  >
                    📎 {viewEvent.attachmentName}
                  </button>
                </div>
              )}

              {/* 작업 목록 */}
              {tasksLoading ? (
                <div className="py-8 text-center text-slate-400">작업 목록 불러오는 중…</div>
              ) : tasks.length > 0 ? (
                (() => {
                  const done = tasks.filter((t) => t.status === 'DONE').length;
                  const prog = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
                  const pct = Math.round((done / tasks.length) * 100);
                  const sections = Array.from(new Set(tasks.map((t) => t.section || '')));
                  return (
                    <div className="pt-2">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="font-bold text-slate-800">
                          작업 목록 <span className="text-slate-400">({tasks.length})</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          수정완료 {done} · 수정중 {prog} · 대기 {tasks.length - done - prog}
                        </div>
                      </div>
                      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>

                      {sections.map((sec) => (
                        <div key={sec} className="mb-3">
                          {sec && <div className="mb-1 text-xs font-bold text-slate-500">{sec}</div>}
                          <div className="space-y-1">
                            {tasks
                              .filter((t) => (t.section || '') === sec)
                              .map((t) => (
                                <div
                                  key={t.id}
                                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                                >
                                  <span
                                    className={`min-w-0 flex-1 break-words ${
                                      t.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700'
                                    }`}
                                  >
                                    {t.title}
                                  </span>
                                  {canEdit ? (
                                    <div className="flex shrink-0 gap-1">
                                      {STATUS_ORDER.map((s) => (
                                        <button
                                          key={s}
                                          onClick={() => changeTaskStatus(t, s)}
                                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                                            t.status === s
                                              ? STATUS_STYLE[s]
                                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                          }`}
                                        >
                                          {TASK_STATUS_LABELS[s]}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <span
                                      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status]}`}
                                    >
                                      {TASK_STATUS_LABELS[t.status]}
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : null}

              {viewEvent.createdByName && (
                <div className="pt-1 text-xs text-slate-400">작성: {viewEvent.createdByName}</div>
              )}
            </div>

            <div className="flex justify-between border-t px-5 py-3">
              <div>
                {canEdit && (
                  <button
                    onClick={() => {
                      const ev = viewEvent;
                      setViewEvent(null);
                      openEdit(ev);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    일정 수정
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewEvent(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
