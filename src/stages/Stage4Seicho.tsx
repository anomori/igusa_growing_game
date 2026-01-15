import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
    onNextDay: () => void;
}

interface Bug {
    id: number;
    x: number;
    y: number;
}

type EventType = 'net' | 'bug' | 'gas' | 'typhoon' | null;

export function Stage4Seicho({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    // グローバルな日付を使用 (Day 9-20)
    const day = state.currentDay;
    const [totalScore, setTotalScore] = useState(0);
    const [netHeight, setNetHeight] = useState(1);
    const [targetNetHeight, setTargetNetHeight] = useState(2); // スライダーで調整する目標値
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [currentEvent, setCurrentEvent] = useState<EventType>(null);
    const [eventHandled, setEventHandled] = useState(false);
    // 地干し（落水）用の状態
    const [waterPhase, setWaterPhase] = useState<'flooded' | 'draining' | 'drained'>('flooded');
    const [drainCycles, setDrainCycles] = useState(0);

    // イベントスケジュール
    const eventSchedule: Record<number, EventType> = {
        9: 'net',
        11: 'bug',
        12: 'net',
        14: 'gas',
        16: 'bug',
        17: 'net',
        19: 'typhoon',
    };

    // 日が変わったときのイベント発生
    useEffect(() => {
        const event = eventSchedule[day];
        if (event) {
            setCurrentEvent(event);
            setEventHandled(false);
            if (event === 'bug') {
                // 害虫を生成
                const newBugs = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => ({
                    id: i,
                    x: 10 + Math.random() * 80, // 10-90%
                    y: 30 + Math.random() * 40, // 30-70% (上からの位置)
                }));
                setBugs(newBugs);
            }
        } else {
            setCurrentEvent(null);
            setEventHandled(false);
        }
    }, [day]);

    // Canvas描画（メイン背景）
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // 害虫イベント用Canvas
    const bugCanvasRef = useRef<HTMLCanvasElement>(null);

    // メイン背景の描画
    useEffect(() => {
        const canvas = canvasRef.current;
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
        const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
        gradient.addColorStop(0, '#87CEEB'); // 空
        gradient.addColorStop(0.6, '#E0F7FA');
        gradient.addColorStop(0.6, '#4CAF50'); // 地面
        gradient.addColorStop(1, '#1B5E20');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // い草の描画
        const count = 2000;
        const growthRatio = Math.min(1, Math.max(0.3, 0.3 + (day - 9) * 0.07));
        const baseHeight = rect.height * 0.7 * growthRatio;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * rect.width;
            const h = baseHeight * (Math.random() * 0.4 + 0.8);
            const green = Math.floor(100 + Math.random() * 100);
            const color = `rgb(${Math.random() < 0.1 ? 180 : 40}, ${green}, ${Math.random() < 0.1 ? 40 : 80})`;

            ctx.beginPath();
            ctx.moveTo(x, rect.height);
            const curveX = x + (Math.random() - 0.5) * 10;
            ctx.quadraticCurveTo(x, rect.height - h / 2, curveX, rect.height - h);

            ctx.lineWidth = 1 + Math.random();
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.stroke();
        }
    }, [day]);

    // 害虫退治モードの背景描画 (Canvas)
    // リトライロジックを追加したバージョン
    useEffect(() => {
        if (currentEvent !== 'bug') return;

        let animationFrameId: number;
        let retryCount = 0;

        const renderCanvas = () => {
            const canvas = bugCanvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            // サイズが取得できるまでリトライ（最大20回）
            if ((rect.width === 0 || rect.height === 0) && retryCount < 20) {
                retryCount++;
                animationFrameId = requestAnimationFrame(renderCanvas);
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            // rectが0の場合のフォールバック
            const width = rect.width || canvas.clientWidth || 300;
            const height = rect.height || canvas.clientHeight || 120;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            // 背景クリア
            ctx.clearRect(0, 0, width, height);

            // 土台
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(0, height - 20, width, 20);

            // 1. 通常のい草（背景用）
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * width;
                const h = 40 + Math.random() * 60;
                ctx.strokeStyle = `rgba(60, ${150 + Math.random() * 50}, 60, 0.5)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, height - 10);
                // 上部は少しランダムに
                ctx.quadraticCurveTo(
                    x + (Math.random() - 0.5) * 10,
                    height - 10 - h / 2,
                    x + (Math.random() - 0.5) * 20,
                    height - 10 - h
                );
                ctx.stroke();
            }
        };

        // 少し遅延させてから開始
        animationFrameId = requestAnimationFrame(renderCanvas);

        return () => cancelAnimationFrame(animationFrameId);
    }, [currentEvent, bugs]);

    // 害虫をタップで駆除
    const handleBugTap = useCallback((bugId: number) => {
        setBugs(prev => prev.filter(b => b.id !== bugId));
        dispatch({ type: 'ADD_QP', amount: 2 });
        setTotalScore(prev => prev + 2);
    }, [dispatch]);

    // 網上げ（スライダーで調整した値を適用）
    const handleNetRaise = () => {
        const raiseAmount = targetNetHeight - netHeight;
        // 目標が現在の高さ+1なら完璧、±1ならOK、それ以外は減点
        let qp = 0;
        if (raiseAmount === 1) {
            qp = 10; // 完璧
        } else if (raiseAmount === 2) {
            qp = 5; // 上げすぎ
        } else if (raiseAmount === 0) {
            qp = -5; // 上げてない
        } else {
            qp = -10; // 下げた
        }
        setNetHeight(targetNetHeight);
        dispatch({ type: 'ADD_QP', amount: qp });
        setTotalScore(prev => prev + Math.max(0, qp));
        setEventHandled(true);
        setCurrentEvent(null);
    };

    // 地干し（水を抜く）
    const handleDrain = () => {
        if (waterPhase === 'flooded') {
            setWaterPhase('draining');
            setTimeout(() => setWaterPhase('drained'), 1000);
        }
    };

    // 地干し（水を入れる）
    const handleFlood = () => {
        if (waterPhase === 'drained') {
            setWaterPhase('flooded');
            setDrainCycles(prev => prev + 1);
        }
    };

    // 台風対策
    const handleTyphoonPrep = () => {
        dispatch({ type: 'ADD_QP', amount: 5 });
        setTotalScore(prev => prev + 5);
        setEventHandled(true);
        setCurrentEvent(null);
    };

    // 害虫駆除完了
    const handleBugComplete = () => {
        if (bugs.length > 0) {
            // 残った害虫でペナルティ
            const penalty = bugs.length * -5;
            dispatch({ type: 'ADD_QP', amount: penalty });
            setTotalScore(prev => prev + penalty);
        }
        setBugs([]);
        // イベントハンドリング完了
        setEventHandled(true);
        setCurrentEvent(null);
    };

    // 次の日へ
    const handleNextDay = () => {
        // 地干しイベントの場合のスコア計算
        if (currentEvent === 'gas') {
            let qp = 0;
            if (drainCycles >= 1) {
                qp = 10; // 地干し完了
            } else {
                qp = -5; // 地干しをしなかった
            }
            dispatch({ type: 'ADD_QP', amount: qp });
            setTotalScore(prev => prev + Math.max(0, qp));
            setDrainCycles(0);
            setWaterPhase('flooded');
            // イベント処理済みとしてマーク（内部的に）
            setEventHandled(true);
        } else if (!eventHandled && currentEvent) {
            // その他のイベントで未処理の場合のペナルティ
            if (currentEvent === 'net') {
                dispatch({ type: 'ADD_QP', amount: -10 });
                setTotalScore(prev => prev - 10);
            }
        }

        if (day < 20) {
            onNextDay();
            setEventHandled(false);
        } else {
            onComplete(totalScore);
        }
    };

    const getEventContent = () => {
        switch (currentEvent) {
            case 'net':
                return (
                    <div className="event-card event-net">
                        <h3><ruby>網<rt>あみ</rt></ruby><ruby>上<rt>あ</rt></ruby>げの<ruby>時間<rt>じかん</rt></ruby>！</h3>
                        <p><ruby>い草<rt>いぐさ</rt></ruby>が<ruby>伸<rt>の</rt></ruby>びてきたよ。<ruby>網<rt>あみ</rt></ruby>の<ruby>高<rt>たか</rt></ruby>さを<ruby>調整<rt>ちょうせい</rt></ruby>しよう！</p>
                        <p className="net-info"><ruby>現在<rt>げんざい</rt></ruby>の<ruby>網<rt>あみ</rt></ruby>の<ruby>高<rt>たか</rt></ruby>さ: {netHeight * 10}cm</p>
                        <div className="net-slider-container">
                            <label><ruby>目標<rt>もくひょう</rt></ruby>の<ruby>高<rt>たか</rt></ruby>さ: {targetNetHeight * 10}cm</label>
                            <input
                                type="range"
                                min={1}
                                max={8}
                                value={targetNetHeight}
                                onChange={(e) => setTargetNetHeight(Number(e.target.value))}
                                className="net-slider"
                            />
                            <p className="slider-hint">
                                {targetNetHeight - netHeight === 1 && '✓ いい感じ！'}
                                {targetNetHeight - netHeight === 0 && '⚠ 上げてません'}
                                {targetNetHeight - netHeight === 2 && '⚠ 少し上げすぎかも'}
                                {targetNetHeight - netHeight > 2 && '⚠ 上げすぎ注意！'}
                                {targetNetHeight - netHeight < 0 && '✕ 下げないで！'}
                            </p>
                        </div>
                        <Button variant="primary" onClick={handleNetRaise}>
                            <span><ruby>決定<rt>けってい</rt></ruby>！<ruby>網<rt>あみ</rt></ruby>を<ruby>上<rt>あ</rt></ruby>げる</span>
                        </Button>
                    </div>
                );
            case 'bug':
                return (
                    <div className="event-card event-bug">
                        <h3><ruby>害虫<rt>がいちゅう</rt></ruby><ruby>発生<rt>はっせい</rt></ruby>！</h3>
                        <p style={{ fontSize: '12px', margin: '4px 0' }}>イグサシンムシガが<ruby>出現<rt>しゅつげん</rt></ruby>！タップで<ruby>駆除<rt>くじょ</rt></ruby>しよう！</p>
                        <div className="bug-canvas-container" style={{ position: 'relative', height: '120px', borderRadius: '8px', overflow: 'hidden', background: 'linear-gradient(to bottom, #E0F7FA 80%, #8D6E63 80%)' }}>
                            {/* Canvas背景: い草畑 */}
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: 0,
                                    left: 0
                                }}
                            />
                            {/* 虫オーバーレイ & い草 */}
                            {bugs.map(bug => (
                                <div key={bug.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    {/* い草の茎 (bottomから虫の位置まで) */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: `${bug.x}%`,
                                            top: `${bug.y}%`, // 虫の中心位置
                                            bottom: '10px', // Canvasの土の位置に合わせる
                                            width: '4px',
                                            background: '#2E7D32',
                                            transform: 'translateX(-50%)',
                                            borderRadius: '2px', // 少し丸みを持たせる
                                            transformOrigin: 'bottom',
                                            zIndex: 1
                                        }}
                                    />
                                    {/* 虫本体 */}
                                    <button
                                        className="bug-target"
                                        style={{
                                            left: `${bug.x}%`,
                                            top: `${bug.y}%`,
                                            zIndex: 2,
                                            pointerEvents: 'auto'
                                        }}
                                        onClick={() => handleBugTap(bug.id)}
                                    >
                                        <div className="icon-bug" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '4px 0' }}><ruby>残<rt>のこ</rt></ruby>り<ruby>害虫<rt>がいちゅう</rt></ruby>: {bugs.length}<ruby>匹<rt>ひき</rt></ruby></p>
                        <Button variant="warning" onClick={handleBugComplete}>
                            <span><ruby>駆除<rt>くじょ</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby></span>
                        </Button>
                    </div>
                );
            case 'gas':
                return (
                    <div className="event-card event-gas">
                        <h3 style={{ marginBottom: '4px' }}><ruby>地<rt>じ</rt></ruby><ruby>干<rt>ぼ</rt></ruby>しをしよう</h3>
                        <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>
                            <ruby>水<rt>みず</rt></ruby>が<ruby>長<rt>なが</rt></ruby>く<ruby>続<rt>つづ</rt></ruby>くと<ruby>土<rt>つち</rt></ruby>に<ruby>空気<rt>くうき</rt></ruby>がなくなるよ。<ruby>落水<rt>らくすい</rt></ruby>して<ruby>土<rt>つち</rt></ruby>に<ruby>空気<rt>くうき</rt></ruby>を<ruby>入<rt>い</rt></ruby>れよう！
                        </p>
                        <div className={`water-field water-${waterPhase}`} style={{ height: '60px', margin: '8px 0' }}>
                            <p className="water-status" style={{ fontSize: '14px', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                                {waterPhase === 'flooded' && <><ruby>水<rt>みず</rt></ruby>あり 💧</>}
                                {waterPhase === 'draining' && <><ruby>落水<rt>らくすい</rt></ruby><ruby>中<rt>ちゅう</rt></ruby>...</>}
                                {waterPhase === 'drained' && <><ruby>乾燥<rt>かんそう</rt></ruby> ☀️</>}
                            </p>
                        </div>
                        <div className="water-controls" style={{ marginBottom: '8px' }}>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={handleDrain}
                                disabled={waterPhase !== 'flooded' || drainCycles >= 1}
                            >
                                <span>💧 <ruby>落水<rt>らくすい</rt></ruby></span>
                            </Button>
                            <Button
                                variant="primary"
                                size="small"
                                onClick={handleFlood}
                                disabled={waterPhase !== 'drained' || drainCycles >= 1}
                            >
                                <span>🌊 <ruby>給水<rt>きゅうすい</rt></ruby></span>
                            </Button>
                        </div>
                        <p style={{ margin: '4px 0' }}>
                            {drainCycles >= 1
                                ? <>✓ <ruby>地干<rt>じぼ</rt></ruby>し<ruby>完了<rt>かんりょう</rt></ruby>！<ruby>土<rt>つち</rt></ruby>に<ruby>空気<rt>くうき</rt></ruby>が<ruby>入<rt>はい</rt></ruby>ったよ</>
                                : <><ruby>落水<rt>らくすい</rt></ruby>ボタンを<ruby>押<rt>お</rt></ruby>して<ruby>地干<rt>じぼ</rt></ruby>しをしよう！</>}
                        </p>
                        {/* 完了ボタン削除: 次の日へボタンで進行 */}
                    </div>
                );
            case 'typhoon':
                return (
                    <div className="event-card event-typhoon">
                        <h3><ruby>台風<rt>たいふう</rt></ruby><ruby>接近<rt>せっきん</rt></ruby>！</h3>
                        <p><ruby>台風<rt>たいふう</rt></ruby>ができるよ！<ruby>網<rt>あみ</rt></ruby>を<ruby>補強<rt>ほきょう</rt></ruby>して<ruby>備<rt>そな</rt></ruby>えよう。</p>
                        <Button variant="danger" onClick={handleTyphoonPrep}>
                            <span><ruby>網<rt>あみ</rt></ruby>を<ruby>補強<rt>ほきょう</rt></ruby>する</span>
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const isComplete = day >= 20 && !currentEvent;

    return (
        <div className="stage-game stage-seicho">
            <div className="game-instruction">
                <p><ruby>成長期<rt>せいちょうき</rt></ruby>を<ruby>乗<rt>の</rt></ruby>り<ruby>越<rt>こ</rt></ruby>えよう！</p>
                <p className="hint">Day {day} / 20</p>
            </div>

            <div className="growth-field">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                <div
                    className="net-overlay"
                    style={{ bottom: `${netHeight * 10}%` }}
                />
            </div>

            {currentEvent && !eventHandled ? (
                getEventContent()
            ) : (
                <div className="day-status">
                    <p>🌱 <ruby>い草<rt>いぐさ</rt></ruby>が<ruby>順調<rt>じゅんちょう</rt></ruby>に<ruby>育<rt>そだ</rt></ruby>っています</p>
                    <p><ruby>網<rt>あみ</rt></ruby>の<ruby>高<rt>たか</rt></ruby>さ: {netHeight * 10}cm</p>
                </div>
            )}

            {!isComplete ? (
                <Button
                    variant="success"
                    fullWidth
                    onClick={handleNextDay}
                    disabled={currentEvent !== 'gas' && currentEvent !== null && !eventHandled}
                >
                    <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ →</span>
                </Button>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 <ruby>成長期<rt>せいちょうき</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby>！</p>
                    <p><ruby>獲得<rt>かくとく</rt></ruby>スコア: {totalScore} QP</p>
                    <Button variant="success" fullWidth onClick={() => onComplete(totalScore)}>
                        ☀️ <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</span>
                    </Button>
                </div>
            )}

            <div className="game-progress">
                <p><ruby>累計<rt>るいけい</rt></ruby>スコア: {totalScore} QP</p>
            </div>
        </div>
    );
}
