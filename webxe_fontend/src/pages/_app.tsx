import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoadingProgressBar, { progressAPI } from "@/components/LoadingProgressBar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      progressAPI.start();
      setIsPageLoading(true);
    };

    const handleComplete = () => {
      progressAPI.complete();
      setIsPageLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {/* Thanh tải tiến trình phía trên cùng */}
          <LoadingProgressBar />

          {/* Vòng xoay Spinner che toàn bộ màn hình khi chuyển trang */}
          <LoadingSpinner isLoading={isPageLoading} />

          {/* Khởi tạo hiệu ứng dùng chung cho mọi trang */}
          <HieuUng />
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
