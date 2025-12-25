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
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [currentEvent, setCurrentEvent] = useState<EventType>(null);
    const [eventHandled, setEventHandled] = useState(false);

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
                    x: 10 + Math.random() * 80,
                    y: 20 + Math.random() * 60,
                }));
                setBugs(newBugs);
            }
        }
    }, [day]); // eventSchedule is constant

    // Canvas描画
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        const drawIgusa = () => {
            // 成長度合い (Day 9 -> 30%, Day 20 -> 100%)
            const growthRatio = Math.min(1, Math.max(0.3, 0.3 + (day - 9) * 0.07));
            const baseHeight = rect.height * 0.7 * growthRatio; // 最大高さは画面の70%
            const count = 2000; // 本数

            for (let i = 0; i < count; i++) {
                const x = Math.random() * rect.width;
                const variance = Math.random() * 0.4 + 0.8; // 高さのばらつき
                const h = baseHeight * variance;

                // 色のばらつき
                const green = Math.floor(100 + Math.random() * 100);
                const color = `rgb(${Math.random() < 0.1 ? 180 : 40}, ${green}, ${Math.random() < 0.1 ? 40 : 80})`;

                ctx.beginPath();
                ctx.moveTo(x, rect.height);
                // 少しカーブさせる
                const curveX = x + (Math.random() - 0.5) * 10;
                ctx.quadraticCurveTo(x, rect.height - h / 2, curveX, rect.height - h);

                ctx.lineWidth = 1 + Math.random(); // 1-2px
                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.8;
                ctx.stroke();
            }
        };

        drawIgusa();

    }, [day]); // 再描画トリガー: 日付変更時のみ（害虫駆除で再描画しない）

    // 害虫をタップで駆除
    const handleBugTap = useCallback((bugId: number) => {
        setBugs(prev => prev.filter(b => b.id !== bugId));
        dispatch({ type: 'ADD_QP', amount: 2 });
        setTotalScore(prev => prev + 2);
    }, [dispatch]);

    // 網上げ
    const handleNetRaise = () => {
        setNetHeight(prev => prev + 1);
        dispatch({ type: 'ADD_QP', amount: 5 });
        setTotalScore(prev => prev + 5);
        setEventHandled(true);
        setCurrentEvent(null);
    };

    // ガス抜き
    const handleGasDrain = () => {
        dispatch({ type: 'ADD_QP', amount: 5 });
        setTotalScore(prev => prev + 5);
        setEventHandled(true);
        setCurrentEvent(null);
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
        setEventHandled(true);
        setCurrentEvent(null);
    };

    // 次の日へ
    const handleNextDay = () => {
        if (!eventHandled && currentEvent) {
            // イベント未処理でペナルティ
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
                        <h3>網上げの時間！</h3>
                        <p>い草が伸びてきたよ。網を10cm上げよう！</p>
                        <p className="net-info">現在の網の高さ: {netHeight * 10}cm</p>
                        <Button variant="primary" onClick={handleNetRaise}>
                            網を上げる（+10cm）
                        </Button>
                    </div>
                );
            case 'bug':
                return (
                    <div className="event-card event-bug">
                        <h3>害虫発生！</h3>
                        <p>イグサシンムシガが出現！タップで駆除しよう！</p>
                        <div className="bug-field">
                            {bugs.map(bug => (
                                <button
                                    key={bug.id}
                                    className="bug-target"
                                    style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
                                    onClick={() => handleBugTap(bug.id)}
                                >
                                    <div className="icon-bug" />
                                </button>
                            ))}
                        </div>
                        <p>残り害虫: {bugs.length}匹</p>
                        <Button variant="warning" onClick={handleBugComplete}>
                            駆除完了
                        </Button>
                    </div>
                );
            case 'gas':
                return (
                    <div className="event-card event-gas">
                        <h3>ガス発生！</h3>
                        <p>田んぼから泡が出てきた！間断かん水でガスを抜こう。</p>
                        <div className="gas-bubbles">
                            <span className="gas-bubble"></span>
                            <span className="gas-bubble"></span>
                            <span className="gas-bubble"></span>
                        </div>
                        <Button variant="primary" onClick={handleGasDrain}>
                            間断かん水を行う
                        </Button>
                    </div>
                );
            case 'typhoon':
                return (
                    <div className="event-card event-typhoon">
                        <h3>台風接近！</h3>
                        <p>台風が来るよ！網を補強して備えよう。</p>
                        <Button variant="danger" onClick={handleTyphoonPrep}>
                            網を補強する
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
                <p>成長期を乗り越えよう！</p>
                <p className="hint">Day {day} / 20</p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints, 4)} size="medium" stage={4} />
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
                    <p>🌱 い草が順調に育っています</p>
                    <p>網の高さ: {netHeight * 10}cm</p>
                </div>
            )}

            {!isComplete ? (
                <Button
                    variant="success"
                    fullWidth
                    onClick={handleNextDay}
                    disabled={currentEvent !== null && !eventHandled}
                >
                    次の日へ →
                </Button>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 成長期完了！</p>
                    <p>獲得スコア: {totalScore} QP</p>
                    <Button variant="success" fullWidth onClick={() => onComplete(totalScore)}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}

            <div className="game-progress">
                <p>累計スコア: {totalScore} QP</p>
            </div>
        </div>
    );
}
