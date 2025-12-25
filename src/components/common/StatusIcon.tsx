import { useEffect, useRef } from 'react';
import { StageType } from '../../types/game';

interface StatusIconProps {
    type: StageType;
    size?: number;
    active?: boolean;
}

export function StatusIcon({ type, size = 32, active = false }: StatusIconProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
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

        // クリア
        ctx.clearRect(0, 0, size, size);

        // 共通の描画設定
        const centerX = size / 2;
        const centerY = size / 2;

        // アイコンごとの描画ロジック
        switch (type) {
            case 'kabuwake': // 株分け: 分けられた苗
                drawKabuwake(ctx, size);
                break;
            case 'uetsuke': // 植え付け: 水田に並ぶ苗
                drawUetsuke(ctx, size);
                break;
            case 'sakigari': // 先刈り: 先端が切られたい草
                drawSakigari(ctx, size);
                break;
            case 'seicho': // 成長: 網と伸びたい草
                drawSeicho(ctx, size);
                break;
            case 'shukaku': // 収穫: 束ねられたい草
                drawShukaku(ctx, size);
                break;
            case 'dorozome': // 泥染め: 泥水に浸かるい草
                drawDorozome(ctx, size);
                break;
            case 'seishoku': // 製織: 織機と畳表
                drawSeishoku(ctx, size);
                break;
            case 'kensa': // 検査: 完成した畳
                drawKensa(ctx, size);
                break;
        }

    }, [type, size, active]);

    // 1. 株分け: 苗の束が分かれている様子
    const drawKabuwake = (ctx: CanvasRenderingContext2D, s: number) => {
        const grassColor = '#8BC34A';
        const rootColor = '#795548';

        // 左の株
        drawBunch(ctx, s * 0.35, s * 0.8, s * 0.4, grassColor, -0.2);
        // 右の株
        drawBunch(ctx, s * 0.65, s * 0.8, s * 0.4, grassColor, 0.2);

        // 根っこ
        ctx.fillStyle = rootColor;
        ctx.beginPath();
        ctx.arc(s * 0.35, s * 0.8, s * 0.08, 0, Math.PI * 2);
        ctx.arc(s * 0.65, s * 0.8, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
    };

    // 2. 植え付け: 水面と整列した苗
    const drawUetsuke = (ctx: CanvasRenderingContext2D, s: number) => {
        // 水面
        ctx.fillStyle = '#E3F2FD';
        ctx.fillRect(0, s * 0.6, s, s * 0.4);
        ctx.fillStyle = '#90CAF9';
        ctx.fillRect(0, s * 0.65, s, s * 0.05);

        // 苗
        const points = [0.3, 0.5, 0.7];
        points.forEach(p => {
            drawBunch(ctx, s * p, s * 0.7, s * 0.3, '#66BB6A', 0);
        });
    };

    // 3. 先刈り: 先端が平らに切られている
    const drawSakigari = (ctx: CanvasRenderingContext2D, s: number) => {
        // い草束
        drawBunch(ctx, s * 0.5, s * 0.9, s * 0.7, '#66BB6A', 0);

        // カットライン
        ctx.strokeStyle = '#F44336';
        ctx.setLineDash([2, 1]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s * 0.2, s * 0.3);
        ctx.lineTo(s * 0.8, s * 0.3);
        ctx.stroke();
        ctx.setLineDash([]);

        // ハサミ（簡略化）
        ctx.save();
        ctx.translate(s * 0.8, s * 0.3);
        ctx.fillStyle = '#78909C';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    // 4. 成長: 網がかかっている
    const drawSeicho = (ctx: CanvasRenderingContext2D, s: number) => {
        // 背の高いい草
        drawBunch(ctx, s * 0.5, s * 0.9, s * 0.8, '#4CAF50', 0);

        // 網
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;

        // 横線
        ctx.beginPath();
        ctx.moveTo(s * 0.1, s * 0.4);
        ctx.lineTo(s * 0.9, s * 0.4);
        ctx.stroke();

        // 網目
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const x = s * (0.1 + i * 0.16);
            ctx.beginPath();
            ctx.moveTo(x, s * 0.35);
            ctx.lineTo(x, s * 0.45);
            ctx.stroke();
        }
    };

    // 5. 収穫: 束ねられている
    const drawShukaku = (ctx: CanvasRenderingContext2D, s: number) => {
        // 大きな束
        drawBunch(ctx, s * 0.5, s * 0.9, s * 0.8, '#43A047', 0);

        // 結束バンド
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(s * 0.35, s * 0.7, s * 0.3, s * 0.08);

        // 鎌
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s * 0.7, s * 0.8, s * 0.15, Math.PI, Math.PI * 1.5);
        ctx.stroke();
    };

    // 6. 泥染め: 茶色っぽい液
    const drawDorozome = (ctx: CanvasRenderingContext2D, s: number) => {
        // 泥水槽
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.moveTo(s * 0.1, s * 0.5);
        ctx.lineTo(s * 0.1, s * 0.9);
        ctx.lineTo(s * 0.9, s * 0.9);
        ctx.lineTo(s * 0.9, s * 0.5);
        ctx.fill();

        // 浸かっているい草（少し茶色がかっている）
        drawBunch(ctx, s * 0.5, s * 0.7, s * 0.6, '#AED581', 0.1);
    };

    // 7. 製織: 縦糸と横糸
    const drawSeishoku = (ctx: CanvasRenderingContext2D, s: number) => {
        // 織機フレーム
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(s * 0.1, s * 0.1, s * 0.1, s * 0.8);
        ctx.fillRect(s * 0.8, s * 0.1, s * 0.1, s * 0.8);

        // 織りかけの畳
        ctx.fillStyle = '#AED581';
        ctx.fillRect(s * 0.2, s * 0.4, s * 0.6, s * 0.4);

        // 縦糸
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const x = s * (0.3 + i * 0.13);
            ctx.beginPath();
            ctx.moveTo(x, s * 0.1);
            ctx.lineTo(x, s * 0.9);
            ctx.stroke();
        }
    };

    // 8. 検査: 畳そのもの
    const drawKensa = (ctx: CanvasRenderingContext2D, s: number) => {
        // 畳本体
        ctx.fillStyle = '#AED581';
        ctx.fillRect(s * 0.1, s * 0.2, s * 0.8, s * 0.6);

        // 縁
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(s * 0.05, s * 0.2, s * 0.05, s * 0.6);
        ctx.fillRect(s * 0.9, s * 0.2, s * 0.05, s * 0.6);

        // 虫眼鏡
        ctx.strokeStyle = '#546E7A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s * 0.6, s * 0.4, s * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.7, s * 0.5);
        ctx.lineTo(s * 0.85, s * 0.65);
        ctx.stroke();
    };

    // ヘルパー：い草の束を描画
    const drawBunch = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        h: number,
        color: string,
        angle: number
    ) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;

        // 中央
        ctx.fillRect(-1, -h, 2, h);
        // 左
        ctx.save();
        ctx.rotate(-0.1);
        ctx.fillRect(-1, -h * 0.9, 2, h * 0.9);
        ctx.restore();
        // 右
        ctx.save();
        ctx.rotate(0.1);
        ctx.fillRect(-1, -h * 0.95, 2, h * 0.95);
        ctx.restore();

        ctx.restore();
    };

    return <canvas ref={canvasRef} />;
}
