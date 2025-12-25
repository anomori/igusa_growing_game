import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

export function Stage3Sakigari({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [currentHeight, setCurrentHeight] = useState(45);
    const [igusaHeight] = useState(() => 50 + Math.floor(Math.random() * 21)); // 50-70cm
    const [cutCount, setCutCount] = useState(0);
    const [perfectCount, setPerfectCount] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [lastResult, setLastResult] = useState<string | null>(null);

    const targetCount = 20;
    const targetHeight = 45;

    const handleCut = () => {
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
                setCurrentHeight(45);
                setLastResult(null);
            }, 1000);
        }
    };

    const isComplete = cutCount >= targetCount;

    return (
        <div className="stage-game stage-sakigari">
            <div className="game-instruction">
                <p>✂️ い草を45cmの高さで刈り揃えよう！</p>
                <p className="hint">▲▼ボタンで刈り高さを調整</p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={3} />
            </div>

            {!isComplete ? (
                <>
                    <div className="sakigari-field">
                        <div className="height-ruler">
                            <span className="ruler-mark" style={{ bottom: '100%' }}>70cm</span>
                            <span className="ruler-mark" style={{ bottom: '75%' }}>60cm</span>
                            <span className="ruler-mark target" style={{ bottom: '50%' }}>45cm ← 目標</span>
                            <span className="ruler-mark" style={{ bottom: '25%' }}>30cm</span>
                            <span className="ruler-mark" style={{ bottom: '0' }}>地面</span>
                        </div>

                        <div className="igusa-display">
                            <div
                                className="igusa-plant"
                                style={{ height: `${(igusaHeight / 70) * 100}%` }}
                            >
                                🌿
                            </div>
                            <div
                                className="cut-line-indicator"
                                style={{ bottom: `${(currentHeight / 70) * 100}%` }}
                            >
                                ✂️ ─────
                            </div>
                        </div>
                    </div>

                    <div className="height-display">
                        <p>刈り高さ: <strong>{currentHeight}cm</strong></p>
                        {lastResult && (
                            <p className={`result-text ${lastResult.includes('Perfect') ? 'text-success' : lastResult.includes('Good') ? 'text-warning' : 'text-danger'}`}>
                                {lastResult}
                            </p>
                        )}
                    </div>

                    <div className="height-controls">
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentHeight(h => Math.max(30, h - 1))}
                        >
                            ▼ 下げる
                        </Button>
                        <span className="height-value">{currentHeight}cm</span>
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentHeight(h => Math.min(60, h + 1))}
                        >
                            ▲ 上げる
                        </Button>
                    </div>

                    <Button variant="primary" fullWidth onClick={handleCut}>
                        ✂️ カット！
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
                    <Button variant="success" fullWidth onClick={() => onComplete(totalScore)}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}
        </div>
    );
}
