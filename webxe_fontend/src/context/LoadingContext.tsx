import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface LoadingContextValue {
  /** true nếu đang có ít nhất 1 request API đang chạy */
  isFetching: boolean;
  /** true nếu đang chuyển trang (route change) */
  isRouteChanging: boolean;
  /** Gọi khi bắt đầu 1 request API */
  startFetch: () => void;
  /** Gọi khi 1 request API kết thúc */
  endFetch: () => void;
  /** Bật/tắt trạng thái chuyển trang */
  setRouteChanging: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextValue>({
  isFetching: false,
  isRouteChanging: false,
  startFetch: () => {},
  endFetch: () => {},
  setRouteChanging: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [fetchCount, setFetchCount] = useState(0);
  const [isRouteChanging, setRouteChanging] = useState(false);

  const startFetch = useCallback(() => setFetchCount((c) => c + 1), []);
  const endFetch = useCallback(() => setFetchCount((c) => Math.max(0, c - 1)), []);

  const value = useMemo<LoadingContextValue>(
    () => ({
      isFetching: fetchCount > 0,
      isRouteChanging,
      startFetch,
      endFetch,
      setRouteChanging,
    }),
    [fetchCount, isRouteChanging, startFetch, endFetch],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  return useContext(LoadingContext);
}
