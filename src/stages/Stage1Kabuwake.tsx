import { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

interface SproutPosition {
    x: number;
    isNewShoot: boolean; // 新芽かどうか
    rotation: number;
    height: number;
}

export function Stage1Kabuwake({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    const [sprouts] = useState<SproutPosition[]>(() => {
        // 解けるように、3〜4本（うち新芽1本）のグループを生成して結合する
        const generatedSprouts: SproutPosition[] = [];
        const numGroups = 10; // カット回数と同じ数だけグループを作る

        for (let i = 0; i < numGroups; i++) {
            const groupSize = Math.random() < 0.5 ? 3 : 4; // 3本か4本
            const newShootIndex = Math.floor(Math.random() * groupSize); // グループ内のどこか1本を新芽にする

            for (let j = 0; j < groupSize; j++) {
                generatedSprouts.push({
                    x: 0, // あとで再計算
                    isNewShoot: j === newShootIndex,
                    rotation: (Math.random() - 0.5) * 10,
                    height: 18 + Math.random() * 8, // 18-26px
                });
            }
        }

        // 全体の幅に合わせてx座標を割り振る
        // 密度を高めるため、親要素の幅(CSS)も調整するが、ここでは相対位置(%)を決める
        const totalSprouts = generatedSprouts.length;
        return generatedSprouts.map((s, i) => ({
            ...s,
            x: 2 + (i * (96 / totalSprouts)) // 2%〜98%の範囲に均等配置
        }));
    });
    const [cutLines, setCutLines] = useState<number[]>([]);
    // resultsの型を変更: hitNewShoot(boolean) -> newShootCount(number)
    const [results, setResults] = useState<{ count: number; newShootCount: number }[]>([]);
    const [currentSection, setCurrentSection] = useState<number[]>([0, 10]);
    const [isComplete, setIsComplete] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const igusaCanvasRef = useRef<HTMLCanvasElement>(null);

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

        // 背景（土の色）
        const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
        gradient.addColorStop(0, '#8D6E63');
        gradient.addColorStop(1, '#5D4037');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // い草の描画
        const groundY = rect.height * 0.8; // 地面の位置

        sprouts.forEach(sprout => {
            const x = (sprout.x / 100) * rect.width;
            const h = sprout.height * 3; // スケールアップ

            // 色設定
            if (sprout.isNewShoot) {
                // 新芽は明るい黄緑
                const g = 200 + Math.floor(Math.random() * 55);
                ctx.strokeStyle = `rgb(180, ${g}, 100)`;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(220, 237, 200, 0.8)';
                ctx.shadowBlur = 4;
            } else {
                // 通常の茎は緑
                const g = 140 + Math.floor(Math.random() * 60);
                ctx.strokeStyle = `rgb(80, ${g}, 80)`;
                ctx.lineWidth = 2;
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // 茎を曲線で描画
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            const curveX = x + sprout.rotation * 0.5;
            ctx.quadraticCurveTo(
                x + sprout.rotation * 0.2,
                groundY - h / 2,
                curveX,
                groundY - h
            );
            ctx.stroke();

            // 影リセット
            ctx.shadowBlur = 0;
        });

        // カットラインの描画
        cutLines.forEach(line => {
            const x = (line / 100) * rect.width;
            ctx.beginPath();
            ctx.strokeStyle = '#E53935';
            ctx.lineWidth = 2;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, rect.height);
            ctx.stroke();
        });

        // プレビューラインの描画
        if (!isComplete) {
            const previewX = (currentSection[1] / 100) * rect.width;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(previewX, 0);
            ctx.lineTo(previewX, rect.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }, [sprouts, cutLines, currentSection, isComplete]);

    // Canvas描画のトリガー
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    const targetCuts = 10;

    // スライダー操作時にスクロール
    const handleSliderChange = (val: number) => {
        setCurrentSection([currentSection[0], val]);

        // スクロール処理は廃止
        // if (containerRef.current) ...
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
        const newShootCount = sproutsInSection.filter(s => s.isNewShoot).length;

        const result = { count, newShootCount };
        setResults([...results, result]);

        // QP計算
        let qpChange = 0;

        // Logic update:
        // 1. New Shoot >= 1:
        //    - Count 3-4: Perfect (+10)
        //    - Count 2 or 5: Good (+5)
        //    - Else: Miss (-5)
        // 2. New Shoot == 0:
        //    - Count 2-3: OK/Good (+5)
        //    - Else: Miss (-5)

        if (newShootCount >= 1) {
            if (count >= 3 && count <= 4) {
                qpChange = 10;
            } else if (count >= 2 && count <= 5) { // Relaxed slightly to include 2-5 range for Good
                qpChange = 5;
            } else {
                qpChange = -5;
            }
        } else {
            // No new shoot
            if (count >= 2 && count <= 3) {
                qpChange = 5; // OK
            } else {
                qpChange = -5;
            }
        }

        dispatch({ type: 'ADD_QP', amount: qpChange });

        // 次のセクションを設定（初期値を少し進める）
        const remainingWidth = 100 - position;
        const remainingCuts = targetCuts - newCutLines.length;
        const nextStep = remainingCuts > 0 ? remainingWidth / remainingCuts : 10;

        const nextTarget = Math.min(100, position + nextStep);
        setCurrentSection([position, nextTarget]);

        // 完了チェック
        if (newCutLines.length >= targetCuts) {
            setIsComplete(true);
        }
    };

    const getTotalScore = () => {
        return results.reduce((sum, r) => {
            if (r.newShootCount >= 1) {
                if (r.count >= 3 && r.count <= 4) return sum + 10;
                if (r.count >= 2 && r.count <= 5) return sum + 5;
            } else {
                if (r.count >= 2 && r.count <= 3) return sum + 5;
            }
            return sum;
        }, 0);
    };

    const getPerfectCount = () => {
        return results.filter(r => r.newShootCount >= 1 && r.count >= 3 && r.count <= 4).length;
    };

    // プレビュー時の判定（まだカットしてないので予測）
    const getPreviewStatus = () => {
        const sproutsInSection = sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]);
        const count = sproutsInSection.length;
        const newShootCount = sproutsInSection.filter(s => s.isNewShoot).length;

        if (newShootCount >= 1) {
            if (count >= 3 && count <= 4) return { text: <><ruby>良<rt>よ</rt></ruby>い<ruby>株<rt>かぶ</rt></ruby>！</>, className: 'text-success' };
            if (count >= 2 && count <= 5) return { text: '⚠ まあまあ', className: 'text-warning' };
            return { text: <><ruby>本数<rt>ほんすう</rt></ruby>を<ruby>調整<rt>ちょうせい</rt></ruby>して</>, className: 'text-danger' };
        } else {
            // No new shoot
            if (count >= 2 && count <= 3) return { text: '⚠ まあまあ', className: 'text-warning' };
            return { text: <><ruby>新芽<rt>しんめ</rt></ruby>がないときは2〜3<ruby>本<rt>ほん</rt></ruby>に</>, className: 'text-danger' };
        }
    };

    const previewStatus = getPreviewStatus();

    return (
        <div className="stage-game stage-kabuwake">
            <div className="game-instruction">
                <p>🌱 <ruby>親<rt>おや</rt></ruby><ruby>株<rt>かぶ</rt></ruby>を3〜4<ruby>本<rt>ほん</rt></ruby>ずつ（<ruby>新芽<rt>しんめ</rt></ruby>1<ruby>本<rt>ほん</rt></ruby>を<ruby>含<rt>ふく</rt></ruby>む）に<ruby>切<rt>き</rt></ruby>り<ruby>分<rt>わ</rt></ruby>けよう！</p>
                <p className="hint"><ruby>色<rt>いろ</rt></ruby>の<ruby>違<rt>ちが</rt></ruby>う<ruby>新芽<rt>しんめ</rt></ruby>（<ruby>明<rt>あか</rt></ruby>るい<ruby>緑<rt>みどり</rt></ruby>）を<strong><ruby>必<rt>かなら</rt></ruby>ず1<ruby>本<rt>ほん</rt></ruby></strong><ruby>入<rt>い</rt></ruby>れてね（<ruby>残<rt>のこ</rt></ruby>り{targetCuts - cutLines.length}<ruby>回<rt>かい</rt></ruby>）</p>
            </div>

            <div className="kabuwake-field" ref={containerRef}>
                <canvas ref={igusaCanvasRef} style={{ width: '100%', height: '100%' }} />
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
                    </div>
                    <p className="slider-instruction">スライダーを<ruby>動<rt>うご</rt></ruby>かして<ruby>位置<rt>いち</rt></ruby>を<ruby>調整<rt>ちょうせい</rt></ruby> →</p>
                </div>
            )}

            <div className="preview-info">
                <p>この範囲: <strong>{
                    sprouts.filter(s => s.x >= currentSection[0] && s.x < currentSection[1]).length
                }<ruby>本<rt>ほん</rt></ruby></strong></p>
                <p className={previewStatus.className}>
                    {previewStatus.text}
                </p>
            </div>

            <div className="game-progress">
                <p><ruby>切<rt>き</rt></ruby>り<ruby>分<rt>わ</rt></ruby>け<ruby>回数<rt>かいすう</rt></ruby>: {cutLines.length} / {targetCuts}</p>
                <p>Perfect: {getPerfectCount()}<ruby>回<rt>かい</rt></ruby></p>
            </div>

            {!isComplete ? (
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleCut(currentSection[1])}
                    disabled={currentSection[1] <= currentSection[0] + 5}
                >
                    <span><ruby>切<rt>き</rt></ruby>り<ruby>分<rt>わ</rt></ruby>ける！</span>
                </Button>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 <ruby>株<rt>かぶ</rt></ruby><ruby>分<rt>わ</rt></ruby>け<ruby>完了<rt>かんりょう</rt></ruby>！</p>
                    <p>スコア: {getTotalScore()} QP<ruby>獲得<rt>かくとく</rt></ruby></p>
                    {getPerfectCount() === targetCuts && (
                        <p className="badge-earned">🏆 「<ruby>株<rt>かぶ</rt></ruby><ruby>分<rt>わ</rt></ruby>け<ruby>名人<rt>めいじん</rt></ruby>」バッジ<ruby>獲得<rt>かくとく</rt></ruby>！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => {
                        if (getPerfectCount() === targetCuts) {
                            dispatch({
                                type: 'EARN_BADGE',
                                badge: { id: 'kabuwake', name: '株分け名人', icon: '🌱', description: '株分けで全てパーフェクト' }
                            });
                        }
                        onComplete(getTotalScore());
                    }}>
                        ☀️ <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
