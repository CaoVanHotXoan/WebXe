import React, { useEffect, useState } from 'react';

// Quản lý trạng thái hiển thị toàn cục cho Loading Spinner (hỗ trợ nhiều request cùng lúc)
class SpinnerStore {
  requestCount = 0;
  listeners = new Set<(isLoading: boolean) => void>();

  subscribe(listener: (isLoading: boolean) => void) {
    this.listeners.add(listener);
    // Trả về trạng thái hiện tại ngay khi subscribe
    listener(this.requestCount > 0);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.requestCount > 0));
  }

  start = () => {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.notify();
    }
  };

  complete = () => {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.notify();
    }
  };
}

const store = new SpinnerStore();

export const spinnerAPI = {
  start: store.start,
  complete: store.complete,
};

export interface LoadingSpinnerProps {
  // Có thể truyền prop isLoading thủ công (như khi chuyển trang router)
  // hoặc không truyền thì nó tự động bắt sự kiện từ spinnerAPI
  isLoading?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading: propIsLoading }) => {
  const [globalIsLoading, setGlobalIsLoading] = useState(false);

  useEffect(() => {
    return store.subscribe(setGlobalIsLoading);
  }, []);

  // Spinner sẽ hiện nếu được báo qua prop (từ Next.js router) HOẶC từ API call global
  const active = propIsLoading || globalIsLoading;

  const [shouldRender, setShouldRender] = useState(active);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (active) {
      setShouldRender(true);
    } else {
      // Đợi hiệu ứng fade-out chạy xong (300ms) rồi mới gỡ khỏi DOM
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [active]);

  if (!shouldRender) return null;

  const opacityClass = active ? 'opacity-100' : 'opacity-0';

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm bg-black/20 transition-opacity duration-300 ${opacityClass}`}
    >
      <div className="w-12 h-12 md:w-14 md:h-14">
        <SpinnerSVG />
      </div>
    </div>
  );
};

// Component SVG cho Spinner 8-segment dạng vòng cung (Ring)
const SpinnerSVG: React.FC = () => {
  return (
    <svg
      className="w-full h-full animate-spin text-gray-900 dark:text-white"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      style={{ animationDuration: '1s', animationTimingFunction: 'linear' }}
    >
      {[...Array(8)].map((_, i) => {
        const opacity = 0.25 + (i * 0.75) / 7;
        return (
          <circle
            key={i}
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="butt"
            strokeDasharray="5.5 51.048"
            transform={`rotate(${i * 45} 12 12)`}
            style={{ opacity }}
          />
        );
      })}
    </svg>
  );
};

export default LoadingSpinner;
