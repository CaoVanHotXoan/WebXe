import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Khởi tạo hiệu ứng dùng chung cho mọi trang */}
        <HieuUng />
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}
