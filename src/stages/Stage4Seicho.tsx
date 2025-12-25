import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

interface Bug {
    id: number;
    x: number;
    y: number;
}

type EventType = 'net' | 'bug' | 'gas' | 'typhoon' | null;

export function Stage4Seicho({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [day, setDay] = useState(9);
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
    }, [day]);

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
            setDay(day + 1);
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
                        <h3>🕸️ 網上げの時間！</h3>
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
                        <h3>🐛 害虫発生！</h3>
                        <p>イグサシンムシガが出現！タップで駆除しよう！</p>
                        <div className="bug-field">
                            {bugs.map(bug => (
                                <button
                                    key={bug.id}
                                    className="bug-target"
                                    style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
                                    onClick={() => handleBugTap(bug.id)}
                                >
                                    🐛
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
                        <h3>💨 ガス発生！</h3>
                        <p>田んぼから泡が出てきた！間断かん水でガスを抜こう。</p>
                        <div className="gas-bubbles">
                            <span className="bubble">○</span>
                            <span className="bubble">○</span>
                            <span className="bubble">○</span>
                        </div>
                        <Button variant="primary" onClick={handleGasDrain}>
                            間断かん水を行う
                        </Button>
                    </div>
                );
            case 'typhoon':
                return (
                    <div className="event-card event-typhoon">
                        <h3>🌀 台風接近！</h3>
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
                <p>📏 成長期を乗り越えよう！</p>
                <p className="hint">Day {day} / 20</p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="medium" stage={4} />
            </div>

            <div className="growth-field">
                <div className="igusa-rows" style={{ height: `${30 + (day - 9) * 5}%` }}>
                    🌿🌿🌿🌿🌿
                </div>
                <div
                    className="net-overlay"
                    style={{ bottom: `${netHeight * 10}%` }}
                >
                    ═══════════
                </div>
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
