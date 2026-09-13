import React, { useState, useEffect, useCallback } from 'react';

// Cấu hình
const TRICKLE_SPEED = 200; // ms
const MAX_TRICKLE = 90; // Dừng lại ở 90% khi chưa complete

// Kiểu dữ liệu cho Event Emitter đơn giản
type Listener = (progress: number, visible: boolean) => void;

class ProgressStore {
  progress = 0;
  visible = false;
  listeners: Set<Listener> = new Set();
  trickleInterval: NodeJS.Timeout | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.progress, this.visible));
  }

  private clearTrickle() {
    if (this.trickleInterval) {
      clearInterval(this.trickleInterval);
      this.trickleInterval = null;
    }
  }

  start = () => {
    this.clearTrickle();
    this.progress = 0;
    this.visible = true;
    this.notify();

    // Trickle effect
    this.trickleInterval = setInterval(() => {
      this.progress = this.progress + (MAX_TRICKLE - this.progress) * 0.05;
      // Dừng tăng nếu đã gần 90%
      if (this.progress > 89) {
        this.progress = 90;
      }
      this.notify();
    }, TRICKLE_SPEED);
  };

  set = (value: number) => {
    this.clearTrickle();
    this.progress = Math.max(0, Math.min(100, value));
    this.visible = this.progress > 0 && this.progress < 100;
    this.notify();
  };

  complete = () => {
    this.clearTrickle();
    this.progress = 100;
    this.notify();

    // Giữ 100% trong 0.2s rồi ẩn đi
    setTimeout(() => {
      this.visible = false;
      this.notify();

      // Đợi animation fade-out chạy xong rồi reset về 0
      setTimeout(() => {
        this.reset();
      }, 300); // 300ms khớp với transition-opacity
    }, 200);
  };

  reset = () => {
    this.clearTrickle();
    this.progress = 0;
    this.visible = false;
    this.notify();
  };
}

const store = new ProgressStore();

// Export API để dùng ở bất kỳ đâu
export const progressAPI = {
  start: store.start,
  set: store.set,
  complete: store.complete,
  reset: store.reset,
};

const LoadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(store.progress);
  const [visible, setVisible] = useState(store.visible);

  useEffect(() => {
    const unsubscribe = store.subscribe((newProgress, newVisible) => {
      setProgress(newProgress);
      setVisible(newVisible);
    });
    return unsubscribe;
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-[9999] pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 relative transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '200ms',
        }}
      >
        {/* Glow effect ở đầu vệt chạy */}
        <div className="absolute right-0 top-0 h-full w-20 bg-cyan-400/50 shadow-[0_0_10px_3px_rgba(34,211,238,0.7)] blur-[2px] rounded-full transform translate-x-1/2" />
      </div>
    </div>
  );
};

export default LoadingProgressBar;
