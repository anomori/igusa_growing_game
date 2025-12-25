import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

type Phase = 'selection' | 'weaving';
type Direction = 'left' | 'right';

interface IgusaItem {
    id: number;
    quality: 'good' | 'tip' | 'uneven' | 'damaged';
}

export function Stage7Seishoku({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [phase, setPhase] = useState<Phase>('selection');
    const [igusaItems, setIgusaItems] = useState<IgusaItem[]>([]);
    const [weavingCount, setWeavingCount] = useState(0);
    const [density, setDensity] = useState(50);
    const [currentDirection, setCurrentDirection] = useState<Direction>('left');
    const [timeLeft, setTimeLeft] = useState(1.5);
    const [totalScore, setTotalScore] = useState(0);
    const [selectionScore, setSelectionScore] = useState(0);

    const targetWeaveCount = 50;

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
        generateNewItems();
    };

    // 選別完了
    const handleSelectionComplete = () => {
        setTotalScore(selectionScore);
        setPhase('weaving');
    };

    // 織り込みタイマー
    useEffect(() => {
        if (phase !== 'weaving') return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    // タイムアウト - Miss
                    handleWeaveResult('miss');
                    return 1.5;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [phase, currentDirection]);

    // スワイプ結果
    const handleWeaveResult = (result: 'perfect' | 'good' | 'miss') => {
        let qp = 0;
        let densityChange = 0;

        switch (result) {
            case 'perfect':
                qp = 2;
                densityChange = 3;
                break;
            case 'good':
                qp = 1;
                densityChange = 2;
                break;
            case 'miss':
                qp = -1;
                densityChange = -1;
                break;
        }

        dispatch({ type: 'ADD_QP', amount: qp });
        setTotalScore(prev => prev + Math.max(0, qp));
        setDensity(prev => Math.min(100, Math.max(0, prev + densityChange)));
        setWeavingCount(prev => prev + 1);
        setCurrentDirection(prev => prev === 'left' ? 'right' : 'left');
        setTimeLeft(1.5);
    };

    // スワイプ処理
    const handleSwipe = (direction: Direction) => {
        if (direction === currentDirection) {
            if (timeLeft > 1) {
                handleWeaveResult('perfect');
            } else {
                handleWeaveResult('good');
            }
        } else {
            handleWeaveResult('miss');
        }
    };

    const getQualityLabel = (quality: IgusaItem['quality']) => {
        switch (quality) {
            case 'good': return '🌿 良品';
            case 'tip': return '🔺 穂先残り';
            case 'uneven': return '🟡 色ムラ';
            case 'damaged': return '❌ 傷あり';
        }
    };

    const getIgusaByCount = () => {
        if (density >= 90) return '約8000本';
        if (density >= 70) return '約6000本';
        if (density >= 50) return '約4000本';
        return '4000本未満';
    };

    const isComplete = weavingCount >= targetWeaveCount;

    return (
        <div className="stage-game stage-seishoku">
            <div className="game-instruction">
                <p>🧵 {phase === 'selection' ? 'い草を選別しよう！' : '畳表を織ろう！'}</p>
                <p className="hint">
                    {phase === 'selection'
                        ? '良品質のい草を選んでタップ'
                        : currentDirection === 'left' ? '← 左にスワイプ！' : '右にスワイプ！ →'
                    }
                </p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={7} />
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
                                <span className="igusa-visual">🌿</span>
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
                                {currentDirection === 'left' ? '← 🌿' : '🌿 →'}
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
                        label="⏱️"
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
                    <p className="complete-message">🎉 製織完了！</p>
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
