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

export function Stage2Uetsuke({ onComplete }: StageProps) {
    const { state, dispatch } = useGame();
    const [waterLevel, setWaterLevel] = useState(3.5); // 初期水位
    const [day, setDay] = useState(1); // 1-3日目
    const [totalScore, setTotalScore] = useState(0);
    const [grid, setGrid] = useState<boolean[][]>(
        Array(5).fill(null).map(() => Array(5).fill(false))
    );
    const [isPlanting, setIsPlanting] = useState(true);

    // 目標水位
    const targetWaterLevel = day === 1 ? { min: 3, max: 4 } : { min: 2, max: 3 };

    // 水位の自然変動（蒸発）
    useEffect(() => {
        if (isPlanting) return;

        const interval = setInterval(() => {
            setWaterLevel(prev => Math.max(0, prev - 0.1));
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlanting]);

    // 苗を配置
    const handlePlant = (row: number, col: number) => {
        if (!isPlanting) return;

        const newGrid = grid.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? !c : c))
        );
        setGrid(newGrid);
    };

    // 配置完了
    const handlePlantingComplete = () => {
        // 市松模様（チェッカー）チェック
        let checkerScore = 0;
        grid.forEach((row, ri) => {
            row.forEach((cell, ci) => {
                const expectedPattern = (ri + ci) % 2 === 0;
                if (cell === expectedPattern) {
                    checkerScore++;
                }
            });
        });

        const plantedCount = grid.flat().filter(Boolean).length;
        if (plantedCount < 10) {
            // 苗が少なすぎる
            dispatch({ type: 'ADD_QP', amount: -10 });
        } else if (checkerScore >= 20) {
            // ほぼ市松模様
            dispatch({ type: 'ADD_QP', amount: 10 });
            setTotalScore(prev => prev + 10);
        } else if (checkerScore >= 15) {
            dispatch({ type: 'ADD_QP', amount: 5 });
            setTotalScore(prev => prev + 5);
        }

        setIsPlanting(false);
    };

    // 給水
    const handleAddWater = () => {
        setWaterLevel(prev => Math.min(6, prev + 0.5));
    };

    // 排水
    const handleDrainWater = () => {
        setWaterLevel(prev => Math.max(0, prev - 0.5));
    };

    // 次の日へ
    const handleNextDay = () => {
        // 水位チェック
        let dayScore = 0;
        if (waterLevel >= targetWaterLevel.min && waterLevel <= targetWaterLevel.max) {
            dayScore = 5;
            dispatch({ type: 'ADD_QP', amount: 5 });
        } else {
            dayScore = -10;
            dispatch({ type: 'ADD_QP', amount: -10 });
        }
        setTotalScore(prev => prev + dayScore);

        if (day < 3) {
            setDay(day + 1);
        } else {
            // 完了
            onComplete(totalScore + dayScore);
        }
    };

    const getWaterColor = () => {
        if (waterLevel >= targetWaterLevel.min && waterLevel <= targetWaterLevel.max) {
            return 'success';
        }
        if (waterLevel < 1 || waterLevel > 5) {
            return 'danger';
        }
        return 'warning';
    };

    return (
        <div className="stage-game stage-uetsuke">
            <div className="game-instruction">
                <p>🌿 {isPlanting ? '苗を市松模様に配置しよう！' : '水位を管理しよう！'}</p>
                <p className="hint">
                    {isPlanting
                        ? 'タップで苗を置く/取り除く'
                        : day === 1
                            ? '深水（3〜4cm）で苗を守ろう'
                            : '浅水（2〜3cm）で分げつを促そう'
                    }
                </p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="small" stage={2} />
            </div>

            {isPlanting ? (
                <>
                    <div className="planting-grid">
                        {grid.map((row, ri) => (
                            <div key={ri} className="grid-row">
                                {row.map((cell, ci) => (
                                    <button
                                        key={ci}
                                        className={`grid-cell ${cell ? 'planted' : ''}`}
                                        onClick={() => handlePlant(ri, ci)}
                                    >
                                        {cell ? '🌱' : ''}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                    <p className="plant-count">
                        配置した苗: {grid.flat().filter(Boolean).length}株
                    </p>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handlePlantingComplete}
                        disabled={grid.flat().filter(Boolean).length < 5}
                    >
                        配置完了
                    </Button>
                </>
            ) : (
                <>
                    <div className="water-management">
                        <div className="day-indicator">Day {day} / 3</div>

                        <div className="field-container">
                            <div
                                className="water-surface"
                                style={{ height: `${(waterLevel / 6) * 100}%` }}
                            />
                            <div className="planted-seedlings">
                                {grid.flat().filter(Boolean).map((_, i) => (
                                    <span key={i} className="field-seedling">🌱</span>
                                ))}
                            </div>
                        </div>

                        <div className="water-gauge">
                            <ProgressBar
                                value={waterLevel}
                                max={6}
                                label="水位"
                                showValue
                                color={getWaterColor()}
                            />
                            <p className="target-info">
                                目標: {targetWaterLevel.min}〜{targetWaterLevel.max}cm
                                {day === 1 ? '（深水）' : '（浅水）'}
                            </p>
                        </div>

                        <div className="water-controls">
                            <Button variant="secondary" onClick={handleDrainWater}>
                                ▼ 排水
                            </Button>
                            <Button variant="primary" onClick={handleAddWater}>
                                ▲ 給水
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="success"
                        fullWidth
                        onClick={handleNextDay}
                    >
                        {day < 3 ? '次の日へ' : 'ステージ完了'}
                    </Button>
                </>
            )}
        </div>
    );
}
