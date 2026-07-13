import { useEffect, useRef, useState } from 'react';

// sessionStorage 에 상태를 저장/복원하는 훅.
// 이슈 상세로 갔다가 뒤로 왔을 때 검색 조건이 초기화되지 않도록 유지한다.
export function usePersistedState<T>(key: string, initial: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved != null) return JSON.parse(saved) as T;
    } catch {
      // 파싱 실패 시 기본값 사용.
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  });

  // 최초 마운트 시에는 이미 위에서 복원했으므로 중복 저장을 피한다.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시.
    }
  }, [key, state]);

  return [state, setState] as const;
}
