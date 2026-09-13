import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_URL } from "@/services/api";
import styles from "./chamSocKH.module.css";

type Message = { id: number; text: string; time: string; mine?: boolean };
type Conversation = {
  id: number;
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  unread?: number;
  messages: Message[];
};

type ApiConversation = {
  MaCuocHoiThoai: number;
  MaKhachHang: number;
  TrangThai: string;
  TenKhachHang: string;
  TinNhanCuoi?: string | null;
  ThoiGianTinNhanCuoi?: string | null;
};

type ApiMessage = { MaTinNhan: number; MaNguoiGui: number; NoiDung: string; ThoiGian: string };

const initialConversations: Conversation[] = [];
/*
  {
    id: 1,
    name: "Mai Anh",
    initials: "MA",
    color: "#f59e0b",
    preview: "Mình muốn hỏi về mẫu xe mới.",
    time: "10:42",
    unread: 2,
    messages: [
      { id: 1, text: "Chào WebXe, mình muốn hỏi về mẫu xe mới.", time: "10:38" },
      { id: 2, text: "Chào Mai Anh, mình có thể hỗ trợ bạn ngay đây.", time: "10:39", mine: true },
      { id: 3, text: "Bạn đang quan tâm dòng xe nào vậy?", time: "10:42", mine: true },
    ],
  },
  {
    id: 2,
    name: "Quốc Bảo",
    initials: "QB",
    color: "#0ea5e9",
    preview: "Cảm ơn bạn, thông tin rất hữu ích!",
    time: "09:15",
    messages: [
      { id: 4, text: "Xe có hỗ trợ trả góp không ạ?", time: "09:11" },
      { id: 5, text: "Có nhé, bên mình sẽ tư vấn gói phù hợp với nhu cầu của bạn.", time: "09:14", mine: true },
      { id: 6, text: "Cảm ơn bạn, thông tin rất hữu ích!", time: "09:15" },
    ],
  },
  {
    id: 3,
    name: "Thanh Hà",
    initials: "TH",
    color: "#8b5cf6",
    preview: "Mình sẽ ghé showroom chiều nay.",
    time: "Hôm qua",
    messages: [
      { id: 7, text: "Showroom mình mở cửa đến mấy giờ?", time: "Hôm qua" },
      { id: 8, text: "Bên mình mở cửa đến 20:00 mỗi ngày ạ.", time: "Hôm qua", mine: true },
    ],
  },
  {
    id: 4,
    name: "Trung tâm bảo hành",
    initials: "BH",
    color: "#10b981",
    preview: "Đã gửi lịch hẹn bảo dưỡng.",
    time: "Thứ 6",
    messages: [
      { id: 9, text: "Đã gửi lịch hẹn bảo dưỡng.", time: "Thứ 6" },
    ],
  },
]; */

export default function ChamSocKHPage() {
  const { token, user, isAdmin, status } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");

  useEffect(() => {
    if (status === "loading" || !token || !isAdmin) return;
    const loadConversations = async () => {
      const response = await fetch(`${BACKEND_URL}/chat/conversations`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      const data = await response.json() as { conversations?: ApiConversation[]; message?: string };
      if (!response.ok) throw new Error(data.message || "Không thể tải cuộc hội thoại.");
      const liveConversations = (data.conversations ?? []).map((conversation, index) => ({
        id: conversation.MaCuocHoiThoai,
        name: conversation.TenKhachHang,
        initials: conversation.TenKhachHang.split(" ").map((part) => part[0]).join("").slice(-2).toUpperCase(),
        color: ["#f59e0b", "#0ea5e9", "#8b5cf6", "#10b981"][index % 4],
        preview: conversation.TinNhanCuoi || "Chưa có tin nhắn",
        time: conversation.ThoiGianTinNhanCuoi ? new Date(conversation.ThoiGianTinNhanCuoi).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Mới",
        messages: [],
      }));
      setConversations(liveConversations);
      if (liveConversations[0]) setSelectedId((current) => liveConversations.some((item) => item.id === current) ? current : liveConversations[0].id);
    };
    void loadConversations().catch(() => undefined);
  }, [isAdmin, status, token]);

  useEffect(() => {
    if (status === "loading" || !token || !isAdmin || !selectedId) return;
    const loadMessages = async () => {
      const response = await fetch(`${BACKEND_URL}/chat/conversations/${selectedId}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
      const data = await response.json() as { messages?: ApiMessage[] };
      if (!response.ok) return;
      setConversations((current) => current.map((conversation) => conversation.id === selectedId ? {
        ...conversation,
        messages: (data.messages ?? []).map((message) => ({ id: message.MaTinNhan, text: message.NoiDung, time: new Date(message.ThoiGian).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), mine: message.MaNguoiGui === user?.id })),
      } : conversation));
    };
    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 5000);
    return () => window.clearInterval(interval);
  }, [isAdmin, selectedId, status, token, user?.id]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return conversations.filter((conversation) => !keyword || `${conversation.name} ${conversation.preview}`.toLowerCase().includes(keyword));
  }, [conversations, search]);

  const selectConversation = (id: number) => {
    setSelectedId(id);
    setConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation));
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    if (token && isAdmin) {
      void fetch(`${BACKEND_URL}/chat/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId: selectedId, message: text }),
      }).then(() => setMessage("")).catch(() => undefined);
      return;
    }
    const time = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setConversations((current) => current.map((conversation) => conversation.id === selectedId ? {
      ...conversation,
      preview: text,
      time,
      messages: [...conversation.messages, { id: Date.now(), text, time, mine: true }],
    } : conversation));
    setMessage("");
  };

  return (
    <>
      <Head>
        <title>Chăm sóc khách hàng | WebXe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.page}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div>
              <p className={styles.eyebrow}>WEBXE SUPPORT</p>
              <h1>Đoạn chat</h1>
            </div>
            <div className={styles.topActions}>
              <button type="button" aria-label="Tùy chọn" title="Tùy chọn">•••</button>
              <button type="button" aria-label="Tạo cuộc trò chuyện" title="Tạo cuộc trò chuyện">↗</button>
            </div>
          </div>

          <label className={styles.searchBox}>
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm cuộc trò chuyện" />
          </label>

          <div className={styles.tabs} role="tablist" aria-label="Bộ lọc cuộc trò chuyện">
            {["Tất cả", "Chưa đọc", "Đã xử lý"].map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? styles.activeTab : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>

          <div className={styles.conversationList}>
            {filteredConversations.map((conversation) => (
              <button key={conversation.id} type="button" className={`${styles.conversation} ${selectedConversation?.id === conversation.id ? styles.selectedConversation : ""}`} onClick={() => selectConversation(conversation.id)}>
                <span className={styles.avatar} style={{ backgroundColor: conversation.color }}>{conversation.initials}</span>
                <span className={styles.conversationCopy}>
                  <span className={styles.conversationName}>{conversation.name}</span>
                  <span className={styles.conversationPreview}>{conversation.preview}</span>
                </span>
                <span className={styles.conversationMeta}>
                  <span>{conversation.time}</span>
                  {conversation.unread ? <b>{conversation.unread}</b> : null}
                </span>
              </button>
            ))}
            {!filteredConversations.length && <p className={styles.emptyState}>Không tìm thấy cuộc trò chuyện.</p>}
          </div>

          <Link className={styles.backLink} href="/DatabaseDashboard/DatabaseDashboard">← Về Dashboard</Link>
        </aside>

        <section className={styles.chatPanel}>
          {selectedConversation ? <>
          <header className={styles.chatHeader}>
            <div className={styles.profileLine}>
              <span className={styles.avatar} style={{ backgroundColor: selectedConversation.color }}>{selectedConversation.initials}</span>
              <div>
                <h2>{selectedConversation.name}</h2>
                <p><span className={styles.onlineDot} /> Đang hoạt động</p>
              </div>
            </div>
            <div className={styles.chatActions}>
              <button type="button" aria-label="Gọi điện" title="Gọi điện">☎</button>
              <button type="button" aria-label="Thông tin" title="Thông tin">ⓘ</button>
            </div>
          </header>

          <div className={styles.chatBody}>
            <div className={styles.dateDivider}><span>Hôm nay</span></div>
            <div className={styles.messageList}>
              {selectedConversation.messages.map((item) => (
                <div key={item.id} className={`${styles.messageRow} ${item.mine ? styles.myMessage : ""}`}>
                  <div className={styles.messageBubble}>
                    <p>{item.text}</p>
                    <time>{item.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <div className={styles.composerTools}>
              <button type="button" aria-label="Đính kèm tệp" title="Đính kèm tệp">＋</button>
              <button type="button" aria-label="Thêm hình ảnh" title="Thêm hình ảnh">▣</button>
            </div>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập tin nhắn hỗ trợ..." aria-label="Nội dung tin nhắn" />
            <button className={styles.sendButton} type="submit" aria-label="Gửi tin nhắn" title="Gửi tin nhắn">➤</button>
          </form>
          </> : (
            <div className={styles.emptyChat}>
              <strong>Chưa có cuộc hội thoại</strong>
              <span>Cuộc trò chuyện của khách hàng sẽ hiển thị tại đây.</span>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
