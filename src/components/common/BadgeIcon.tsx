import { useRef, useEffect, useCallback } from 'react';
import { StageType } from '../../types/game';
import './BadgeIcon.css';

interface BadgeIconProps {
    type: StageType | 'quiz';
    size?: number;
}

export function BadgeIcon({ type, size = 40 }: BadgeIconProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawBadge = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 3;

        // バッジ背景（金色のメダル）
        const gradient = ctx.createRadialGradient(
            centerX - 5, centerY - 5, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFC107');
        gradient.addColorStop(1, '#FF9800');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 枠線
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ステージに応じたアイコンを描画
        ctx.fillStyle = '#5D4037';
        ctx.font = `bold ${size * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        switch (type) {
            case 'kabuwake':
                // 株分け - 苗のアイコン
                drawSeedling(ctx, centerX, centerY, size * 0.3);
                break;
            case 'sakigari':
                // 先刈り - ハサミ
                drawScissors(ctx, centerX, centerY, size * 0.25);
                break;
            case 'shukaku':
                // 収穫 - 稲穂
                drawWheat(ctx, centerX, centerY, size * 0.3);
                break;
            case 'seishoku':
                // 製織 - 織り目
                drawWeave(ctx, centerX, centerY, size * 0.25);
                break;
            case 'quiz':
                // クイズ - 星
                drawStar(ctx, centerX, centerY, size * 0.28);
                break;
            default:
                // デフォルト - 王冠
                drawCrown(ctx, centerX, centerY, size * 0.25);
        }
    }, [type, size]);

    useEffect(() => {
        drawBadge();
    }, [drawBadge]);

    return <canvas ref={canvasRef} className="badge-icon-canvas" />;
}

// 苗アイコン
function drawSeedling(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // 茎
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.quadraticCurveTo(x - 3, y, x + 5, y - size);
    ctx.stroke();

    // 葉
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.7, y, x - size * 0.3, y - size * 0.3);
    ctx.stroke();
}

// ハサミアイコン
function drawScissors(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // 左刃
    ctx.beginPath();
    ctx.moveTo(x - size, y - size * 0.8);
    ctx.lineTo(x, y);
    ctx.stroke();

    // 右刃
    ctx.beginPath();
    ctx.moveTo(x + size, y - size * 0.8);
    ctx.lineTo(x, y);
    ctx.stroke();

    // 持ち手
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y + size * 0.5, size * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.5, size * 0.35, 0, Math.PI * 2);
    ctx.stroke();
}

// 稲穂アイコン
function drawWheat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.strokeStyle = '#8D6E63';
    ctx.fillStyle = '#A1887F';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // 茎
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y - size * 0.5);
    ctx.stroke();

    // 穂
    for (let i = 0; i < 5; i++) {
        const py = y - size * 0.5 + i * size * 0.25;
        ctx.beginPath();
        ctx.ellipse(x, py, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 織り目アイコン
function drawWeave(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;

    // 縦糸
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * size * 0.4, y - size);
        ctx.lineTo(x + i * size * 0.4, y + size);
        ctx.stroke();
    }

    // 横糸
    ctx.strokeStyle = '#4CAF50';
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size, y + i * size * 0.4);
        ctx.lineTo(x + size, y + i * size * 0.4);
        ctx.stroke();
    }
}

// 星アイコン
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;

        if (i === 0) {
            ctx.moveTo(x + size * Math.cos(outerAngle), y + size * Math.sin(outerAngle));
        } else {
            ctx.lineTo(x + size * Math.cos(outerAngle), y + size * Math.sin(outerAngle));
        }
        ctx.lineTo(x + size * 0.4 * Math.cos(innerAngle), y + size * 0.4 * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
}

// 王冠アイコン
function drawCrown(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.5);
    ctx.lineTo(x - size, y - size * 0.3);
    ctx.lineTo(x - size * 0.5, y);
    ctx.lineTo(x, y - size * 0.8);
    ctx.lineTo(x + size * 0.5, y);
    ctx.lineTo(x + size, y - size * 0.3);
    ctx.lineTo(x + size, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
}
