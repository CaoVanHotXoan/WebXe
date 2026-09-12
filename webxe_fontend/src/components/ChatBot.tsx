import { FormEvent, useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/TS/vehicleData';
import styles from './ChatBot.module.css';

export interface CarItem {
  id: number;
  name: string;
  price: number;
  style?: string;
  type?: string;
  imageUrl: string;
  specs?: Record<string, string>;
}

const SYSTEM_PROMPT = `Role: Chuyên gia tư vấn xe cao cấp của cửa hàng TEAM BẤT ỔN.
Tone: Tự nhiên, thân thiện, lịch sự, hào hứng và am hiểu kỹ thuật nhưng biết cách giải thích dễ hiểu.
Quy tắc Giao tiếp:
- Tự nhiên & Thân thiện: Biết chào hỏi, trò chuyện xã giao (small-talk), biết lắng nghe và thấu hiểu tâm lý người mua (lần đầu mua xe, lo lắng chi phí bảo dưỡng, phân vân giữa xe số và xe tay ga...).
- Ghi nhớ ngữ cảnh (Context Memory): Theo dõi sát luồng trò chuyện để phản hồi chính xác các câu hỏi nối tiếp (Ví dụ: "Nó có tiết kiệm xăng không?", "Màu đỏ còn không?").
- Lắng nghe và dẫn dắt: Trả lời bằng Markdown gọn gàng. Luôn gợi ý bước tiếp theo hoặc câu hỏi mở ở cuối câu (ví dụ: "Bạn muốn đăng ký lái thử hay xem thêm thông số chi tiết của mẫu xe này?").
Quy tắc Tư vấn:
- Tìm xe theo yêu cầu & Tầm giá: Đưa ra 2 - 3 gợi ý tốt nhất dựa trên khoảng tài chính khách đưa ra kèm ưu/nhược điểm ngắn gọn.
- Đề xuất theo phong cách: Gợi ý xe theo cá tính (Thể thao/Sportbike, Cổ điển/Classic, Đô thị/Scooter, Đường trường/Adventure...).
- Thông tin cửa hàng: Khi khách hỏi địa chỉ, trả lời "Showroom TEAM BẤT ỔN, Số 1 Đại Cồ Việt, Hà Nội". Khi hỏi số điện thoại, trả lời "Hotline: 1900 8888" hoặc gợi ý đặt lịch xem xe.
- Cấu trúc Render: Để gợi ý mẫu xe cụ thể, BẮT BUỘC trả về mã HTML tùy chỉnh với định dạng <CarCard id="{id_xe}"/> để hệ thống hiển thị thẻ xe UI đẹp mắt (không bọc trong dấu backticks). Ví dụ: <CarCard id="1"/>`;

type ChatMessage = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  vehicleId?: number | null;
};

function renderMessage(text: string, vehicles: Vehicle[], onBook?: (vehicleId: string) => void) {
  // Tách chuỗi dựa trên định dạng thẻ Custom Tag <CarCard id="..." />
  const parts = text.split(/(<CarCard\s+id="[^"]+"\s*\/>)/g);

  return parts.map((part, index) => {
    // Kiểm tra xem part này có phải là thẻ CarCard không
    const carMatch = part.match(/<CarCard\s+id="([^"]+)"\s*\/>/);
    if (carMatch) {
      const vehicleIdStr = carMatch[1];
      const vehicleId = parseInt(vehicleIdStr, 10);
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        return (
          <div key={`car-${vehicleId}-${index}`} className={styles.customCarCard}>
            <img src={vehicle.image} alt={vehicle.title} className={styles.customCarImage} />
            <div className={styles.customCarInfo}>
              <h4>{vehicle.title}</h4>
              <p className={styles.customCarPrice}>{vehicle.priceLabel}</p>
              <div className={styles.customCarActions}>
                {onBook && (
                  <button type="button" onClick={() => onBook(vehicleIdStr)} className={styles.btnBook}>
                    Lái thử
                  </button>
                )}
                <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={styles.btnViewDetails}>Xem chi tiết</Link>
              </div>
            </div>
          </div>
        );
      } else {
        return <span key={`car-not-found-${index}`}>[Xe không tìm thấy]</span>;
      }
    }

    // Hiển thị text bình thường kèm xử lý ảnh Markdown ![alt](url) và in đậm **text**
    return (
      <Fragment key={`text-${index}`}>
        {part.split('\n').map((line, lineIndex) => {
          const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

          // Trình parse in đậm cơ bản
          const renderBold = (str: string) => {
            const boldParts = str.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bp, i) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={i}>{bp.slice(2, -2)}</strong>;
              }
              return bp;
            });
          };

          return (
            <span key={`${line}-${lineIndex}`}>
              {imageMatch ? <img className={styles.messageImage} src={imageMatch[2]} alt={imageMatch[1]} /> : renderBold(line)}
              {lineIndex < part.split('\n').length - 1 && <br />}
            </span>
          );
        })}
      </Fragment>
    );
  });
}

const quickQuestions = ['Có những xe nào đang bán?', 'Xe nào dưới 500 triệu?', 'Tôi muốn mua xe điện'];
const extraQuestions = ['Xe nào còn hàng?', 'Hãng Honda có xe nào?', 'Thông tin Ford Mustang GT 2024', 'Xe màu đen có những mẫu nào?', 'Tôi muốn đặt xe'];

export default function ChatBot({ vehicles }: { vehicles: Vehicle[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [nextId, setNextId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingVehicles, setBookingVehicles] = useState<Vehicle[]>(vehicles);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ vehicleId: String(vehicles[0]?.id || ''), name: '', phone: '', address: '', paymentMethod: 'Thanh toán khi nhận xe' });
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/data/json`)
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
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedQuestion,
          history: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...[...messages, userMessage].map((message) => ({
              role: message.sender === 'user' ? 'user' : 'assistant',
              content: message.text,
            }))
          ],
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
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
            <div className={styles.avatar} aria-hidden="true">AI</div>
            <div>
              <h2>Trợ lý WebXe</h2>
              <p>Đang sẵn sàng tư vấn</p>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Đóng chatbot">×</button>
          </header>

          <div className={styles.messages} aria-live="polite">
            {messages.map((message) => (
              <div className={`${styles.messageRow} ${message.sender === 'user' ? styles.userRow : ''}`} key={message.id}>
                <div className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                  <p>
                    {renderMessage(message.text, vehicles, (vehicleId) => {
                      setBooking((current) => ({ ...current, vehicleId }));
                      setShowBooking(true);
                    })}
                  </p>
                  {message.sender === 'bot' && message.vehicleId && !message.text.includes('<CarCard') && <Link className={styles.vehicleLink} href={`/ChiTietXe/ChiTietXe?id=${message.vehicleId}`}>Xem thêm</Link>}
                </div>
              </div>
            ))}
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
          <form className={styles.form} onSubmit={handleSubmit}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Hỏi về mẫu xe, giá, hãng..." aria-label="Nhập câu hỏi" />
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
