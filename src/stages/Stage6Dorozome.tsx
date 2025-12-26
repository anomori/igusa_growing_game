import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

// い草束の状態
type BundleState = 'waiting' | 'dipping' | 'lifting' | 'completed';
type ResultType = 'perfect' | 'good' | 'bad' | null;

export function Stage6Dorozome({ onComplete }: StageProps) {
    const { dispatch } = useGame();

    // ゲーム状態
    const [bundleIndex, setBundleIndex] = useState(0); // 0-9
    const [bundleState, setBundleState] = useState<BundleState>('waiting');
    const [results, setResults] = useState<ResultType[]>([]);

    // Canvas用アニメーション状態
    const [bundleY, setBundleY] = useState(0); // 0(上) - 100(下)
    const [mudColorRatio, setMudColorRatio] = useState(0); // 0(緑) - 1(泥色)
    const [isPressing, setIsPressing] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dipStartTimeRef = useRef<number | null>(null);
    const totalBundles = 10;
    const waterLevelY = 200; // 水面のY座標 (Canvas座標系)

    // ループアニメーション
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let waveOffset = 0;

        const render = () => {
            // Canvasサイズ設定
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;

            // 背景クリア
            ctx.clearRect(0, 0, width, height);

            // 1. 泥水プール描画
            ctx.fillStyle = '#795548'; // 泥色
            ctx.beginPath();

            // 水面の波
            ctx.moveTo(0, waterLevelY);
            for (let x = 0; x <= width; x += 10) {
                const y = waterLevelY + Math.sin(x * 0.02 + waveOffset) * 5;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();

            // 2. い草束描画
            const startX = width / 2;
            const startY = 40 + bundleY; // 基準位置

            // 色の計算 (緑 -> 泥色)
            // 緑: rgb(100, 180, 100)
            // 泥色: rgb(120, 100, 80)
            const r = 100 + (120 - 100) * mudColorRatio;
            const g = 180 + (100 - 180) * mudColorRatio;
            const b = 100 + (80 - 100) * mudColorRatio;
            const color = `rgb(${r}, ${g}, ${b})`;

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            // 束を描画
            const bundleWidth = 40;
            const bundleLength = 100;

            for (let i = -5; i <= 5; i++) {
                const offsetX = i * 4;
                const curve = Math.sin(now * 0.005 + i) * 2; // 微妙な揺れ

                ctx.beginPath();
                ctx.moveTo(startX + offsetX, startY - 20); // 持ち手
                ctx.quadraticCurveTo(
                    startX + offsetX + curve,
                    startY + bundleLength / 2,
                    startX + offsetX + curve * 2,
                    startY + bundleLength
                );
                ctx.stroke();
            }

            // 束ねている紐
            ctx.fillStyle = '#D7CCC8';
            ctx.fillRect(startX - 22, startY - 15, 44, 10);

            // 3. 水しぶき/波紋 (浸かっている時)
            if (startY + bundleLength > waterLevelY) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(startX, waterLevelY, 30 + Math.sin(now * 0.1) * 5, 5 + Math.sin(now * 0.1) * 2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            waveOffset += 0.1;
            animationId = requestAnimationFrame(render);
        };

        const now = Date.now();
        render();

        return () => cancelAnimationFrame(animationId);
    }, [bundleY, mudColorRatio]); // 依存配列に座標などを入れると再生成されるが、useRefで管理したほうが良いかも。今回はstateで再描画トリガー

    // 物理演算っぽい動き (アニメーションループとは別に更新)
    useEffect(() => {
        let interval: number;

        if (bundleState === 'dipping') {
            // 下降 (素早く)
            interval = window.setInterval(() => {
                setBundleY(prev => Math.min(200, prev + 15));
            }, 16);
        } else if (bundleState === 'lifting') {
            // 上昇 (素早く)
            interval = window.setInterval(() => {
                setBundleY(prev => Math.max(0, prev - 15));
            }, 16);

            // 上がりきったら完了判定
            if (bundleY <= 5) {
                setBundleState('completed');
                handleNextBundle();
            }
        } else if (bundleState === 'waiting') {
            // 初期位置
            setBundleY(0);
            setMudColorRatio(0);
        }

        return () => clearInterval(interval);
    }, [bundleState, bundleY]);

    // 泥付き具合の変化
    useEffect(() => {
        if (bundleState === 'dipping' && bundleY > 100) {
            // 浸かっていると徐々に色がつく
            setMudColorRatio(prev => Math.min(1, prev + 0.05));
        }
    }, [bundleState, bundleY]);

    // 操作ハンドラ
    const handlePressStart = () => {
        if (bundleState !== 'waiting' || bundleIndex >= totalBundles) return;
        setBundleState('dipping');
        setFeedback(null); // 次のアクションで消す
        dipStartTimeRef.current = Date.now();
        setIsPressing(true);
    };

    const handlePressEnd = () => {
        if (bundleState !== 'dipping') return;
        setIsPressing(false);
        setBundleState('lifting');

        const dipTime = Date.now() - (dipStartTimeRef.current || 0);
        evaluateDip(dipTime);
    };

    // 評価ロジック
    const evaluateDip = (timeMs: number) => {
        // 理想: 1000ms - 2000ms
        let result: ResultType = 'bad';
        let score = 0;
        let text = '';
        let color = '';

        if (timeMs >= 800 && timeMs <= 1800) {
            result = 'perfect';
            score = 3;
            text = 'Perfect!!';
            color = '#5D4037'; // 濃い茶色
        } else if (timeMs >= 400 && timeMs <= 2500) {
            result = 'good';
            score = 1;
            text = 'Good!';
            color = '#8D6E63'; // 茶色
        } else {
            result = 'bad';
            score = -1;
            text = 'Bad...';
            color = '#BCAAA4'; // 薄い茶色
        }

        // QP反映
        dispatch({ type: 'ADD_QP', amount: score });

        // 結果保存
        const newResults = [...results, result];
        setResults(newResults);

        // フィードバック表示（setTimeout削除して維持）
        setFeedback({ text, color });
    };

    // 次の束へ移行
    const handleNextBundle = () => {
        setTimeout(() => {
            if (bundleIndex + 1 >= totalBundles) {
                // 全完了
                handleAllComplete();
            } else {
                setBundleIndex(prev => prev + 1);
                setBundleState('waiting');
            }
        }, 800);
    };

    const handleAllComplete = () => {
        // 全部の処理が終わった
        // スコア集計などはリアルタイムでやっているので、終了通知のみ
        setTimeout(() => {
            onComplete(results.filter(r => r === 'perfect').length * 3 + results.filter(r => r === 'good').length);
        }, 1500); // 完了時は余韻を持たせる
    };

    return (
        <div className="stage-game stage-dorozome">
            <div className="game-instruction">
                <p>🎨 泥染め: ボタン長押しで泥に漬けよう！</p>
                <p className="hint">10束すべてを適切な時間（約1秒）漬けて引き上げよう</p>
            </div>

            <div className="status-panel">
                <span>残り: {totalBundles - bundleIndex}束</span>
                <span>スコア: {results.filter(r => r === 'perfect').length * 3 + results.filter(r => r === 'good').length}</span>
            </div>

            <div className="canvas-container">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

                {feedback && (
                    <div
                        className="dip-feedback show"
                        style={{ color: feedback.color, fontWeight: 'bold', fontSize: '24px', textShadow: '2px 2px 0px #fff' }}
                    >
                        {feedback.text}
                    </div>
                )}
            </div>

            <div className="controls">
                <button
                    className="dip-button"
                    onPointerDown={handlePressStart}
                    onPointerUp={handlePressEnd}
                    onPointerLeave={handlePressEnd} // マウスが外れた時も離したとみなす
                    onContextMenu={(e) => e.preventDefault()} // 右クリック無効
                    style={{ transform: isPressing ? 'scale(0.95)' : 'scale(1)' }}
                >
                    👇
                    <span>漬ける</span>
                </button>
            </div>

            <div className="results-preview" style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
                {Array.from({ length: totalBundles }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: i < results.length
                                ? (results[i] === 'perfect' ? '#5D4037' : results[i] === 'good' ? '#8D6E63' : '#D7CCC8')
                                : '#ccc',
                            border: i < results.length ? '1px solid rgba(0,0,0,0.1)' : 'none'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
