import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/TS/vehicleData';
import { BACKEND_URL } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import styles from './ChatBot.module.css';

type ChatMessage = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  vehicleId?: number | null;
};

type SupportMessage = {
  MaTinNhan: number;
  MaNguoiGui: number;
  NoiDung: string;
  ThoiGian: string;
};

type SupportConversationResponse = {
  conversation: { MaCuocHoiThoai: number };
  messages: SupportMessage[];
};

function renderMessage(text: string) {
  return text.split('\n').map((line, index) => {
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    return (
      <span key={`${line}-${index}`}>
        {imageMatch ? <img className={styles.messageImage} src={imageMatch[2]} alt={imageMatch[1]} /> : line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

const quickQuestions = ['Có những xe nào đang bán?', 'Xe nào dưới 500 triệu?', 'Tôi muốn mua xe điện'];
const extraQuestions = ['Xe nào còn hàng?', 'Hãng Honda có xe nào?', 'Thông tin Ford Mustang GT 2024', 'Xe màu đen có những mẫu nào?', 'Tôi muốn đặt xe'];

export default function ChatBot({ vehicles }: { vehicles: Vehicle[] }) {
  const { token, user, isAdmin, status } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [nextId, setNextId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingVehicles, setBookingVehicles] = useState<Vehicle[]>(vehicles);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ vehicleId: String(vehicles[0]?.id || ''), name: '', phone: '', address: '', paymentMethod: 'Thanh toán khi nhận xe' });
  const [bookingMessage, setBookingMessage] = useState('');
  const [supportConversationId, setSupportConversationId] = useState<number | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [supportError, setSupportError] = useState('');

  const supportHeaders = useMemo<HeadersInit>(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, [token]);

  const loadSupportConversation = useCallback(async (): Promise<number | null> => {
    if (!token || !user || isAdmin) return null;
    const response = await fetch(`${BACKEND_URL}/chat/conversation`, { headers: supportHeaders, credentials: 'include' });
    const data = await response.json() as SupportConversationResponse & { message?: string };
    if (!response.ok) throw new Error(data.message || 'Không thể tải cuộc hội thoại.');
    setSupportConversationId(data.conversation.MaCuocHoiThoai);
    setSupportMessages(data.messages);
    return data.conversation.MaCuocHoiThoai;
  }, [isAdmin, supportHeaders, token, user]);

  useEffect(() => {
    if (status === 'loading' || !token || !user || isAdmin) return;
    void loadSupportConversation().catch((error) => setSupportError(error instanceof Error ? error.message : 'Không thể kết nối hỗ trợ.'));
    const interval = window.setInterval(() => {
      void loadSupportConversation().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isAdmin, loadSupportConversation, status, token, user]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/data/json`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Không tải được danh sách xe')))
      .then((data: { Xe?: Array<{ MaXe: number; TenXe?: string; Gia?: number | string; SoLuong?: number }> }) => {
        const liveVehicles = (data.Xe ?? []).filter((vehicle) => vehicle.TenXe && Number(vehicle.Gia) > 0).map((vehicle) => ({
          id: vehicle.MaXe,
          title: vehicle.TenXe as string,
          price: Number(vehicle.Gia),
          priceLabel: `${Number(vehicle.Gia).toLocaleString('vi-VN')} VNĐ`,
          image: '',
        }));
        if (liveVehicles.length) {
          setBookingVehicles(liveVehicles);
          setBooking((current) => ({ ...current, vehicleId: String(liveVehicles[0].id) }));
        }
      })
      .catch(() => undefined);
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'bot', text: 'Xin chào! Mình là trợ lý WebXe. Mình có thể giúp bạn tìm mẫu xe và thông tin giá bán.' },
  ]);

  const sendMessage = async (value: string) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion || isLoading) return;
    const userMessage = { id: nextId, sender: 'user' as const, text: trimmedQuestion };
    setMessages((current) => [...current, userMessage]);
    setNextId((current) => current + 2);
    setQuestion('');

    if (token && user && !isAdmin) {
      try {
        let conversationId = supportConversationId;
        if (!conversationId) {
          conversationId = await loadSupportConversation();
        }
        if (!conversationId) throw new Error('Chưa tạo được cuộc hội thoại.');
        const response = await fetch(`${BACKEND_URL}/chat/messages`, {
          method: 'POST',
          headers: supportHeaders,
          credentials: 'include',
          body: JSON.stringify({ conversationId, message: trimmedQuestion }),
        });
        const data = await response.json() as { message?: string };
        if (!response.ok) throw new Error(data.message || 'Không thể gửi tin nhắn.');
        setSupportError('');
        await loadSupportConversation();
      } catch (error) {
        setSupportError(error instanceof Error ? error.message : 'Không thể gửi tin nhắn.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedQuestion,
          history: [...messages, userMessage].map((message) => ({
            role: message.sender === 'user' ? 'user' : 'assistant',
            content: message.text,
          })),
        }),
      });
      const data = await response.json() as { message?: string; vehicleId?: number | null };
      if (!response.ok) throw new Error(data.message || 'Không thể kết nối trợ lý AI.');
      setMessages((current) => [...current, { id: nextId + 1, sender: 'bot', text: data.message || 'Trợ lý chưa có câu trả lời.', vehicleId: data.vehicleId }]);
    } catch (error) {
      setMessages((current) => [...current, { id: nextId + 1, sender: 'bot', text: error instanceof Error ? error.message : 'Không thể kết nối trợ lý AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(question);
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingMessage('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setBookingMessage('Bạn cần đăng nhập trước khi đặt xe.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...booking, vehicleId: Number(booking.vehicleId), quantity: 1 }),
      });
      const data = await response.json() as { message?: string; orderId?: number };
      if (!response.ok) throw new Error(data.message || 'Không thể đặt xe.');
      setBookingMessage(`${data.message} Mã đơn: ${data.orderId}.`);
      setShowBooking(false);
    } catch (error) {
      setBookingMessage(error instanceof Error ? error.message : 'Không thể kết nối máy chủ.');
    }
  };

  return (
    <div className={styles.chatbot}>
      {isOpen && (
        <section className={styles.window} aria-label="Trợ lý tư vấn WebXe">
          <header className={styles.header}>
            <div className={styles.avatar} aria-hidden="true">{token && user && !isAdmin ? 'CS' : 'AI'}</div>
            <div>
              <h2>{token && user && !isAdmin ? 'Chăm sóc khách hàng' : 'Trợ lý WebXe'}</h2>
              <p>{token && user && !isAdmin ? 'Kết nối trực tiếp với Admin' : 'Đang sẵn sàng tư vấn'}</p>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Đóng chatbot">×</button>
          </header>

          <div className={styles.messages} aria-live="polite">
            {token && user && !isAdmin ? (
              supportMessages.map((message) => (
                <div className={`${styles.messageRow} ${message.MaNguoiGui === user.id ? styles.userRow : ''}`} key={message.MaTinNhan}>
                  <div className={`${styles.message} ${message.MaNguoiGui === user.id ? styles.userMessage : styles.botMessage}`}>
                    <p>{renderMessage(message.NoiDung)}</p>
                    <small>{new Date(message.ThoiGian).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </div>
              ))
            ) : messages.map((message) => (
                <div className={`${styles.messageRow} ${message.sender === 'user' ? styles.userRow : ''}`} key={message.id}>
                  <div className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                    <p>{renderMessage(message.text)}</p>
                    {message.sender === 'bot' && message.vehicleId && <Link className={styles.vehicleLink} href={`/ChiTietXe/ChiTietXe?id=${message.vehicleId}`}>Xem thêm</Link>}
                  </div>
                </div>
              ))}
            {supportError && <p className={styles.bookingMessage}>{supportError}</p>}
            {isLoading && <div className={styles.messageRow}><div className={`${styles.message} ${styles.botMessage}`}><p>Đang tìm thông tin và trả lời...</p></div></div>}
          </div>

          <div className={styles.quickQuestions}>
            {[...quickQuestions, ...extraQuestions].map((quickQuestion) => <button type="button" key={quickQuestion} onClick={() => quickQuestion === 'Tôi muốn đặt xe' ? setShowBooking(true) : void sendMessage(quickQuestion)} disabled={isLoading}>{quickQuestion}</button>)}
          </div>
          {bookingMessage && <p className={styles.bookingMessage}>{bookingMessage}{bookingMessage.includes('đăng nhập') && <Link href="/Login/Login"> Đăng nhập →</Link>}</p>}
          {showBooking && <form className={styles.bookingForm} onSubmit={submitBooking}>
            <div className={styles.bookingHeading}><strong>Đặt xe</strong><button type="button" onClick={() => setShowBooking(false)} aria-label="Đóng form đặt xe">×</button></div>
            <select value={booking.vehicleId} onChange={(event) => setBooking((current) => ({ ...current, vehicleId: event.target.value }))} aria-label="Chọn xe">
              {bookingVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.title} - {vehicle.priceLabel}</option>)}
            </select>
            <input value={booking.name} onChange={(event) => setBooking((current) => ({ ...current, name: event.target.value }))} placeholder="Họ tên người nhận" required />
            <input value={booking.phone} onChange={(event) => setBooking((current) => ({ ...current, phone: event.target.value }))} placeholder="Số điện thoại" inputMode="tel" required />
            <input value={booking.address} onChange={(event) => setBooking((current) => ({ ...current, address: event.target.value }))} placeholder="Địa chỉ nhận xe" required />
            <select value={booking.paymentMethod} onChange={(event) => setBooking((current) => ({ ...current, paymentMethod: event.target.value }))} aria-label="Phương thức thanh toán">
              <option>Thanh toán khi nhận xe</option><option>Chuyển khoản</option>
            </select>
            <button type="submit">Xác nhận đặt xe</button>
          </form>}
          {!token && <p className={styles.bookingMessage}>Đăng nhập để nhắn tin trực tiếp với Admin.<Link href="/Login/Login"> Đăng nhập →</Link></p>}
          <form className={styles.form} onSubmit={handleSubmit}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={token && user && !isAdmin ? 'Nhắn tin cho Admin...' : 'Hỏi về mẫu xe, giá, hãng...'} aria-label="Nhập câu hỏi" />
            <button type="submit" aria-label="Gửi câu hỏi" disabled={isLoading}>↑</button>
          </form>
        </section>
      )}
      <button type="button" className={styles.launcher} onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}>
        <span className={styles.launcherIcon} aria-hidden="true">✦</span>
        <span>{isOpen ? 'Đóng' : 'Hỏi WebXe'}</span>
      </button>
    </div>
  );
}
