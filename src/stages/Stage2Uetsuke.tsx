import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { IgusaChan } from '../components/character/IgusaChan';
import { getMoodByQP } from '../types/game';
import './stages.css';

interface StageProps {
    onComplete: (score: number) => void;
    onNextDay: () => void;
}

export function Stage2Uetsuke({ onComplete, onNextDay }: StageProps) {
    const { state, dispatch } = useGame();
    const [waterLevel, setWaterLevel] = useState(3.5); // 初期水位
    const [totalScore, setTotalScore] = useState(0);
    const [grid, setGrid] = useState<boolean[][]>(
        Array(5).fill(null).map(() => Array(5).fill(false))
    );
    const [isPlanting, setIsPlanting] = useState(true);
    const fieldCanvasRef = useRef<HTMLCanvasElement>(null);

    // ステージ内での経過日数 (1-3)
    const localDay = state.currentDay - 2;

    // 目標水位
    const targetWaterLevel = localDay === 1 ? { min: 3, max: 4 } : { min: 2, max: 3 };

    // 苗の位置を事前計算（変更しない）
    const seedlingPositions = useMemo(() => {
        return grid.map((row, ri) =>
            row.map((_, ci) => ({
                offsetX: (Math.random() - 0.5) * 6,
                offsetY: (Math.random() - 0.5) * 6,
                rotation: (Math.random() - 0.5) * 15,
                heightVariance: 0.8 + Math.random() * 0.4,
            }))
        );
    }, []); // 初期化時のみ

    // Canvas描画関数（横から見た視点）
    const drawField = useCallback(() => {
        const canvas = fieldCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // 空（上部60%）
        const skyGradient = ctx.createLinearGradient(0, 0, 0, rect.height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, rect.width, rect.height * 0.6);

        // 田んぼの土（下部40%）
        const groundY = rect.height * 0.6;
        const groundHeight = rect.height * 0.4;
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, groundY, rect.width, groundHeight);

        // 水面（田んぼ内で最大70%まで）
        const maxWaterHeight = groundHeight * 0.7;
        const waterHeight = (waterLevel / 6) * maxWaterHeight;
        const waterY = rect.height - waterHeight;

        // 水のグラデーション
        const waterGradient = ctx.createLinearGradient(0, waterY, 0, rect.height);
        waterGradient.addColorStop(0, 'rgba(33, 150, 243, 0.6)');
        waterGradient.addColorStop(1, 'rgba(21, 101, 192, 0.7)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, waterY, rect.width, waterHeight);

        // 苗を均一な高さで描画（地面から生える）
        const plantedCount = grid.flat().filter(Boolean).length;
        if (plantedCount > 0) {
            const seedlingHeight = 35; // 統一された高さ
            let idx = 0;

            grid.forEach((row, ri) => {
                row.forEach((cell, ci) => {
                    if (cell) {
                        const pos = seedlingPositions[ri][ci];
                        // 横に並べて表示
                        const spacing = rect.width / (plantedCount + 1);
                        const centerX = spacing * (idx + 1);
                        const baseY = rect.height; // 地面

                        // 苗を描画（3本の茎）
                        for (let s = 0; s < 3; s++) {
                            const stalkX = centerX + (s - 1) * 3 + pos.offsetX * 0.3;
                            const green = 100 + s * 30;
                            ctx.strokeStyle = `rgb(60, ${green}, 60)`;
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            ctx.moveTo(stalkX, baseY);
                            ctx.quadraticCurveTo(
                                stalkX + pos.rotation * 0.1,
                                baseY - seedlingHeight / 2,
                                stalkX + pos.rotation * 0.15,
                                baseY - seedlingHeight
                            );
                            ctx.stroke();
                        }
                        idx++;
                    }
                });
            });
        }

        // 水面の反射（光沢線）
        if (waterLevel > 0.5) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, waterY + 2);
            ctx.lineTo(rect.width, waterY + 2);
            ctx.stroke();
        }
    }, [grid, waterLevel, seedlingPositions]);

    // 水位の自然変動（蒸発）
    useEffect(() => {
        if (isPlanting) return;

        const interval = setInterval(() => {
            setWaterLevel(prev => Math.max(0, prev - 0.1));
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlanting]);

    // Canvas再描画
    useEffect(() => {
        if (!isPlanting) {
            drawField();
        }
    }, [isPlanting, drawField]);

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
            dispatch({ type: 'ADD_QP', amount: -10 });
        } else if (checkerScore >= 20) {
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
    const handleDayEnd = () => {
        let dayScore = 0;
        if (waterLevel >= targetWaterLevel.min && waterLevel <= targetWaterLevel.max) {
            dayScore = 5;
            dispatch({ type: 'ADD_QP', amount: 5 });
        } else {
            dayScore = -10;
            dispatch({ type: 'ADD_QP', amount: -10 });
        }
        setTotalScore(prev => prev + dayScore);

        if (state.currentDay < 5) {
            onNextDay();
        } else {
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

    // 苗グリッド用のCanvas描画
    const drawPlantingCanvas = useCallback((canvas: HTMLCanvasElement | null, row: number, col: number) => {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const pos = seedlingPositions[row][col];
        const centerX = rect.width / 2 + pos.offsetX;
        const centerY = rect.height / 2 + pos.offsetY;

        // 苗を描画（3本の茎）
        const stalkCount = 3;
        for (let s = 0; s < stalkCount; s++) {
            const stalkX = centerX + (s - 1) * 3;
            const h = 18 * pos.heightVariance;
            const green = 100 + s * 30;
            ctx.strokeStyle = `rgb(60, ${green}, 60)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(stalkX, rect.height * 0.7);
            ctx.quadraticCurveTo(
                stalkX + pos.rotation * 0.2,
                rect.height * 0.7 - h / 2,
                stalkX + pos.rotation * 0.3,
                rect.height * 0.7 - h
            );
            ctx.stroke();
        }
    }, [seedlingPositions]);

    return (
        <div className="stage-game stage-uetsuke">
            <div className="game-instruction">
                <p>{isPlanting ? '苗を市松模様に配置しよう！' : '水位を管理しよう！'}</p>
                <p className="hint">
                    {isPlanting
                        ? 'タップで苗を置く/取り除く'
                        : localDay === 1
                            ? '深水（3〜4cm）で苗を守ろう'
                            : '浅水（2〜3cm）で分げつを促そう'
                    }
                </p>
            </div>

            <div className="character-display">
                <IgusaChan mood={getMoodByQP(state.qualityPoints, 2)} size="small" stage={2} />
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
                                        {cell && (
                                            <canvas
                                                ref={(el) => el && drawPlantingCanvas(el, ri, ci)}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        )}
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
                        <div className="day-indicator">Day {localDay} / 3</div>

                        <div className="field-container">
                            <canvas ref={fieldCanvasRef} style={{ width: '100%', height: '100%' }} />
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
                                {localDay === 1 ? '（深水）' : '（浅水）'}
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
                        onClick={handleDayEnd}
                    >
                        {localDay < 3 ? '次の日へ' : '次の日へ進む'}
                    </Button>
                </>
            )}
        </div>
    );
}
