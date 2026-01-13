import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP, getFinalRank } from '../types/game';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

interface Defect {
    id: number;
    x: number;
    y: number;
    found: boolean;
}

export function Stage8Kensa({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    const [defects] = useState<Defect[]>(() => {
        // ランダムに5-8個の欠陥を配置（重なり防止）
        const count = 5 + Math.floor(Math.random() * 4);
        const newDefects: Defect[] = [];
        const MIN_DISTANCE = 15; // 最小距離（%）

        for (let i = 0; i < count; i++) {
            let x, y, valid;
            let attempts = 0;

            do {
                valid = true;
                x = 10 + Math.random() * 80;
                y = 10 + Math.random() * 80;
                attempts++;

                // 既存の欠陥との距離をチェック
                for (const existing of newDefects) {
                    const dist = Math.sqrt(Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2));
                    if (dist < MIN_DISTANCE) {
                        valid = false;
                        break;
                    }
                }

                // 無限ループ防止（100回試行してもダメなら諦めて配置）
            } while (!valid && attempts < 100);

            newDefects.push({ id: i, x, y, found: false });
        }
        return newDefects;
    });
    const [foundDefects, setFoundDefects] = useState<number[]>([]);
    const [wrongClicks, setWrongClicks] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [canComplete, setCanComplete] = useState(false);

    // 開始直後の誤操作防止
    useEffect(() => {
        // 1秒後に操作可能にするが、完了ボタンは傷を見つけるまで押せないようにする
        const timer = setTimeout(() => setCanComplete(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // 欠陥をタップ
    const handleDefectClick = (defectId: number) => {
        if (foundDefects.includes(defectId)) return;

        setFoundDefects(prev => [...prev, defectId]);
        dispatch({ type: 'ADD_QP', amount: 2 });
    };

    // 間違いクリック
    const handleWrongClick = () => {
        setWrongClicks(prev => prev + 1);
        // ペナルティ削除：誤クリックでの減点はストレスになるため廃止
        // dispatch({ type: 'ADD_QP', amount: -1 });
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
            case 'S': return <><ruby>最高級<rt>さいこうきゅう</rt></ruby>！<ruby>い草<rt>いぐさ</rt></ruby>の<ruby>長<rt>なが</rt></ruby>さ・<ruby>色<rt>いろ</rt></ruby>・<ruby>光沢<rt>こうたく</rt></ruby>すべて<ruby>完璧<rt>かんぺき</rt></ruby>！</>;
            case 'A': return <><ruby>高品質<rt>こうひんしつ</rt></ruby>！5<ruby>年後<rt>ねんご</rt></ruby>も<ruby>明<rt>あか</rt></ruby>るい<ruby>飴色<rt>あめいろ</rt></ruby>に<ruby>変化<rt>へんか</rt></ruby>します</>;
            case 'B': return <><ruby>標準<rt>ひょうじゅん</rt></ruby><ruby>品質<rt>ひんしつ</rt></ruby>。<ruby>若干<rt>じゃっかん</rt></ruby>の<ruby>黒筋<rt>くろすじ</rt></ruby>がありますが<ruby>使用<rt>しよう</rt></ruby>には<ruby>問題<rt>もんだい</rt></ruby>なし</>;
            case 'C': return <><ruby>色<rt>いろ</rt></ruby>ムラあり。<ruby>耐久性<rt>たいきゅうせい</rt></ruby>は<ruby>低<rt>ひく</rt></ruby>めです</>;
            case 'D': return <><ruby>規格外<rt>きかくがい</rt></ruby>...<ruby>出荷<rt>しゅっか</rt></ruby><ruby>不可<rt>ふか</rt></ruby>です。もう<ruby>一度<rt>いちど</rt></ruby><ruby>挑戦<rt>ちょうせん</rt></ruby>しよう！</>;
        }
    };

    return (
        <div className="stage-game stage-kensa">
            <div className="game-instruction">
                <p><ruby>畳表<rt>たたみおもて</rt></ruby>の<ruby>傷<rt>きず</rt></ruby>を<ruby>見<rt>み</rt></ruby>つけよう！</p>
                <p className="hint"><ruby>傷<rt>きず</rt></ruby>や<ruby>欠陥<rt>けっかん</rt></ruby>をタップしてマーキング</p>
            </div>

            {!isComplete ? (
                <>
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
                                    {foundDefects.includes(defect.id) ? <div className="icon-check" /> : ''}
                                </button>
                            ))}
                        </div>
                    </div>



                    <div className="inspection-info">
                        <p><ruby>発見<rt>はっけん</rt></ruby>した<ruby>傷<rt>きず</rt></ruby>: {foundDefects.length} / {defects.length}</p>
                        <p><ruby>誤<rt>ご</rt></ruby>クリック: {wrongClicks}<ruby>回<rt>かい</rt></ruby></p>
                        {foundDefects.length < 3 && (
                            <p className="text-warning" style={{ fontSize: '12px' }}>
                                ※あと{3 - foundDefects.length}<ruby>個<rt>こ</rt></ruby><ruby>見<rt>み</rt></ruby>つけて！
                            </p>
                        )}
                    </div>

                    <Button
                        variant="success"
                        fullWidth
                        onClick={handleComplete}
                        disabled={!canComplete || foundDefects.length < 3}
                    >
                        <span><ruby>検査<rt>けんさ</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby></span>
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
                        <p><ruby>最終<rt>さいしゅう</rt></ruby>QP: <strong>{state.qualityPoints}</strong></p>
                        <p>クイズ<ruby>正解<rt>せいかい</rt></ruby>: {state.quizCorrect} / {state.quizAnswered}</p>
                    </div>

                    <div className="tatami-preview">
                        <div className={`finished-tatami rank-${finalRank.toLowerCase()}`}>
                            <ruby>完成<rt>かんせい</rt></ruby>した<ruby>畳表<rt>たたみおもて</rt></ruby>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth onClick={() => onComplete(0)}>
                        <span><ruby>結果<rt>けっか</rt></ruby>を<ruby>見<rt>み</rt></ruby>る</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
