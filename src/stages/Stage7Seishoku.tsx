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
    const [density, setDensity] = useState(40); // 初期密度 40% (3200本)
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
                    setDensity(d => Math.max(0, d - 1.5));
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
                densityChange = 1.2; // 50回で+60 (初期40+60=100)
            } else {
                // Good
                qp = 1;
                densityChange = 0.6; // 50回で+30 (初期40+30=70)
            }
        } else {
            // Miss
            qp = -1;
            densityChange = -1.5; // 減少
        }

        dispatch({ type: 'ADD_QP', amount: qp });
        setTotalScore(prev => prev + Math.max(0, qp));
        // 密度上限なし、バランス調整で8000本前後を目指す
        setDensity(prev => Math.max(0, prev + densityChange));
        setWeavingCount(prev => prev + 1);
        setCurrentDirection(prev => prev === 'left' ? 'right' : 'left');
        setTimeLeft(1.5);

        setTimeout(() => setIsProcessing(false), 100);
    };

    const getQualityLabel = (quality: IgusaItem['quality']) => {
        switch (quality) {
            case 'good': return <><ruby>良<rt>りょう</rt></ruby><ruby>品質<rt>ひんしつ</rt></ruby></>;
            case 'tip': return <><ruby>穂先<rt>ほさき</rt></ruby><ruby>残<rt>のこ</rt></ruby>り</>;
            case 'uneven': return <><ruby>色<rt>いろ</rt></ruby>ムラ</>;
            case 'damaged': return <><ruby>傷<rt>きず</rt></ruby>あり</>;
        }
    };

    const getIgusaByCount = () => {
        // 密度(%)から本数を計算（最大8000本）
        // density 50(初期) -> 6000本
        // density 100(MAX) -> 8000本
        // density 0 -> 4000本
        const base = 4000;
        const additional = Math.floor((density / 100) * 4000);
        const count = base + additional;
        return <>{count.toLocaleString()}<ruby>本<rt>ほん</rt></ruby></>;
    };

    const isComplete = weavingCount >= targetWeaveCount;

    return (
        <div className="stage-game stage-seishoku">
            <div className="game-instruction">
                <p>{phase === 'selection' ? <><ruby>い草<rt>いぐさ</rt></ruby>を<ruby>選別<rt>せんべつ</rt></ruby>しよう！</> : <><ruby>畳表<rt>たたみおもて</rt></ruby>を<ruby>織<rt>お</rt></ruby>ろう！</>}</p>
                {phase === 'selection' && (
                    <p className="hint"><ruby>良<rt>りょう</rt></ruby><ruby>品質<rt>ひんしつ</rt></ruby>の<ruby>い草<rt>いぐさ</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んでタップ</p>
                )}
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
                        <ruby>良<rt>りょう</rt></ruby><ruby>品質<rt>ひんしつ</rt></ruby>（<ruby>穂先<rt>ほさき</rt></ruby>と<ruby>根元<rt>ねもと</rt></ruby>がカット<ruby>済<rt>ず</rt></ruby>み、<ruby>色<rt>いろ</rt></ruby>が<ruby>均一<rt>きんいつ</rt></ruby>）を<ruby>選<rt>えら</rt></ruby>ぼう！
                    </p>

                    <p><ruby>選別<rt>せんべつ</rt></ruby>スコア: {selectionScore}</p>

                    <Button variant="success" fullWidth onClick={handleSelectionComplete}>
                        <span><ruby>選別<rt>せんべつ</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby> → <ruby>織<rt>お</rt></ruby>り<ruby>込<rt>こ</rt></ruby>みへ</span>
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
                            <span className={currentDirection === 'left' ? 'active' : ''}>[ <ruby>左<rt>ひだり</rt></ruby> ]</span>
                            <span className={currentDirection === 'right' ? 'active' : ''}>[ <ruby>右<rt>みぎ</rt></ruby> ]</span>
                        </div>
                    </div>

                    <ProgressBar
                        value={timeLeft}
                        max={1.5}
                        label={<><ruby>残<rt>のこ</rt></ruby>り<ruby>時間<rt>じかん</rt></ruby></>}
                        color={timeLeft > 1 ? 'success' : timeLeft > 0.5 ? 'warning' : 'danger'}
                    />

                    <div className="weave-controls">
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => handleSwipe('left')}
                        >
                            <span>← <ruby>左<rt>ひだり</rt></ruby></span>
                        </Button>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => handleSwipe('right')}
                        >
                            <span><ruby>右<rt>みぎ</rt></ruby> →</span>
                        </Button>
                    </div>

                    <ProgressBar
                        value={Math.round(density * 10) / 10}
                        max={100}
                        label={<><ruby>密度<rt>みつど</rt></ruby></>}
                        showValue
                        color={density >= 70 ? 'success' : density >= 50 ? 'warning' : 'danger'}
                    />

                    <div className="weave-info">
                        <p><ruby>織<rt>お</rt></ruby>り<ruby>込<rt>こ</rt></ruby>み: {weavingCount} / {targetWeaveCount}</p>
                        <p><ruby>い草<rt>いぐさ</rt></ruby><ruby>本数<rt>ほんすう</rt></ruby>: {getIgusaByCount()}</p>
                    </div>
                </div>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message"><ruby>製織<rt>せいしょく</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby>！</p>
                    <p><ruby>密度<rt>みつど</rt></ruby>: {density.toFixed(1)}%（{getIgusaByCount()}）</p>
                    <p>スコア: {totalScore} QP</p>
                    {density >= 90 && (
                        <p className="badge-earned">🏆 「<ruby>織師<rt>おりし</rt></ruby>の<ruby>匠<rt>たくみ</rt></ruby>」バッジ<ruby>獲得<rt>かくとく</rt></ruby>！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => {
                        if (density >= 90) {
                            dispatch({
                                type: 'EARN_BADGE',
                                badge: { id: 'seishoku', name: '織師の匠', icon: '🧵', description: '密度90%以上で製織' }
                            });
                        }
                        onComplete(totalScore);
                    }}>
                        ☀️ <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
