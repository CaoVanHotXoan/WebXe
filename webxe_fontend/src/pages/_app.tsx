import "@/styles/globals.css";
import "@/styles/HeaderFooter.css";
import type { AppProps } from "next/app";
import HieuUng from "@/TS/HieuUng";
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {/* Khởi tạo hiệu ứng tia lửa dùng chung cho mọi trang. */}
      <HieuUng />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
