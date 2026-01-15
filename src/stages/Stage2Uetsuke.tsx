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
    const [waterLevel, setWaterLevel] = useState(3); // 初期水位（0-4のレベル: 0=からから, 1=少なめ, 2=適水, 3=深水, 4=深すぎ）
    const [totalScore, setTotalScore] = useState(0);
    const [grid, setGrid] = useState<boolean[][]>(
        Array(5).fill(null).map(() => Array(5).fill(false))
    );
    const [isPlanting, setIsPlanting] = useState(true);
    const fieldCanvasRef = useRef<HTMLCanvasElement>(null);

    // ステージ内での経過日数 (1-3)
    const localDay = state.currentDay - 2;

    // 目標水位レベル（深水=3、適水=2）
    const targetWaterLevel = localDay === 1 ? 3 : 2; // Day1: 深水、Day2-3: 適水

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

    // 水位の自然変動（蒸発）は無効化
    // プレイヤーが自分で調整するゲーム性を重視

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
        setWaterLevel(prev => Math.min(4, prev + 1));
    };

    // 排水
    const handleDrainWater = () => {
        setWaterLevel(prev => Math.max(0, prev - 1));
    };

    const handleDayEnd = () => {
        let dayScore = 0;
        if (waterLevel === targetWaterLevel) {
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
        if (waterLevel === targetWaterLevel) {
            return 'success';
        }
        if (waterLevel === 0 || waterLevel === 4) {
            return 'danger';
        }
        return 'warning';
    };

    // 水位レベルの表示名を取得
    const getWaterLevelName = (level: number) => {
        switch (level) {
            case 0: return { name: 'からから', emoji: '🏜️' };
            case 1: return { name: '少なめ', emoji: '💧' };
            case 2: return { name: '適水', emoji: '💦' };
            case 3: return { name: '深水', emoji: '🌊' };
            case 4: return { name: '深すぎ', emoji: '🌊🌊' };
            default: return { name: '---', emoji: '' };
        }
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
                <p>{isPlanting ? <><ruby>苗<rt>なえ</rt></ruby>を<ruby>市松<rt>いちまつ</rt></ruby><ruby>模様<rt>もよう</rt></ruby>に<ruby>配置<rt>はいち</rt></ruby>しよう！</> : <><ruby>水位<rt>すいい</rt></ruby>を<ruby>管理<rt>かんり</rt></ruby>しよう！</>}</p>
                <p className="hint">
                    {isPlanting
                        ? <>タップで<ruby>苗<rt>なえ</rt></ruby>を<ruby>置<rt>お</rt></ruby>く/<ruby>取<rt>と</rt></ruby>り<ruby>除<rt>のぞ</rt></ruby>く</>
                        : localDay === 1
                            ? <><ruby>深水<rt>ふかみず</rt></ruby>で<ruby>苗<rt>なえ</rt></ruby>を<ruby>守<rt>まも</rt></ruby>ろう</>
                            : <><ruby>適水<rt>てきすい</rt></ruby>で<ruby>分<rt>ぶん</rt></ruby>げつを<ruby>促<rt>うなが</rt></ruby>そう</>
                    }
                </p>
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
                        <ruby>配置<rt>はいち</rt></ruby>した<ruby>苗<rt>なえ</rt></ruby>: {grid.flat().filter(Boolean).length}<ruby>株<rt>かぶ</rt></ruby>
                    </p>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handlePlantingComplete}
                        disabled={grid.flat().filter(Boolean).length < 5}
                    >
                        <span><ruby>配置<rt>はいち</rt></ruby><ruby>完了<rt>かんりょう</rt></ruby></span>
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
                                max={4}
                                label={<><ruby>水位<rt>すいい</rt></ruby></>}
                                showValue={false}
                                color={getWaterColor()}
                            />
                            <p className="water-level-display" style={{ textAlign: 'center', fontSize: '18px', margin: '8px 0' }}>
                                {getWaterLevelName(waterLevel).emoji} <ruby>{getWaterLevelName(waterLevel).name}<rt>{waterLevel === 2 ? 'てきすい' : waterLevel === 3 ? 'ふかみず' : ''}</rt></ruby>
                            </p>
                            <p className="target-info">
                                <ruby>目標<rt>もくひょう</rt></ruby>: {getWaterLevelName(targetWaterLevel).emoji} <ruby>{getWaterLevelName(targetWaterLevel).name}<rt>{targetWaterLevel === 2 ? 'てきすい' : 'ふかみず'}</rt></ruby>
                            </p>
                        </div>

                        <div className="water-controls">
                            <Button variant="secondary" onClick={handleDrainWater}>
                                <span>▼ <ruby>排水<rt>はいすい</rt></ruby></span>
                            </Button>
                            <Button variant="primary" onClick={handleAddWater}>
                                <span>▲ <ruby>給水<rt>きゅうすい</rt></ruby></span>
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="success"
                        fullWidth
                        onClick={handleDayEnd}
                    >
                        {localDay < 3 ? <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ</span> : <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む</span>}
                    </Button>
                </>
            )}
        </div>
    );
}
