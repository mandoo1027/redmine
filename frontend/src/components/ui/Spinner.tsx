interface Props {
  size?: number;
  className?: string;
}

// Tailwind animate-spin 기반 회전 스피너.
export default function Spinner({ size = 24, className = '' }: Props) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
