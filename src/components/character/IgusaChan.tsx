import { useRef, useEffect, useCallback } from 'react';
import { CharacterMood } from '../../types/game';
import './IgusaChan.css';

interface IgusaChanProps {
    mood: CharacterMood;
    size?: 'small' | 'medium' | 'large';
    stage?: number; // 1-8 for growth stages
}

export function IgusaChan({ mood, size = 'medium', stage = 1 }: IgusaChanProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getExpression = () => {
        switch (mood) {
            case 'excellent': return { eyes: '✨', mouth: '◡', blush: true };
            case 'happy': return { eyes: '◠', mouth: '◡', blush: false };
            case 'normal': return { eyes: '•', mouth: '―', blush: false };
            case 'sad': return { eyes: '•', mouth: '︵', blush: false };
        }
    };

    const getSizeScale = () => {
        switch (size) {
            case 'small': return 1.0;
            case 'medium': return 1.6;
            case 'large': return 2.4;
        }
    };

    const getStalkHeight = () => {
        if (stage <= 2) return 50;
        if (stage <= 5) return 70;
        return 90;
    };

    const drawBundle = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = getSizeScale();
        const stalkHeight = getStalkHeight();

        const dpr = window.devicePixelRatio || 1;
        const width = 80 * scale;
        const height = stalkHeight * scale;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // クリア
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const baseY = height; // 地面

        // い草の茎を描画（束として）
        const stalkCount = 9;
        for (let i = 0; i < stalkCount; i++) {
            const offsetX = (i - stalkCount / 2) * 5 * scale;
            const variance = 0.9 + Math.random() * 0.2;
            const h = stalkHeight * scale * variance;
            const rotation = (i - stalkCount / 2) * 2;

            // 茎の色（段階によって変化）
            let greenBase = 140;
            if (mood === 'excellent') greenBase = 180;
            if (mood === 'sad') greenBase = 100;

            const green = greenBase + Math.floor(Math.random() * 40);
            ctx.strokeStyle = `rgb(60, ${green}, 60)`;
            ctx.lineWidth = 4 * scale;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(centerX + offsetX, baseY);
            ctx.quadraticCurveTo(
                centerX + offsetX + rotation * 0.3,
                baseY - h / 2,
                centerX + offsetX + rotation * 0.5,
                baseY - h
            );
            ctx.stroke();
        }

        // 表情を茎の中央より少し上に描画（白枠付き）
        const expression = getExpression();
        const expressionY = baseY - stalkHeight * scale * 0.6; // 中央より少し上
        const fontSize = 16 * scale;

        // 目（白枠付き）
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 白枠（strokeText）
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3 * scale;
        ctx.lineJoin = 'round';
        ctx.strokeText(expression.eyes, centerX - 8 * scale, expressionY);
        ctx.strokeText(expression.eyes, centerX + 8 * scale, expressionY);

        // 目本体
        ctx.fillStyle = '#2E2E2E';
        ctx.fillText(expression.eyes, centerX - 8 * scale, expressionY);
        ctx.fillText(expression.eyes, centerX + 8 * scale, expressionY);

        // 口（白枠付き）
        const mouthY = expressionY + 10 * scale;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3 * scale;
        ctx.strokeText(expression.mouth, centerX, mouthY);

        ctx.fillStyle = '#2E2E2E';
        ctx.fillText(expression.mouth, centerX, mouthY);

        // 頬紅
        if (expression.blush) {
            ctx.fillStyle = 'rgba(244, 143, 177, 0.6)';
            ctx.beginPath();
            ctx.ellipse(centerX - 15 * scale, expressionY + 3 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 15 * scale, expressionY + 3 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [mood, size, stage]);

    useEffect(() => {
        drawBundle();
    }, [drawBundle]);

    return (
        <div className={`igusa-chan-v2 mood-${mood}`} style={{ position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />

            {/* 輝きエフェクト */}
            {mood === 'excellent' && (
                <div className="igusa-sparkles-v2">
                    <span className="sparkle">✦</span>
                    <span className="sparkle">✦</span>
                    <span className="sparkle">✦</span>
                </div>
            )}
        </div>
    );
}
