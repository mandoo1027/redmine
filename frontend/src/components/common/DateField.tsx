import { useRef } from 'react';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// 좁고 깔끔한 날짜 입력. 달력 아이콘을 누르거나 입력 영역을 클릭하면 네이티브 picker 가 열린다.
export default function DateField({ label, value, onChange, className = '' }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = ref.current;
    if (!el) return;
    // 지원 브라우저에서는 showPicker, 아니면 포커스로 대체
    if (typeof (el as any).showPicker === 'function') {
      (el as any).showPicker();
    } else {
      el.focus();
    }
  };

  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm text-gray-600">{label}</label>}
      <div
        onClick={openPicker}
        className="flex w-40 cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
      >
        <svg
          className="h-4 w-4 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        <input
          ref={ref}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-sm outline-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
      </div>
    </div>
  );
}
