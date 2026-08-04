import { useEffect, useRef, useState } from 'react';

// sessionStorage 에 상태를 저장/복원하는 훅.
// 이슈 상세로 갔다가 뒤로 왔을 때 검색 조건이 초기화되지 않도록 유지한다.
//
// options.omitKeys 를 지정하면 해당 필드는 저장/복원 대상에서 제외한다.
// 예) "내 것만 보기"(assigneeId) 처럼 진입 시 항상 초기화되어야 하는 필터에 사용.
interface Options<T> {
  omitKeys?: (keyof T)[];
}

export function usePersistedState<T extends object>(
  key: string,
  initial: T | (() => T),
  options?: Options<T>,
) {
  const omitKeys = options?.omitKeys;

  // 저장/복원 시 제외할 필드를 걸러낸 사본을 만든다.
  const strip = (value: T): T => {
    if (!omitKeys || omitKeys.length === 0) return value;
    const copy = { ...value };
    for (const k of omitKeys) delete copy[k];
    return copy;
  };

  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved != null) return strip(JSON.parse(saved) as T);
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
      sessionStorage.setItem(key, JSON.stringify(strip(state)));
    } catch {
      // 저장 실패는 무시.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state]);

  return [state, setState] as const;
}
