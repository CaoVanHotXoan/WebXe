import { useEffect, useState } from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  isLoading: boolean;
  mode?: 'page' | 'menu-inline'; // Giữ lại dạng optional để tương thích code cũ, nhưng thực tế chỉ hiển thị ở giữa màn hình
}

/**
 * 8-Segment Ring Spinner hiện đại, tối giản.
 * Chỉ hiển thị ở chính giữa màn hình (Overlay toàn màn hình, backdrop blur).
 * Tự động fade-out mượt mà khi isLoading chuyển false.
 */
export default function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  // Duy trì trạng thái hiển thị DOM để fade-out xong mới unmount
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      // Chờ animation fade-out (300ms) kết thúc rồi mới ẩn khỏi DOM
      const timer = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Dải màu Grayscale sắc nét từ Đậm (đen) tới Nhạt (xám sáng trắng)
  // Tăng contrast mạnh: #111827 (rất đen) -> #E5E7EB (sáng trắng)
  const segmentColors = [
    '#111827', // Đậm nhất
    '#1f2937',
    '#374151',
    '#4b5563',
    '#6b7280',
    '#9ca3af',
    '#d1d5db',
    '#e5e7eb', // Nhạt nhất
  ];

  // Tạo 8 cung tròn (arc segments)
  const segments = Array.from({ length: 8 }, (_, i) => {
    const gapDeg = 6; // Khoảng trống giữa các segment
    const segDeg = (360 / 8) - gapDeg; // Mỗi cung chiếm ~39°
    const startAngle = i * 45 + gapDeg / 2; // Bắt đầu từ 0° xoay đều
    const endAngle = startAngle + segDeg;

    // Chuyển độ sang radian
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = center + radius * Math.cos(toRad(startAngle - 90));
    const y1 = center + radius * Math.sin(toRad(startAngle - 90));
    const x2 = center + radius * Math.cos(toRad(endAngle - 90));
    const y2 = center + radius * Math.sin(toRad(endAngle - 90));

    return (
      <path
        key={i}
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={segmentColors[i]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div
      className={`${styles.pageOverlay} ${isLoading ? styles.fadeIn : styles.fadeOut}`}
      aria-label="Đang tải dữ liệu"
      role="status"
    >
      <svg
        className={styles.spinnerSvg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {segments}
      </svg>
      <span className={styles.srOnly}>Đang tải...</span>
    </div>
  );
}
