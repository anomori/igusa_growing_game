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

type Phase = 'dyeing' | 'drying';

export function Stage6Dorozome({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [phase, setPhase] = useState<Phase>('dyeing');
    const [mudLevel, setMudLevel] = useState(0);
    const [isPressing, setIsPressing] = useState(false);
    const [temperature, setTemperature] = useState(65);
    const [dryingTime, setDryingTime] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const targetMudLevel = 50;
    const targetTempMin = 60;
    const targetTempMax = 70;
    const targetDryingTime = 15;

    // 泥を注ぐ
    useEffect(() => {
        if (phase !== 'dyeing' || !isPressing) return;

        const interval = setInterval(() => {
            setMudLevel(prev => Math.min(100, prev + 2));
        }, 100);

        return () => clearInterval(interval);
    }, [phase, isPressing]);

    // 温度の自然変動
    useEffect(() => {
        if (phase !== 'drying') return;

        const interval = setInterval(() => {
            setTemperature(prev => {
                // 温度は上がりやすい
                const change = (Math.random() - 0.3) * 2;
                return Math.min(80, Math.max(50, prev + change));
            });
        }, 500);

        return () => clearInterval(interval);
    }, [phase]);

    // 乾燥時間カウント
    useEffect(() => {
        if (phase !== 'drying') return;

        const interval = setInterval(() => {
            setDryingTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [phase]);

    // 泥染め完了
    const handleDyeComplete = () => {
        const diff = Math.abs(mudLevel - targetMudLevel);
        let score = 0;

        if (diff <= 5) {
            score = 5;
        } else if (diff <= 10) {
            score = 2;
        } else {
            score = -10;
        }

        dispatch({ type: 'ADD_QP', amount: score });
        setTotalScore(prev => prev + Math.max(0, score));
        setPhase('drying');
    };

    // 温度調整
    const handleTempUp = () => setTemperature(prev => Math.min(80, prev + 3));
    const handleTempDown = () => setTemperature(prev => Math.max(50, prev - 3));

    // 乾燥完了
    const handleDryComplete = () => {
        let score = 0;
        const tempOk = temperature >= targetTempMin && temperature <= targetTempMax;
        const timeOk = dryingTime >= targetDryingTime;

        if (tempOk && timeOk) {
            score = 5;
        } else if (tempOk || timeOk) {
            score = 2;
        } else {
            score = -15;
        }

        dispatch({ type: 'ADD_QP', amount: score });
        setTotalScore(prev => prev + Math.max(0, score));
        onComplete(totalScore + Math.max(0, score));
    };

    const getMudColor = () => {
        const diff = Math.abs(mudLevel - targetMudLevel);
        if (diff <= 5) return 'success';
        if (diff <= 10) return 'warning';
        return 'danger';
    };

    const getTempColor = () => {
        if (temperature >= targetTempMin && temperature <= targetTempMax) return 'success';
        if (temperature < 55 || temperature > 75) return 'danger';
        return 'warning';
    };

    return (
        <div className="stage-game stage-dorozome">
            <div className="game-instruction">
                <p>🎨 {phase === 'dyeing' ? '泥染めをしよう！' : '乾燥させよう！'}</p>
                <p className="hint">
                    {phase === 'dyeing'
                        ? '染土を目標ラインまで注ごう'
                        : '60〜70℃を維持しよう'
                    }
                </p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={6} />
            </div>

            {phase === 'dyeing' ? (
                <div className="dyeing-phase">
                    <div className="mud-container">
                        <div className="mud-vessel">
                            <div
                                className="mud-fill"
                                style={{ height: `${mudLevel}%` }}
                            />
                            <div
                                className="target-line"
                                style={{ bottom: `${targetMudLevel}%` }}
                            >
                                ← 目標
                            </div>
                        </div>
                    </div>

                    <ProgressBar
                        value={mudLevel}
                        max={100}
                        label="染土量"
                        showValue
                        color={getMudColor()}
                    />

                    <div className="dyeing-controls">
                        <Button
                            variant="secondary"
                            size="large"
                            onMouseDown={() => setIsPressing(true)}
                            onMouseUp={() => setIsPressing(false)}
                            onMouseLeave={() => setIsPressing(false)}
                            onTouchStart={() => setIsPressing(true)}
                            onTouchEnd={() => setIsPressing(false)}
                        >
                            {isPressing ? '注いでいる...' : '▼ 押して注ぐ'}
                        </Button>
                    </div>

                    <Button
                        variant="success"
                        fullWidth
                        onClick={handleDyeComplete}
                    >
                        ■ ストップ！
                    </Button>
                </div>
            ) : (
                <div className="drying-phase">
                    <div className="temperature-display">
                        <div className="thermometer">
                            <div
                                className="temp-fill"
                                style={{
                                    height: `${((temperature - 50) / 30) * 100}%`,
                                    background: temperature >= 60 && temperature <= 70
                                        ? 'linear-gradient(to top, #4CAF50, #81C784)'
                                        : temperature > 70
                                            ? 'linear-gradient(to top, #FF9800, #F44336)'
                                            : 'linear-gradient(to top, #2196F3, #03A9F4)'
                                }}
                            />
                        </div>
                        <span className="temp-value">{Math.round(temperature)}℃</span>
                    </div>

                    <div className="temp-target">
                        目標ゾーン: 60〜70℃
                    </div>

                    <ProgressBar
                        value={dryingTime}
                        max={targetDryingTime}
                        label="乾燥時間"
                        showValue
                        color={dryingTime >= targetDryingTime ? 'success' : 'primary'}
                    />

                    <div className="drying-controls">
                        <Button variant="primary" onClick={handleTempDown}>
                            ▼ 下げる
                        </Button>
                        <Button variant="danger" onClick={handleTempUp}>
                            ▲ 上げる
                        </Button>
                    </div>

                    <Button
                        variant="success"
                        fullWidth
                        onClick={handleDryComplete}
                        disabled={dryingTime < 10}
                    >
                        乾燥完了 ({dryingTime}/{targetDryingTime}秒)
                    </Button>
                </div>
            )}

            <div className="game-progress">
                <p>累計スコア: {totalScore} QP</p>
            </div>
        </div>
    );
}
