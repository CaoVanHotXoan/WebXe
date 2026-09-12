import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { TopProgressBar } from "@/components/TopProgressBar";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * Component nội bộ nằm bên trong LoadingProvider
 * để có thể gọi useLoading() và gắn fetch interceptor.
 */
function AppInner({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isFetching, isRouteChanging, startFetch, endFetch, setRouteChanging } = useLoading();

  useEffect(() => {
    // 1. Gắn TopProgressBar + LoadingContext cho Next.js Router
    const handleRouteStart = () => {
      TopProgressBar.start();
      setRouteChanging(true);
    };
    const handleRouteEnd = () => {
      TopProgressBar.complete(true);
      setRouteChanging(false);
    };

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteEnd);
    router.events.on("routeChangeError", handleRouteEnd);

    // 2. Gắn TopProgressBar + LoadingContext cho mọi Request API (fetch)
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      TopProgressBar.start();
      startFetch();
      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } finally {
        TopProgressBar.complete();
        endFetch();
      }
    };

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteEnd);
      router.events.off("routeChangeError", handleRouteEnd);
      window.fetch = originalFetch;
    };
  }, [router, startFetch, endFetch, setRouteChanging]);

  return (
    <>
      {/* Spinner toàn trang khi chuyển route */}
      <LoadingSpinner isLoading={isRouteChanging} mode="page" />
      {/* Khởi tạo hiệu ứng dùng chung cho mọi trang */}
      <HieuUng />
      <Component {...pageProps} />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <LoadingProvider>
            <AppInner {...props} />
          </LoadingProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
