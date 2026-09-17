import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  createScheduleEvent,
  deleteScheduleEvent,
  fetchScheduleEvents,
  updateScheduleEvent,
} from '../api/schedule';
import type { ScheduleEvent, ScheduleEventRequest } from '../types';

/* ---------- 날짜 유틸 (로컬 기준, 타임존 드리프트 없이) ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameYmd = (a: Date, b: Date) => ymd(a) === ymd(b);

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

interface EditorState {
  id: number | null;
  title: string;
  startDate: string;
  endDate: string;
  timeText: string;
  color: string;
  description: string;
}

const emptyEditor = (date: string): EditorState => ({
  id: null,
  title: '',
  startDate: date,
  endDate: '',
  timeText: '',
  color: DEFAULT_COLOR,
  description: '',
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
  const gridEnd = useMemo(() => addDays(gridStart, 41), [gridStart]);
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  );

  const load = useCallback(() => {
    setLoading(true);
    fetchScheduleEvents(ymd(gridStart), ymd(gridEnd))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [gridStart, gridEnd]);

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
    });
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
      <div className="mx-auto max-w-6xl">
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
                            if (canEdit) openEdit(e);
                            else setViewEvent(e);
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

      {/* 읽기 전용 상세(비로그인) */}
      {viewEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewEvent(null)}
        >
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div
              className="rounded-t-xl px-5 py-3 text-white"
              style={{ backgroundColor: viewEvent.color || DEFAULT_COLOR }}
            >
              <h2 className="text-lg font-bold">{viewEvent.title}</h2>
            </div>
            <div className="space-y-2 px-5 py-4 text-sm text-slate-700">
              <div>
                <span className="text-slate-400">기간 </span>
                {viewEvent.startDate}
                {viewEvent.endDate && viewEvent.endDate !== viewEvent.startDate ? ` ~ ${viewEvent.endDate}` : ''}
              </div>
              {viewEvent.timeText && (
                <div>
                  <span className="text-slate-400">시간 </span>
                  {viewEvent.timeText}
                </div>
              )}
              {viewEvent.description && <div className="whitespace-pre-wrap pt-1">{viewEvent.description}</div>}
              {viewEvent.createdByName && (
                <div className="pt-1 text-xs text-slate-400">작성: {viewEvent.createdByName}</div>
              )}
            </div>
            <div className="flex justify-end border-t px-5 py-3">
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
