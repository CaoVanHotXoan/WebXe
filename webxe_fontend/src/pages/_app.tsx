import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
<<<<<<< Updated upstream

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Khởi tạo hiệu ứng tia lửa dùng chung cho mọi trang. */}
      <HieuUng />
      <Component {...pageProps} />
    </>
=======
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {/* Khởi tạo hiệu ứng dùng chung cho mọi trang */}
          <HieuUng />
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
>>>>>>> Stashed changes
  );
}
