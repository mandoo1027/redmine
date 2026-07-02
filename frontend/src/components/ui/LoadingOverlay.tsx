import Spinner from './Spinner';

interface Props {
  show: boolean;
  label?: string;
}

// 부모(relative) 영역만 덮는 국소 오버레이 스피너.
export default function LoadingOverlay({ show, label }: Props) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded bg-white/70">
      <Spinner />
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
}
