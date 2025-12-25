import { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

interface SproutPosition {
    x: number;
    isNewShoot: boolean; // 新芽かどうか
}

export function Stage1Kabuwake({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [sprouts] = useState<SproutPosition[]>(() =>
        Array.from({ length: 150 }, (_, i) => ({
            x: 0.5 + (i * 0.66), // 0%から99.5%くらいまで均等に配置
            isNewShoot: Math.random() < 0.15,
        }))
    );
    const [cutLines, setCutLines] = useState<number[]>([]);
    const [results, setResults] = useState<{ count: number; hitNewShoot: boolean }[]>([]);
    const [currentSection, setCurrentSection] = useState<number[]>([0, 10]);
    const [isComplete, setIsComplete] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const targetCuts = 10;

    // スライダー操作時にスクロール
    const handleSliderChange = (val: number) => {
        setCurrentSection([currentSection[0], val]);

        if (canvasRef.current) {
            const scrollWidth = canvasRef.current.scrollWidth;
            const clientWidth = canvasRef.current.clientWidth;
            const scrollPos = (val / 100) * scrollWidth - (clientWidth / 2);
            canvasRef.current.scrollTo({ left: scrollPos, behavior: 'auto' });
        }
    };

    // 切り分ける位置を選択
    const handleCut = (position: number) => {
        if (cutLines.length >= targetCuts || isComplete) return;

        const newCutLines = [...cutLines, position].sort((a, b) => a - b);
        setCutLines(newCutLines);

        // 現在のセクションを計算
        const sectionStart = cutLines.length > 0 ? cutLines[cutLines.length - 1] : 0;
        const sectionEnd = position;

        // このセクション内の苗の数を数える
        const sproutsInSection = sprouts.filter(
            s => s.x >= sectionStart && s.x < sectionEnd
        );
        const count = sproutsInSection.length;
        const hitNewShoot = sproutsInSection.some(s => s.isNewShoot);

        const result = { count, hitNewShoot };
        setResults([...results, result]);

        // QP計算
        let qpChange = 0;
        if (hitNewShoot) {
            qpChange = -15;
        } else if (count >= 8 && count <= 15) {
            qpChange = 10;
        } else if ((count >= 6 && count <= 7) || (count >= 16 && count <= 18)) {
            qpChange = 5;
        } else {
            qpChange = -15;
        }

        dispatch({ type: 'ADD_QP', amount: qpChange });

        // 次のセクションを設定（初期値を少し進める）
        // 残りの幅と残りのカット数から、大体の目安位置を計算
        const remainingWidth = 100 - position;
        const remainingCuts = targetCuts - newCutLines.length;
        const nextStep = remainingCuts > 0 ? remainingWidth / remainingCuts : 10;

        const nextTarget = Math.min(100, position + nextStep);
        setCurrentSection([position, nextTarget]);

        // スクロールも追従
        if (canvasRef.current) {
            const scrollWidth = canvasRef.current.scrollWidth;
            const clientWidth = canvasRef.current.clientWidth;
            const scrollPos = (position / 100) * scrollWidth - (clientWidth / 4); // 左寄りに表示
            canvasRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }

        // 完了チェック
        if (newCutLines.length >= targetCuts) {
            setIsComplete(true);
        }
    };

    const getTotalScore = () => {
        return results.reduce((sum, r) => {
            if (r.hitNewShoot) return sum;
            if (r.count >= 8 && r.count <= 15) return sum + 10;
            if ((r.count >= 6 && r.count <= 7) || (r.count >= 16 && r.count <= 18)) return sum + 5;
            return sum;
        }, 0);
    };

    const getPerfectCount = () => {
        return results.filter(r => !r.hitNewShoot && r.count >= 8 && r.count <= 15).length;
    };

    return (
        <div className="stage-game stage-kabuwake">
            <div className="game-instruction">
                <p>🌱 親株を8〜15本ずつに切り分けよう！</p>
                <p className="hint">赤い新芽は避けてね（残り{targetCuts - cutLines.length}回）</p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={1} />
            </div>

            <div className="kabuwake-field" ref={canvasRef}>
                <div className="parent-plant">
                    {sprouts.map((sprout, i) => (
                        <div
                            key={i}
                            className={`sprout ${sprout.isNewShoot ? 'new-shoot' : ''}`}
                            style={{ left: `${sprout.x}%` }}
                        >
                            🌱
                        </div>
                    ))}
                    {cutLines.map((line, i) => (
                        <div
                            key={i}
                            className="cut-line"
                            style={{ left: `${line}%` }}
                        />
                    ))}
                    {!isComplete && (
                        <div
                            className="cut-preview"
                            style={{ left: `${currentSection[1]}%` }}
                        />
                    )}
                </div>
            </div>

            {!isComplete && (
                <div className="cut-selector-container">
                    <div className="cut-selector">
                        <input
                            type="range"
                            min={currentSection[0] + 0.1}
                            max={100}
                            step={0.1}
                            value={currentSection[1]}
                            onChange={(e) => handleSliderChange(Number(e.target.value))}
                            className="cut-slider"
                        />
                        {/* プレビュー線はスライダー上ではなくフィールド上に表示したいので、ここには置かないか、工夫が必要 */}
                    </div>
                    <p className="slider-instruction">スライダーを動かして位置を調整 →</p>
                </div>
            )}

            <div className="preview-info">
                <p>この範囲: <strong>{
                    sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length
                }本</strong></p>
                <p className={
                    sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length >= 8 &&
                        sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length <= 15
                        ? 'text-success' : 'text-warning'
                }>
                    {sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length >= 8 &&
                        sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length <= 15
                        ? '✓ 適正範囲！' : '⚠ 8〜15本が目安'}
                </p>
            </div>

            <div className="game-progress">
                <p>切り分け回数: {cutLines.length} / {targetCuts}</p>
                <p>Perfect: {getPerfectCount()}回</p>
            </div>

            {!isComplete ? (
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleCut(currentSection[1])}
                    disabled={currentSection[1] <= currentSection[0] + 5}
                >
                    ✂️ 切り分ける！
                </Button>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 株分け完了！</p>
                    <p>スコア: {getTotalScore()} QP獲得</p>
                    {getPerfectCount() === targetCuts && (
                        <p className="badge-earned">🏆 「株分け名人」バッジ獲得！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => onComplete(getTotalScore())}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}
        </div>
    );
}
