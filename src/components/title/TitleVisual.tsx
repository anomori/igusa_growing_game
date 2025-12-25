import { useEffect, useRef } from 'react';

export function TitleVisual() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 300;
        const height = 180;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);

        // 描画関数
        const drawTatami = () => {
            // 背景（ベースの緑）
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#A5D6A7'); // 明るい緑
            gradient.addColorStop(1, '#66BB6A'); // 少し濃い緑
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 畳の目（い草）を描画
            const weaveHeight = 4; // 1つの目の高さ
            const rows = height / weaveHeight;

            for (let i = 0; i < rows; i++) {
                const y = i * weaveHeight;

                // い草一本のグラデーション（円筒形っぽく）
                const rowGrad = ctx.createLinearGradient(0, y, 0, y + weaveHeight);
                rowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)'); // ハイライト
                rowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
                rowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.1)'); // シャドウ

                // ベースの色にランダムな変化を加える
                const hueVar = Math.random() * 4 - 2;
                ctx.fillStyle = `hsl(${100 + hueVar}, 40%, 60%)`;
                ctx.fillRect(0, y, width, weaveHeight);

                // 立体感オーバーレイ
                ctx.fillStyle = rowGrad;
                ctx.fillRect(0, y, width, weaveHeight);
            }

            // 縦糸のライン
            const colWidth = 30; // 縦糸の間隔
            const cols = width / colWidth;

            for (let i = 0; i < cols; i++) {
                const x = i * colWidth + (colWidth / 2);

                // 糸
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 織り目の凹凸表現
                const shadowGrad = ctx.createLinearGradient(x - 2, 0, x + 2, 0);
                shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
                shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
                shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = shadowGrad;
                ctx.fillRect(x - 2, 0, 4, height);
            }

            // 畳縁（右側だけ、とかではなく全体を一枚の畳として表現）
            // 縁（へり）をつける - 左右
            const borderSize = 20;
            const borderPattern = ctx.createLinearGradient(0, 0, borderSize, 0);
            borderPattern.addColorStop(0, '#3E2723');
            borderPattern.addColorStop(0.5, '#5D4037');
            borderPattern.addColorStop(1, '#3E2723');

            // 左縁
            ctx.fillStyle = borderPattern;
            ctx.fillRect(0, 0, borderSize, height);

            // 右縁
            const borderPatternRight = ctx.createLinearGradient(width - borderSize, 0, width, 0);
            borderPatternRight.addColorStop(0, '#3E2723');
            borderPatternRight.addColorStop(0.5, '#5D4037');
            borderPatternRight.addColorStop(1, '#3E2723');
            ctx.fillStyle = borderPatternRight;
            ctx.fillRect(width - borderSize, 0, borderSize, height);

            // 縁の模様（菱形など）
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            for (let y = 0; y < height; y += 20) {
                // 左
                ctx.beginPath();
                ctx.moveTo(10, y);
                ctx.lineTo(15, y + 10);
                ctx.lineTo(10, y + 20);
                ctx.lineTo(5, y + 10);
                ctx.fill();

                // 右
                ctx.beginPath();
                ctx.moveTo(width - 10, y);
                ctx.lineTo(width - 5, y + 10);
                ctx.lineTo(width - 10, y + 20);
                ctx.lineTo(width - 15, y + 10);
                ctx.fill();
            }
        };

        drawTatami();

    }, []);

    return (
        <div className="title-visual-container" style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
        }}>
            <canvas ref={canvasRef} style={{ borderRadius: '4px' }} />
        </div>
    );
}
