import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

export function Stage3Sakigari({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    const [currentHeight, setCurrentHeight] = useState(45);
    const [igusaHeight, setIgusaHeight] = useState(() => 50 + Math.floor(Math.random() * 21)); // 50-70cm
    const [cutCount, setCutCount] = useState(0);
    const [perfectCount, setPerfectCount] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [canCut, setCanCut] = useState(true);
    const igusaCanvasRef = useRef<HTMLCanvasElement>(null);

    const targetCount = 20;
    const targetHeight = 45;

    // 茎のランダム値を事前計算（igusaHeightが変わった時だけ再計算）
    const stalkData = useMemo(() => {
        const stalkCount = 15;
        return Array.from({ length: stalkCount }, (_, i) => ({
            offsetX: (i - stalkCount / 2) * 4,
            rotation: (i - stalkCount / 2) * 2.5,
            heightVariance: 0.85 + Math.random() * 0.3,
            greenBase: 120 + Math.floor(Math.random() * 80),
            redOffset: 50 + Math.random() * 30,
            blueOffset: 50 + Math.random() * 30,
            lineWidth: 2 + Math.random(),
        }));
    }, [igusaHeight]);

    // Canvas描画関数
    const drawCanvas = useCallback(() => {
        const canvas = igusaCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 解像度調整
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // 背景
        ctx.fillStyle = '#E8F5E9';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // い草の束を描画
        const bundleCenterX = rect.width * 0.5;
        const groundY = rect.height; // 地面は画面下端
        const plantHeightPx = (igusaHeight / 70) * rect.height; // い草の高さ（ピクセル）

        stalkData.forEach(stalk => {
            const h = plantHeightPx * stalk.heightVariance;

            // 色のばらつき（自然な緑のグラデーション）
            ctx.strokeStyle = `rgb(${stalk.redOffset}, ${stalk.greenBase}, ${stalk.blueOffset})`;
            ctx.lineWidth = stalk.lineWidth;

            // 茎を曲線で描画
            ctx.beginPath();
            const startX = bundleCenterX + stalk.offsetX;
            ctx.moveTo(startX, groundY);
            const curveX = startX + stalk.rotation * 1.5;
            const topY = groundY - h;
            ctx.quadraticCurveTo(
                startX + stalk.rotation * 0.3,
                groundY - h / 2,
                curveX,
                topY
            );
            ctx.stroke();
        });

        // カットライン描画
        const cutLineY = groundY - (currentHeight / 70) * rect.height;
        ctx.beginPath();
        ctx.strokeStyle = '#E53935';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.moveTo(0, cutLineY);
        ctx.lineTo(rect.width, cutLineY);
        ctx.stroke();
        ctx.setLineDash([]);

        // ハサミアイコン（簡易）
        ctx.fillStyle = '#E53935';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('✂', rect.width - 30, cutLineY - 5);

    }, [igusaHeight, currentHeight, stalkData]);

    // Canvas描画のトリガー
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const handleCut = () => {
        if (!canCut) return;
        setCanCut(false);

        const difference = Math.abs(currentHeight - targetHeight);
        let result: string;
        let qpChange: number;

        if (difference <= 1) {
            result = 'Perfect! ✨';
            qpChange = 15;
            setPerfectCount(p => p + 1);
        } else if (difference <= 3) {
            result = 'Good! 👍';
            qpChange = 8;
        } else if (currentHeight < targetHeight - 3) {
            result = '短すぎ... 💦';
            qpChange = -20;
        } else {
            result = '長すぎ... 💦';
            qpChange = -20;
        }

        setLastResult(result);
        setTotalScore(prev => prev + Math.max(0, qpChange));
        dispatch({ type: 'ADD_QP', amount: qpChange });
        setCutCount(c => c + 1);

        // 次のい草を生成
        if (cutCount + 1 < targetCount) {
            setTimeout(() => {
                // ランダムな高さの新しいい草
                setIgusaHeight(50 + Math.floor(Math.random() * 21));
                // 刈り高さを中間値にリセット
                setCurrentHeight(40 + Math.floor(Math.random() * 11)); // 40-50
                setLastResult(null);
                setCanCut(true);
            }, 800);
        }
    };

    const isComplete = cutCount >= targetCount;

    return (
        <div className="stage-game stage-sakigari">
            <div className="game-instruction">
                <p>い草を45cmの高さで刈り揃えよう！</p>
                <p className="hint">▲▼ボタンで刈り高さを調整</p>
            </div>

            {!isComplete ? (
                <>
                    <div className="sakigari-field">


                        <div className="igusa-display">
                            <canvas ref={igusaCanvasRef} style={{ width: '100%', height: '100%' }} />
                        </div>
                    </div>

                    <div className="height-display">
                        <p>刈り高さ: <strong>{currentHeight}cm</strong></p>
                    </div>

                    {/* 結果をCanvas上に大きく表示 */}
                    {lastResult && (
                        <div className="result-overlay">
                            <span className={`result-text-large ${lastResult.includes('Perfect') ? 'text-success' : lastResult.includes('Good') ? 'text-warning' : 'text-danger'}`}>
                                {lastResult}
                            </span>
                        </div>
                    )}

                    <div className="height-controls">
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentHeight(h => Math.max(30, h - 1))}
                        >
                            ▼ 下げる
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentHeight(h => Math.min(60, h + 1))}
                        >
                            ▲ 上げる
                        </Button>
                    </div>

                    <Button variant="primary" fullWidth onClick={handleCut}>
                        カット！
                    </Button>

                    <div className="game-progress">
                        <p>カット回数: {cutCount} / {targetCount}</p>
                        <p>Perfect: {perfectCount}回</p>
                    </div>
                </>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 先刈り完了！</p>
                    <p>Total Score: {totalScore} QP</p>
                    <p>Perfect率: {Math.round((perfectCount / targetCount) * 100)}%</p>
                    {perfectCount >= targetCount / 2 && (
                        <p className="badge-earned">🏆 「先刈り名人」バッジ獲得！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => {
                        if (perfectCount >= targetCount / 2) {
                            dispatch({
                                type: 'EARN_BADGE',
                                badge: { id: 'sakigari', name: '先刈り名人', icon: '✂️', description: '先刈りで50%以上パーフェクト' }
                            });
                        }
                        onComplete(totalScore);
                    }}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}
        </div>
    );
}
