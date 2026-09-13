import { useState, useEffect, useCallback, useRef } from 'react';
import { spinnerAPI } from '@/components/LoadingSpinner';
import { BACKEND_URL } from '@/services/api'; // Đường dẫn gốc đã cấu hình

// 1. Định nghĩa TypeScript Interface cho dữ liệu trả về từ Backend (Ví dụ)
export interface CarModel {
  id: string;
  name: string;
  price: number;
  type: string;
}

/**
 * Custom Hook chuẩn hóa luồng tải dữ liệu API với Loading Spinner & AbortController
 */
export function useFetchData<T = CarModel[]>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  
  // Trạng thái isLoading cục bộ (dành cho component render)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref để kiểm soát việc tắt spinner an toàn khi unmount
  const isRequestPending = useRef(false);

  const fetchData = useCallback(async (abortController: AbortController) => {
    // ---- BẮT ĐẦU KÍCH HOẠT ----
    setIsLoading(true);
    setError(null);
    isRequestPending.current = true;
    
    // Kích hoạt giao diện Spinner toàn cục quay lên
    spinnerAPI.start();

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        // Gắn tín hiệu hủy vào fetch request
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result: T = await response.json();
      setData(result);
    } catch (err: any) {
      // 3. Xử lý AbortError (hủy request an toàn, không ném lỗi ra UI)
      if (err.name === 'AbortError') {
        console.log(`[API Cancelled]: Request tới ${endpoint} đã bị hủy do unmount.`);
        return;
      }
      setError(err.message || 'Lỗi không xác định khi tải dữ liệu');
    } finally {
      // ---- KẾT THÚC REQUEST ----
      // Bắt buộc luôn tắt loading dù API chạy mượt hay dính lỗi sập server
      if (isRequestPending.current) {
        setIsLoading(false);
        spinnerAPI.complete(); // Kích hoạt hiệu ứng Fade-out 300ms của Spinner
        isRequestPending.current = false;
      }
    }
  }, [endpoint]);

  useEffect(() => {
    // Khởi tạo AbortController mỗi lần effect chạy
    const abortController = new AbortController();

    // Gọi API
    fetchData(abortController);

    // CLEANUP FUNCTION (Chạy khi component bị unmount hoặc endpoint thay đổi)
    return () => {
      // Hủy bỏ luồng mạng đang gọi dở dang
      abortController.abort();
      
      // Cleanup Spinner nếu user chuyển trang đột ngột khi API chưa chạy tới khối finally
      if (isRequestPending.current) {
        spinnerAPI.complete();
        isRequestPending.current = false;
      }
    };
  }, [fetchData]);

  // Trả về state để component sử dụng conditional rendering
  return { data, isLoading, error };
}
