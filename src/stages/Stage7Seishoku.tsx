import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

type Phase = 'selection' | 'weaving';
type Direction = 'left' | 'right';

interface IgusaItem {
    id: number;
    quality: 'good' | 'tip' | 'uneven' | 'damaged';
}

export function Stage7Seishoku({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    const [phase, setPhase] = useState<Phase>('selection');
    const [igusaItems, setIgusaItems] = useState<IgusaItem[]>([]);
    const [weavingCount, setWeavingCount] = useState(0);
    const [density, setDensity] = useState(50);
    const [currentDirection, setCurrentDirection] = useState<Direction>('left');
    const [timeLeft, setTimeLeft] = useState(1.5);
    const [totalScore, setTotalScore] = useState(0);
    const [selectionScore, setSelectionScore] = useState(0);
    const [selectionCount, setSelectionCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const targetWeaveCount = 50;
    const targetSelectionCount = 10;

    // 選別用のい草を生成
    useEffect(() => {
        if (phase !== 'selection') return;
        generateNewItems();
    }, [phase]);

    const generateNewItems = () => {
        const qualities: IgusaItem['quality'][] = ['good', 'tip', 'uneven', 'damaged'];
        const items: IgusaItem[] = [
            { id: 1, quality: 'good' },
            { id: 2, quality: qualities[Math.floor(Math.random() * 4)] },
            { id: 3, quality: qualities[Math.floor(Math.random() * 4)] },
        ];
        // シャッフル
        items.sort(() => Math.random() - 0.5);
        setIgusaItems(items);
    };

    // 選別
    const handleSelect = (item: IgusaItem) => {
        if (item.quality === 'good') {
            dispatch({ type: 'ADD_QP', amount: 3 });
            setSelectionScore(prev => prev + 3);
        } else {
            dispatch({ type: 'ADD_QP', amount: -5 });
        }
        setSelectionCount(prev => prev + 1);

        if (selectionCount + 1 >= targetSelectionCount) {
            // 選別終了、自動的に織りフェーズへ
            setTotalScore(selectionScore);
            setPhase('weaving');
        } else {
            generateNewItems();
        }
    };

    // 選別完了（手動）
    const handleSelectionComplete = () => {
        setTotalScore(selectionScore);
        setPhase('weaving');
    };

    // 織り込みタイマー
    useEffect(() => {
        if (phase !== 'weaving' || weavingCount >= targetWeaveCount || isProcessing) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    // タイムアウト - Miss処理
                    setIsProcessing(true);
                    dispatch({ type: 'ADD_QP', amount: -1 });
                    setDensity(d => Math.max(0, d - 1));
                    setWeavingCount(c => c + 1);
                    setCurrentDirection(d => d === 'left' ? 'right' : 'left');
                    setTimeout(() => setIsProcessing(false), 100);
                    return 1.5;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [phase, weavingCount, isProcessing, dispatch]);

    // スワイプ処理
    const handleSwipe = (direction: Direction) => {
        if (isProcessing || weavingCount >= targetWeaveCount) return;
        setIsProcessing(true);

        let qp = 0;
        let densityChange = 0;

        if (direction === currentDirection) {
            if (timeLeft > 1) {
                // Perfect
                qp = 2;
                densityChange = 2; // 増加量を減らす (3 -> 2)
            } else {
                // Good
                qp = 1;
                densityChange = 1; // 増加量を減らす (2 -> 1)
            }
        } else {
            // Miss
            qp = -1;
            densityChange = -2; // 減少量を増やす (-1 -> -2)
        }

        dispatch({ type: 'ADD_QP', amount: qp });
        setTotalScore(prev => prev + Math.max(0, qp));
        setDensity(prev => Math.min(150, Math.max(0, prev + densityChange)));
        setWeavingCount(prev => prev + 1);
        setCurrentDirection(prev => prev === 'left' ? 'right' : 'left');
        setTimeLeft(1.5);

        setTimeout(() => setIsProcessing(false), 100);
    };

    const getQualityLabel = (quality: IgusaItem['quality']) => {
        switch (quality) {
            case 'good': return '良品';
            case 'tip': return '穂先残り';
            case 'uneven': return '色ムラ';
            case 'damaged': return '傷あり';
        }
    };

    const getIgusaByCount = () => {
        // 密度(%)から本数を計算（最大約8000本）
        // density 50(初期) -> 6000本
        // desnity 100(MAX) -> 8000本
        // density 0 -> 4000本以下
        const base = 4000;
        const additional = Math.floor((density / 100) * 4000);
        const count = base + additional;
        return `${count.toLocaleString()}本`;
    };

    const isComplete = weavingCount >= targetWeaveCount;

    return (
        <div className="stage-game stage-seishoku">
            <div className="game-instruction">
                <p>{phase === 'selection' ? 'い草を選別しよう！' : '畳表を織ろう！'}</p>
                <p className="hint">
                    {phase === 'selection'
                        ? '良品質のい草を選んでタップ'
                        : currentDirection === 'left' ? '← 左にスワイプ！' : '右にスワイプ！ →'
                    }
                </p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints, 7)} size="small" stage={7} />
            </div>

            {phase === 'selection' ? (
                <div className="selection-phase">
                    <div className="igusa-selection">
                        {igusaItems.map(item => (
                            <button
                                key={item.id}
                                className={`igusa-item quality-${item.quality}`}
                                onClick={() => handleSelect(item)}
                            >
                                <div className={`quality-indicator ${item.quality}`} />
                                <span className="igusa-label">{getQualityLabel(item.quality)}</span>
                            </button>
                        ))}
                    </div>

                    <p className="selection-hint">
                        良品質（穂先と根元がカット済み、色が均一）を選ぼう！
                    </p>

                    <p>選別スコア: {selectionScore}</p>

                    <Button variant="success" fullWidth onClick={handleSelectionComplete}>
                        選別完了 → 織り込みへ
                    </Button>
                </div>
            ) : !isComplete ? (
                <div className="weaving-phase">
                    <div className="weaving-display">
                        <div className="loom">
                            <div className="warp-threads">═══════════════</div>
                            <div className={`weave-indicator ${currentDirection}`}>
                                {currentDirection === 'left' ? (
                                    <>← <div className="weave-indicator-icon" /></>
                                ) : (
                                    <><div className="weave-indicator-icon" /> →</>
                                )}
                            </div>
                            <div className="warp-threads">═══════════════</div>
                        </div>

                        <div className="direction-indicator">
                            <span className={currentDirection === 'left' ? 'active' : ''}>[ 左 ]</span>
                            <span className={currentDirection === 'right' ? 'active' : ''}>[ 右 ]</span>
                        </div>
                    </div>

                    <ProgressBar
                        value={timeLeft}
                        max={1.5}
                        label="残り時間"
                        color={timeLeft > 1 ? 'success' : timeLeft > 0.5 ? 'warning' : 'danger'}
                    />

                    <div className="weave-controls">
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => handleSwipe('left')}
                        >
                            ← 左
                        </Button>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => handleSwipe('right')}
                        >
                            右 →
                        </Button>
                    </div>

                    <ProgressBar
                        value={density}
                        max={100}
                        label="密度"
                        showValue
                        color={density >= 70 ? 'success' : density >= 50 ? 'warning' : 'danger'}
                    />

                    <div className="weave-info">
                        <p>織り込み: {weavingCount} / {targetWeaveCount}</p>
                        <p>い草本数: {getIgusaByCount()}</p>
                    </div>
                </div>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">製織完了！</p>
                    <p>密度: {density}%（{getIgusaByCount()}）</p>
                    <p>スコア: {totalScore} QP</p>
                    {density >= 90 && (
                        <p className="badge-earned">🏆 「織師の匠」バッジ獲得！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => onComplete(totalScore)}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}
        </div>
    );
}
