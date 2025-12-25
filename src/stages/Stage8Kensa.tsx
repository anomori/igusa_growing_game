import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP, getFinalRank } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

interface Defect {
    id: number;
    x: number;
    y: number;
    found: boolean;
}

export function Stage8Kensa({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [defects] = useState<Defect[]>(() => {
        // ランダムに5-8個の欠陥を配置
        const count = 5 + Math.floor(Math.random() * 4);
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            found: false,
        }));
    });
    const [foundDefects, setFoundDefects] = useState<number[]>([]);
    const [wrongClicks, setWrongClicks] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // 欠陥をタップ
    const handleDefectClick = (defectId: number) => {
        if (foundDefects.includes(defectId)) return;

        setFoundDefects(prev => [...prev, defectId]);
        dispatch({ type: 'ADD_QP', amount: 2 });
    };

    // 間違いクリック
    const handleWrongClick = () => {
        setWrongClicks(prev => prev + 1);
        dispatch({ type: 'ADD_QP', amount: -1 });
    };

    // 検査完了
    const handleComplete = () => {
        const foundCount = foundDefects.length;
        let score = 0;

        if (foundCount >= 5) {
            score = 10;
        } else if (foundCount >= 3) {
            score = 5;
        } else if (foundCount >= 1) {
            score = 0;
        } else {
            score = -5;
        }

        dispatch({ type: 'ADD_QP', amount: score });
        setIsComplete(true);
    };

    const finalRank = getFinalRank(state.qualityPoints);

    const getRankMessage = () => {
        switch (finalRank) {
            case 'S': return '✨ 最高級！い草の長さ・色・光沢すべて完璧！';
            case 'A': return '⭐ 高品質！5年後も明るい飴色に変化します';
            case 'B': return '標準品質。若干の黒筋がありますが使用には問題なし';
            case 'C': return '色ムラあり。耐久性は低めです';
            case 'D': return '規格外...出荷不可です。もう一度挑戦しよう！';
        }
    };

    return (
        <div className="stage-game stage-kensa">
            <div className="game-instruction">
                <p>🔍 畳表の傷を見つけよう！</p>
                <p className="hint">傷や欠陥をタップしてマーキング</p>
            </div>

            {!isComplete ? (
                <>
                    <div className="character-display">
                        <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={8} />
                    </div>

                    <div
                        className="inspection-area"
                        onClick={(e) => {
                            // 背景クリック（欠陥以外）
                            if ((e.target as HTMLElement).classList.contains('inspection-area')) {
                                handleWrongClick();
                            }
                        }}
                    >
                        <div className="tatami-surface">
                            {/* 畳の織り目パターン */}
                            <div className="weave-pattern" />

                            {/* 欠陥 */}
                            {defects.map(defect => (
                                <button
                                    key={defect.id}
                                    className={`defect-spot ${foundDefects.includes(defect.id) ? 'found' : ''}`}
                                    style={{ left: `${defect.x}%`, top: `${defect.y}%` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDefectClick(defect.id);
                                    }}
                                >
                                    {foundDefects.includes(defect.id) ? '✓' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="inspection-info">
                        <p>発見した傷: {foundDefects.length} / {defects.length}</p>
                        <p>誤クリック: {wrongClicks}回</p>
                    </div>

                    <Button variant="success" fullWidth onClick={handleComplete}>
                        検査完了
                    </Button>
                </>
            ) : (
                <div className="final-results">
                    <div className="character-display large">
                        <IgusaChan
                            mood={getMoodByQP(state.qualityPoints)}
                            size="large"
                            stage={8}
                        />
                    </div>

                    <h2 className={`rank-display rank-${finalRank.toLowerCase()}`}>
                        {finalRank}ランク
                    </h2>

                    <p className="rank-message">{getRankMessage()}</p>

                    <div className="final-stats">
                        <p>最終QP: <strong>{state.qualityPoints}</strong></p>
                        <p>クイズ正解: {state.quizCorrect} / {state.quizAnswered}</p>
                    </div>

                    <div className="tatami-preview">
                        <div className={`finished-tatami rank-${finalRank.toLowerCase()}`}>
                            🏠 完成した畳表
                        </div>
                    </div>

                    <Button variant="primary" fullWidth onClick={() => onComplete(0)}>
                        結果を見る
                    </Button>
                </div>
            )}
        </div>
    );
}
