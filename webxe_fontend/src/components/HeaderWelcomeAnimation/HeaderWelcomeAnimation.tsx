import React, { useState, useEffect, useRef } from 'react';

export interface HeaderWelcomeAnimationProps {
  username: string;
  isDataLoaded: boolean;
  isAdmin?: boolean;
  onAnimationComplete: () => void;
}

const HeaderWelcomeAnimation: React.FC<HeaderWelcomeAnimationProps> = ({
  username,
  isDataLoaded,
  isAdmin,
  onAnimationComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showText, setShowText] = useState(false);
  const [carState, setCarState] = useState<'driving' | 'idling'>('driving');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Kích hoạt duy nhất 1 lần dựa vào sessionStorage
    const hasPlayed = sessionStorage.getItem('welcomeAnimationPlayed');
    if (hasPlayed === 'true') {
      onAnimationComplete();
      return;
    }

    // Role-based logic: Admin chỉ thấy khi đã vào Backend rồi quay lại Frontend
    if (isAdmin) {
      const adminInBackend = sessionStorage.getItem('adminInBackend');
      if (adminInBackend !== 'true') {
        return;
      }
    }

    if (isDataLoaded && !isSkipped) {
      setIsPlaying(true);
      setCarState('driving');

      // Hiển thị chữ sau 2.5s
      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 2500);

      // Chuyển sang trạng thái đậu (idling) sau khoảng 5s
      const idleTimer = setTimeout(() => {
        setCarState('idling');
      }, 5000);

      // Bắt đầu fade out trước khi kết thúc 9s
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 8500);

      // Hoàn tất toàn bộ sau 9s
      const completeTimer = setTimeout(() => {
        handleComplete();
      }, 9000);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(idleTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isDataLoaded, isSkipped]);

  // Xử lý hạt bụi/cát bằng Canvas (chạy trong lúc xe di chuyển)
  useEffect(() => {
    if (!isPlaying || isSkipped || carState !== 'driving' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 96; // h-24 = 96px
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;

      constructor() {
        // Hạt bụi xuất hiện ở khoảng đuôi xe (bên phải xe đang chạy từ phải qua trái)
        this.x = window.innerWidth / 2 + 100 + Math.random() * 150;
        this.y = 70 + Math.random() * 20; 
        this.vx = (Math.random() * 8 + 3); // Bay mạnh về phía sau (phải)
        this.vy = (Math.random() * -3 - 0.5); // Bay lên nhẹ
        this.size = Math.random() * 4 + 1;
        this.maxLife = Math.random() * 40 + 20;
        this.life = this.maxLife;
        // Màu cát/bụi
        const shades = ['#d1d5db', '#a8a29e', '#78716c', '#e7e5e4', '#d6d3d1'];
        this.color = shades[Math.floor(Math.random() * shades.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.98; // Nhỏ dần
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particles: Particle[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Thêm hạt mới mỗi frame để tạo hiệu ứng bụi dày
      if (Math.random() < 0.8) {
        particles.push(new Particle());
        particles.push(new Particle());
        particles.push(new Particle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isSkipped, carState]);

  const handleComplete = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsPlaying(false);
      sessionStorage.setItem('welcomeAnimationPlayed', 'true');
      onAnimationComplete();
    }, 500); // Đợi CSS transition (500ms) mờ dần
  };

  const handleSkip = () => {
    setIsSkipped(true);
    handleComplete();
  };

  if (!isPlaying && !isFadingOut) {
    return null; // Ẩn hoàn toàn khi không chạy
  }

  // Sử dụng ảnh xe đua F1 hiện đại, sắc nét (Placeholder dạng SVG chất lượng)
  // Trong thực tế, bạn nên dùng một file .png tách nền (transparent) có độ chi tiết cao
  const f1CarImageUrl = "https://www.svgrepo.com/show/400615/racing-car.svg"; 

  return (
    <div 
      className={`fixed top-0 left-0 w-full h-24 z-[9999] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleSkip}
      title="Nhấp vào bất kỳ đâu để bỏ qua"
    >
      <style>{`
        .f1-car-wrapper { animation: f1DriveAndStop 9s linear forwards; will-change: transform; }
        @keyframes f1DriveAndStop {
          0% { transform: translateX(100vw) scale(1); }
          30% { transform: translateX(10vw) scale(1); }
          50% { transform: translateX(0vw) scale(1); }
          55% { transform: translateX(0vw) scale(1); }
          56% { transform: translateX(0vw) scale(1) translateY(-1px); }
          60% { transform: translateX(0vw) scale(1) translateY(1px); }
          65% { transform: translateX(0vw) scale(1) translateY(-1px); }
          70% { transform: translateX(0vw) scale(1) translateY(1px); }
          75% { transform: translateX(0vw) scale(1) translateY(-1px); }
          80% { transform: translateX(0vw) scale(1) translateY(1px); }
          85% { transform: translateX(0vw) scale(1) translateY(-1px); }
          90% { transform: translateX(0vw) scale(1) translateY(1px); }
          95% { transform: translateX(0vw) scale(1) translateY(-1px); }
          100% { transform: translateX(0vw) scale(1) translateY(0); }
        }
        .wind-streak {
          position: absolute; background: linear-gradient(90deg, rgba(59, 130, 246, 0.8), transparent, transparent);
          height: 2px; width: 200px; border-radius: 50%; animation: windStreakMove 0.4s infinite linear; opacity: 0; right: -100px;
        }
        .wind-streak-1 { top: 30%; width: 250px; animation-delay: 0.1s; right: -120px; }
        .wind-streak-2 { top: 60%; width: 180px; animation-delay: 0.3s; right: -80px; }
        .wind-streak-3 { top: 85%; width: 300px; animation-delay: 0.2s; right: -150px; }
        .f1-car-wrapper.driving .wind-streak { opacity: 1; }
        @keyframes windStreakMove {
          0% { transform: translateX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(300px); opacity: 0; }
        }
        .exhaust-smoke {
          position: absolute; bottom: 15px; right: 0px; width: 20px; height: 20px;
          background: rgba(107, 114, 128, 0.3); border-radius: 50%; filter: blur(5px); opacity: 0;
        }
        .f1-car-wrapper.idling .exhaust-smoke { animation: smokePuff 1.5s infinite ease-out; }
        @keyframes smokePuff {
          0% { transform: scale(0.5) translate(0, 0); opacity: 0.6; }
          100% { transform: scale(3) translate(30px, -20px); opacity: 0; }
        }
        .welcome-text {
          opacity: 0; transform: translateY(15px) scale(0.95); animation: textFadeIn 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes textFadeIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {/* Canvas for Dust & Sand Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-10"
      />

      <div className="relative w-full max-w-7xl mx-auto flex items-center px-6 h-full z-20">
        
        {/* Vị trí Menu Logo cũ (Giữ lại logo TEAM BẤT ỔN để đè lên đẹp hơn) */}
        <div className="flex items-center opacity-40">
          <div className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
            TEAM BẤT ỔN
          </div>
        </div>
        
        {/* Chữ Chào mừng */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          {showText && (
            <h2 className="welcome-text text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                CHÀO MỪNG !
              </span>
              <span className="text-gray-900 border-b-4 border-blue-600 pb-1 rounded-sm">{username}</span>
            </h2>
          )}
        </div>

        {/* F1 Car Animation Container */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center h-full z-40">
          <div className={`f1-car-wrapper relative ${carState}`}>
            
            {/* Wind Streaks (Dải khí động học) */}
            <div className="wind-streak wind-streak-1"></div>
            <div className="wind-streak wind-streak-2"></div>
            <div className="wind-streak wind-streak-3"></div>
            
            {/* F1 Car Element */}
            <div className="relative w-[280px] h-auto drop-shadow-2xl transform -scale-x-100"> 
               <img 
                 src={f1CarImageUrl} 
                 alt="F1 Racing Car" 
                 className="w-full h-full object-contain filter contrast-125 saturate-150" 
                 style={{ 
                   filter: "drop-shadow(0px 10px 8px rgba(0,0,0,0.2))"
                 }}
               />
            </div>

            {/* Khói động cơ khi xe đậu */}
            <div className="exhaust-smoke"></div>
            <div className="exhaust-smoke" style={{ animationDelay: '0.4s' }}></div>
            <div className="exhaust-smoke" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default HeaderWelcomeAnimation;
