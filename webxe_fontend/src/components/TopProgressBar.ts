/**
 * Module TopProgressBar
 * Thanh tiến trình tải trang thiết kế theo phong cách Modern Minimalist
 * Sử dụng Tailwind CSS & CSS thuần với API điều khiển bằng TypeScript.
 */

class ProgressBar {
  private element: HTMLElement | null = null;
  private progress: number = 0;
  private timer: number | null = null;
  private isComplete: boolean = false;

  private activeRequests: number = 0;

  /**
   * Khởi tạo và chèn DOM element vào body nếu chưa tồn tại
   */
  private create() {
    if (typeof document === 'undefined') return;
    if (this.element) return;

    this.element = document.createElement('div');
    this.element.id = 'top-progress-bar';

    // Sử dụng Tailwind CSS để style cơ bản, bao gồm Gradient Accent và Transition
    // Màu gradient từ Indigo (chàm) sang Cyan (lục lam)
    this.element.className =
      'fixed top-0 left-0 h-[3px] z-[9999] pointer-events-none ' +
      'transition-all duration-300 ease-out opacity-0 ' +
      'bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400';

    this.element.style.width = '0%';

    // Element con để tạo hiệu ứng phát sáng nhẹ (Subtle Glow / Head Box Shadow) ở đầu tiến trình
    const glowHead = document.createElement('div');
    glowHead.className =
      'absolute right-0 top-0 h-full w-[100px] ' +
      'shadow-[0_0_12px_#22d3ee,0_0_6px_#22d3ee] rounded-full ' +
      'transform translate-x-1/2 opacity-100';

    this.element.appendChild(glowHead);
    document.body.appendChild(this.element);
  }

  /**
   * Bắt đầu tiến trình tải, tăng dần tự động tới ~90%
   */
  public start() {
    if (typeof window === 'undefined') return;

    this.activeRequests++;
    if (this.activeRequests > 1) return; // Đã đang chạy rồi, không cần start lại

    this.create();

    this.isComplete = false;
    this.set(0);

    // Hiển thị thanh bar
    if (this.element) {
      this.element.classList.remove('opacity-0');
      this.element.classList.add('opacity-100');
    }

    // Dọn dẹp timer cũ (tránh rò rỉ)
    if (this.timer) {
      window.clearInterval(this.timer);
    }

    // Trickle Effect: Tăng dần ngẫu nhiên
    this.timer = window.setInterval(() => {
      if (this.isComplete) {
        if (this.timer) window.clearInterval(this.timer);
        return;
      }

      const amount = this.trickleAmount(this.progress);
      this.set(this.progress + amount);
    }, 500);
  }

  /**
   * Cài đặt tiến trình cụ thể (0 - 100)
   */
  public set(n: number) {
    if (typeof window === 'undefined') return;
    this.create();

    // Ràng buộc giá trị từ 0 đến 100
    n = Math.max(0, Math.min(100, n));
    this.progress = n;

    if (this.element) {
      // Cập nhật chiều rộng với CSS Variable / style width
      this.element.style.width = `${this.progress}%`;

      // Đảm bảo hiển thị nếu progress đang nằm giữa chừng (ví dụ được set manual)
      if (this.progress > 0 && this.progress < 100 && !this.isComplete) {
        this.element.classList.remove('opacity-0');
        this.element.classList.add('opacity-100');
      }
    }
  }

  /**
   * Hoàn thành tiến trình: Nhảy 100%, dừng 0.2s, sau đó fade out và reset.
   * @param force - Bắt buộc hoàn thành ngay lập tức bỏ qua số lượng request đang chờ
   */
  public complete(force: boolean = false) {
    if (typeof window === 'undefined') return;

    if (this.activeRequests > 0) {
      this.activeRequests--;
    }

    if (!force && this.activeRequests > 0) return; // Vẫn còn request khác đang chạy

    this.activeRequests = 0; // Đảm bảo reset bộ đếm

    if (this.isComplete) return;

    this.isComplete = true;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    // Nhảy lên ngay 100%
    this.set(100);

    // Giữ lại một khoảng thời gian (0.2s) rồi ẩn dần (Fade-out)
    setTimeout(() => {
      if (this.element) {
        this.element.classList.remove('opacity-100');
        this.element.classList.add('opacity-0');
      }

      // Reset state về 0% sau khi hiệu ứng mờ kết thúc (khoảng 300ms do Tailwind duration-300)
      setTimeout(() => {
        if (this.isComplete) { // Kiểm tra để không reset nhầm nếu như vừa start lại ngay lập tức
          this.reset();
        }
      }, 300);
    }, 200);
  }

  /**
   * Reset tiến trình ngay lập tức
   */
  public reset() {
    if (typeof window === 'undefined') return;

    this.activeRequests = 0;
    this.progress = 0;
    this.isComplete = false;

    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    if (this.element) {
      // Hủy hiệu ứng transition ngang khi reset về 0 để không bị tua lùi
      const transition = this.element.style.transition;
      this.element.style.transition = 'none';
      this.element.style.width = '0%';
      this.element.classList.remove('opacity-100');
      this.element.classList.add('opacity-0');

      // Phục hồi lại transition sau 1 frame
      requestAnimationFrame(() => {
        if (this.element) {
          this.element.style.transition = transition;
        }
      });
    }
  }

  /**
   * Tính toán lượng progress tăng lên mỗi bước trickle
   */
  private trickleAmount(current: number): number {
    if (current >= 95) return 0;

    let amount = 0;
    if (current >= 0 && current < 20) {
      amount = 10;
    } else if (current >= 20 && current < 50) {
      amount = 5;
    } else if (current >= 50 && current < 80) {
      amount = 2;
    } else if (current >= 80 && current < 95) {
      amount = 0.5;
    }

    // Thêm yếu tố ngẫu nhiên để trông tự nhiên hơn
    return amount + (Math.random() * amount * 0.5);
  }
}

// Xuất ra một instance duy nhất (Singleton Pattern) để điều khiển toàn cục
export const TopProgressBar = new ProgressBar();
