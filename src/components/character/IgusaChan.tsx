import { useRef, useEffect, useCallback } from 'react';
import { CharacterMood } from '../../types/game';
import './IgusaChan.css';

interface IgusaChanProps {
    mood: CharacterMood;
    size?: 'small' | 'medium' | 'large';
    stage?: number; // 1-8 for growth stages
    day?: number;   // 1-30 for continuous growth
}

export function IgusaChan({ mood, size = 'medium', stage = 1, day = 1 }: IgusaChanProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getExpression = () => {
        switch (mood) {
            case 'excellent': return { eyes: '✨', mouth: '◡', blush: true };
            case 'happy': return { eyes: '◠', mouth: '◡', blush: false };
            case 'normal': return { eyes: '•', mouth: '‿', blush: false }; // 無表情修正
            case 'sad': return { eyes: '•', mouth: '︵', blush: false };
        }
    };

    const getSizeScale = () => {
        switch (size) {
            case 'small': return 0.6;
            case 'medium': return 1.0;
            case 'large': return 1.6;
        }
    };

    const getStalkHeight = () => {
        // 日数に基づいて滑らかに成長させる
        // Day 1: 30px -> Day 30: 90px
        const minHeight = 30;
        const maxHeight = 90;
        const progress = Math.min(1, (day - 1) / 29); // 0 to 1
        return minHeight + progress * (maxHeight - minHeight);
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
        // 高さ計算の修正:
        // 顔パーツは scale が小さくても faceScale (min 1.0) で描画されるため、
        // scale が小さい時ほど相対的に広い余白が必要になる。
        // stalkHeight(30~90) + 上部余白(30) + 下部余白(30)
        const height = (stalkHeight + 60) * scale;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // クリア
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        // 地面の位置をCanvas最下部から少し上げる（口などがはみ出さないように）
        const baseY = height - 15 * scale;

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

            // アウトライン（通常は白、Excellent時は黄色）
            if (mood === 'excellent') {
                ctx.strokeStyle = 'rgba(255, 220, 0, 0.9)';
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; // 白で安定
            }
            ctx.lineWidth = 6 * scale;
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

            // 緑色の茎を重ねて描画
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

        // 顔パーツのスケール（全体が小さくても顔はあまり小さくしない）
        // scaleが0.6(small)でも顔は1.0くらいのサイズ感を維持
        const faceScale = Math.max(1.0, scale);
        const fontSize = 16 * faceScale;

        // 目（白枠付き）
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 白枠（strokeText）
        ctx.strokeStyle = 'white';
        // 枠線も太くしてくっきりさせる
        ctx.lineWidth = 4 * faceScale;
        ctx.lineJoin = 'round';
        ctx.strokeText(expression.eyes, centerX - 8 * faceScale, expressionY);
        ctx.strokeText(expression.eyes, centerX + 8 * faceScale, expressionY);

        // 目本体
        ctx.fillStyle = '#2E2E2E';
        ctx.fillText(expression.eyes, centerX - 8 * faceScale, expressionY);
        ctx.fillText(expression.eyes, centerX + 8 * faceScale, expressionY);

        // 口（白枠付き）
        const mouthY = expressionY + 10 * faceScale;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4 * faceScale;
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
    }, [mood, size, stage, day]);

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
