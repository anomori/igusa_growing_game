import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
}

interface FlyingIgusa {
    id: number;
    x: number;
    y: number;
    isGood: boolean;
    isCut: boolean;
}

type TimeOfDay = 'morning' | 'noon' | 'evening';

export function Stage5Shukaku({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
    const [igusas, setIgusas] = useState<FlyingIgusa[]>([]);
    const [waterLevel, setWaterLevel] = useState(100);
    const [score, setScore] = useState(0);
    const [cutCount, setCutCount] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [gameTime, setGameTime] = useState(30);

    const targetCount = 50;

    // 時間帯選択
    const handleTimeSelect = (time: TimeOfDay) => {
        setTimeOfDay(time);

        let qpChange = 0;
        if (time === 'morning' || time === 'evening') {
            qpChange = 10;
        } else {
            qpChange = -15;
        }

        dispatch({ type: 'ADD_QP', amount: qpChange });
        setScore(prev => prev + Math.max(0, qpChange));
        setGameActive(true);
    };

    // い草を生成
    useEffect(() => {
        if (!gameActive) return;

        const interval = setInterval(() => {
            if (igusas.length < 8) {
                const newIgusa: FlyingIgusa = {
                    id: Date.now() + Math.random(),
                    x: 10 + Math.random() * 80,
                    y: 100,
                    isGood: Math.random() > 0.2, // 80%が良品
                    isCut: false,
                };
                setIgusas(prev => [...prev, newIgusa]);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [gameActive, igusas.length]);

    // い草を上に移動
    useEffect(() => {
        if (!gameActive) return;

        const interval = setInterval(() => {
            setIgusas(prev =>
                prev
                    .map(ig => ({ ...ig, y: ig.y - 2 }))
                    .filter(ig => ig.y > -10 && !ig.isCut)
            );

            // 水かけゲージ減少
            setWaterLevel(prev => Math.max(0, prev - 0.5));
        }, 50);

        return () => clearInterval(interval);
    }, [gameActive]);

    // ゲーム時間カウントダウン
    useEffect(() => {
        if (!gameActive || gameTime <= 0) return;

        const interval = setInterval(() => {
            setGameTime(prev => {
                if (prev <= 1) {
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameActive, gameTime]);

    // い草をカット
    const handleCut = useCallback((igusa: FlyingIgusa) => {
        if (!gameActive) return;

        setIgusas(prev => prev.filter(ig => ig.id !== igusa.id));

        if (igusa.isGood) {
            // 良いい草
            const qp = 2;
            dispatch({ type: 'ADD_QP', amount: qp });
            setScore(prev => prev + qp);
            setCutCount(prev => prev + 1);
            setComboCount(prev => {
                const newCombo = prev + 1;
                setMaxCombo(m => Math.max(m, newCombo));
                return newCombo;
            });
        } else {
            // 傷んだい草
            dispatch({ type: 'ADD_QP', amount: -5 });
            setScore(prev => prev - 5);
            setComboCount(0);
        }
    }, [gameActive, dispatch]);

    // 水かけ
    const handleWater = () => {
        setWaterLevel(prev => Math.min(100, prev + 30));
    };

    const isComplete = !gameActive && timeOfDay !== null;

    return (
        <div className="stage-game stage-shukaku">
            <div className="game-instruction">
                <p>🌾 い草を刈り取ろう！</p>
                {!timeOfDay ? (
                    <p className="hint">まず収穫する時間帯を選ぼう</p>
                ) : (
                    <p className="hint">青いい草をタップ！赤は避けて</p>
                )}
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={5} />
            </div>

            {!timeOfDay ? (
                <div className="time-selection">
                    <h3>【時間帯を選んでください】</h3>
                    <div className="time-options">
                        <button className="time-option" onClick={() => handleTimeSelect('morning')}>
                            <span className="time-icon">🌅</span>
                            <span className="time-label">早朝</span>
                            <span className="time-bonus">+10 QP</span>
                        </button>
                        <button className="time-option noon" onClick={() => handleTimeSelect('noon')}>
                            <span className="time-icon">🌞</span>
                            <span className="time-label">昼間</span>
                            <span className="time-penalty">-15 QP</span>
                        </button>
                        <button className="time-option" onClick={() => handleTimeSelect('evening')}>
                            <span className="time-icon">🌇</span>
                            <span className="time-label">夕方</span>
                            <span className="time-bonus">+10 QP</span>
                        </button>
                    </div>
                </div>
            ) : gameActive ? (
                <>
                    <div className="harvest-header">
                        <span>⏱️ {gameTime}秒</span>
                        <span>🌾 {cutCount}</span>
                        <span>🔥 {comboCount}コンボ</span>
                    </div>

                    <div className="harvest-field">
                        {igusas.map(igusa => (
                            <button
                                key={igusa.id}
                                className={`flying-igusa ${igusa.isGood ? 'good' : 'bad'}`}
                                style={{ left: `${igusa.x}%`, bottom: `${igusa.y}%` }}
                                onClick={() => handleCut(igusa)}
                            >
                                {igusa.isGood ? '🌾' : '🥀'}
                            </button>
                        ))}
                    </div>

                    <div className="water-gauge-area">
                        <ProgressBar
                            value={waterLevel}
                            max={100}
                            label="💧 水かけ"
                            color={waterLevel < 30 ? 'danger' : waterLevel < 60 ? 'warning' : 'primary'}
                        />
                        <Button variant="primary" size="small" onClick={handleWater}>
                            水をかける
                        </Button>
                    </div>
                </>
            ) : (
                <div className="stage-complete">
                    <p className="complete-message">🎉 収穫完了！</p>
                    <p>刈り取り: {cutCount}本</p>
                    <p>最大コンボ: {maxCombo}</p>
                    <p>スコア: {score} QP</p>
                    {maxCombo >= 50 && (
                        <p className="badge-earned">🏆 「収穫マスター」バッジ獲得！</p>
                    )}
                    <Button variant="success" fullWidth onClick={() => onComplete(score)}>
                        ☀️ 次の日へ進む
                    </Button>
                </div>
            )}
        </div>
    );
}
