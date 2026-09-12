export interface HeaderTopAnimationOptions {
    onComplete?: () => void;
}

interface SandParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    color: string;
}

interface WindParticle {
    x: number;
    y: number;
    length: number;
    speed: number;
    alpha: number;
}

export class HeaderTopAnimation {
    private container: HTMLElement;
    private userName: string;
    private options: HeaderTopAnimationOptions;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private startTime: number = 0;
    private animationId: number = 0;

    private isSkipping: boolean = false;
    private skipStartTime: number = 0;
    private readonly SKIP_DURATION: number = 300; // 0.3s

    private width: number = 0;
    private height: number = 0;

    private sandParticles: SandParticle[] = [];
    private windParticles: WindParticle[] = [];

    private readonly TOTAL_DURATION = 9000;

    constructor(container: HTMLElement, userName: string, options?: HeaderTopAnimationOptions) {
        this.container = container;
        this.userName = userName;
        this.options = options || {};

        // 1. Cài đặt position: relative và overflow: hidden cho topBarElement
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';

        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.cursor = 'pointer';

        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.container.appendChild(this.canvas);

        this.resize = this.resize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.render = this.render.bind(this);

        window.addEventListener('resize', this.resize);
        this.container.addEventListener('click', this.handleClick);

        this.resize();
        this.start();
    }

    private resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    private start() {
        this.startTime = performance.now();
        this.animationId = requestAnimationFrame(this.render);
    }

    private handleClick() {
        if (this.isSkipping) return;
        this.isSkipping = true;
        this.skipStartTime = performance.now();
    }

    private cleanup() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.resize);
        this.container.removeEventListener('click', this.handleClick);

        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }

    private createSandParticle(x: number, y: number) {
        this.sandParticles.push({
            x: x,
            y: y,
            vx: Math.random() * 1.5 + 0.5,
            vy: Math.random() * -1.5 - 0.5,
            radius: Math.random() * 1 + 0.5, // Hạt cát kích thước ~1px
            alpha: 1,
            color: Math.random() > 0.5 ? '#8B5A2B' : '#A9A9A9'
        });
    }

    private createWindParticle(x: number, y: number) {
        this.windParticles.push({
            x: x,
            y: y + (Math.random() * 10 - 5),
            length: Math.random() * 20 + 10,
            speed: Math.random() * 3 + 2,
            alpha: Math.random() * 0.3 + 0.1
        });
    }

    private drawCar(x: number, y: number) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        // Thu nhỏ xe thể thao tối giản (rộng ~75px, cao ~22px)
        const scale = 0.5;
        ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 30, 80, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.moveTo(-70, 15);
        ctx.lineTo(-40, -5);
        ctx.lineTo(-10, -5);
        ctx.lineTo(0, -25);
        ctx.lineTo(40, -25);
        ctx.lineTo(60, -5);
        ctx.lineTo(75, 0);
        ctx.lineTo(75, 15);
        ctx.lineTo(-70, 15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#E53935'; 
        ctx.fillRect(60, -20, 10, 15);
        ctx.fillRect(55, -25, 25, 5);

        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.moveTo(-75, 15);
        ctx.lineTo(-65, 5);
        ctx.lineTo(-55, 15);
        ctx.fill();

        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(-40, 15, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(45, 15, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(-40, 15, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(45, 15, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    private render(timestamp: number) {
        const elapsed = timestamp - this.startTime;

        if (elapsed >= this.TOTAL_DURATION && !this.isSkipping) {
            this.cleanup();
            return;
        }

        let globalAlpha = 1;

        if (this.isSkipping) {
            const skipElapsed = timestamp - this.skipStartTime;
            globalAlpha = 1 - Math.min(skipElapsed / this.SKIP_DURATION, 1);
            if (skipElapsed >= this.SKIP_DURATION) {
                this.cleanup();
                return;
            }
        } else if (elapsed > 8000) {
            // 8s - 9s: Fade out
            globalAlpha = 1 - (elapsed - 8000) / 1000;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = globalAlpha;

        this.ctx.fillStyle = '#FFFFFF'; 
        this.ctx.fillRect(0, 0, this.width, this.height);

        let carX = -this.width * 0.2;
        let carY = this.height / 2;

        // 0-5s: Xe chạy từ phải sang trái
        const carProgress = Math.min(elapsed / 5000, 1);

        if (carProgress < 1) {
            const startX = this.width + 80;
            const endX = -80;
            carX = startX + (endX - startX) * carProgress;
        }

        const noseX = carX - 35;
        const noseY = carY + 7.5;

        // Radial Gradient tối nhẹ mũi xe
        const gradient = this.ctx.createRadialGradient(noseX, noseY, 0, noseX, noseY, 150);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (carProgress > 0 && carProgress < 1) {
            if (Math.random() > 0.4) {
                this.createSandParticle(carX - 20, carY + 15); 
                this.createSandParticle(carX + 22, carY + 16); 
            }
            if (Math.random() > 0.5) {
                this.createWindParticle(carX + 37, carY);
            }
        }

        this.ctx.lineWidth = 1;
        for (let i = this.windParticles.length - 1; i >= 0; i--) {
            const p = this.windParticles[i];
            p.x += p.speed;
            p.alpha -= 0.02;

            if (p.alpha <= 0) {
                this.windParticles.splice(i, 1);
                continue;
            }

            this.ctx.strokeStyle = `rgba(150, 150, 150, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.length, p.y);
            this.ctx.stroke();
        }

        for (let i = this.sandParticles.length - 1; i >= 0; i--) {
            const p = this.sandParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.05;

            if (p.alpha <= 0) {
                this.sandParticles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha * globalAlpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = globalAlpha;

        if (carProgress < 1) {
            this.drawCar(carX, carY);
        }

        let textOpacity = 0;
        const textFadeStart = 2500; // Khoảng khi xe đạt giữa màn hình (X=50%)
        const textFadeDuration = 500; 

        if (elapsed >= textFadeStart) {
            textOpacity = Math.min((elapsed - textFadeStart) / textFadeDuration, 1);
        }

        if (textOpacity > 0) {
            this.ctx.globalAlpha = textOpacity * globalAlpha;
            this.ctx.font = '700 16px "Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif';
            this.ctx.fillStyle = '#222222';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            this.ctx.fillText(`Chào Mừng ! ${this.userName}`, this.width / 2, this.height / 2);
        }

        this.animationId = requestAnimationFrame(this.render);
    }
}
