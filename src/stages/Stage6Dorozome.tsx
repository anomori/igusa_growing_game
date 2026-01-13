import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/common/Button';
import './stages.css';

interface StageProps {
    onNextDay: () => void;
    onComplete: (score: number) => void;
}

// い草束の状態
type BundleState = 'waiting' | 'dipping' | 'lifting' | 'completed';
type ResultType = 'perfect' | 'good' | 'bad' | null;

export function Stage6Dorozome({ onComplete }: StageProps) {
    const { dispatch } = useGame();

    // ゲーム状態
    const [bundleIndex, setBundleIndex] = useState(0); // 0-9
    const [bundleState, setBundleState] = useState<BundleState>('waiting');
    const [results, setResults] = useState<ResultType[]>([]);

    // ステージフェーズ
    const [phase, setPhase] = useState<'dyeing' | 'drying'>('dyeing');

    // Canvas用アニメーション状態
    const [bundleY, setBundleY] = useState(0); // 0(上) - 100(下)
    const [mudColorRatio, setMudColorRatio] = useState(0); // 0(緑) - 1(泥色)
    const [isPressing, setIsPressing] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);

    // 乾燥フェーズ状態
    const [dryingTemp, setDryingTemp] = useState(65);
    const [dryingTime, setDryingTime] = useState(0); // 0 - 14 (hours)
    const [dryingMessage, setDryingMessage] = useState('');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dipStartTimeRef = useRef<number | null>(null);
    const totalBundles = 10;
    const waterLevelY = 200; // 水面のY座標 (Canvas座標系)

    // ループアニメーション (泥染め用)
    useEffect(() => {
        if (phase !== 'dyeing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let waveOffset = 0;

        const render = () => {
            // Canvasサイズ設定
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;

            // 背景クリア
            ctx.clearRect(0, 0, width, height);

            // 1. 泥水プール描画
            ctx.fillStyle = '#795548'; // 泥色
            ctx.beginPath();

            // 水面の波
            ctx.moveTo(0, waterLevelY);
            for (let x = 0; x <= width; x += 10) {
                const y = waterLevelY + Math.sin(x * 0.02 + waveOffset) * 5;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();

            // 2. い草束描画
            const startX = width / 2;
            const startY = 40 + bundleY; // 基準位置

            // 色の計算 (緑 -> 泥色)
            // 緑: rgb(100, 180, 100)
            // 泥色: rgb(120, 100, 80)
            const r = 100 + (120 - 100) * mudColorRatio;
            const g = 180 + (100 - 180) * mudColorRatio;
            const b = 100 + (80 - 100) * mudColorRatio;
            const color = `rgb(${r}, ${g}, ${b})`;

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            // 束を描画
            const bundleWidth = 40;
            const bundleLength = 100;
            const now = Date.now();

            for (let i = -5; i <= 5; i++) {
                const offsetX = i * 4;
                const curve = Math.sin(now * 0.005 + i) * 2; // 微妙な揺れ

                ctx.beginPath();
                ctx.moveTo(startX + offsetX, startY - 20); // 持ち手
                ctx.quadraticCurveTo(
                    startX + offsetX + curve,
                    startY + bundleLength / 2,
                    startX + offsetX + curve * 2,
                    startY + bundleLength
                );
                ctx.stroke();
            }

            // 束ねている紐
            ctx.fillStyle = '#D7CCC8';
            ctx.fillRect(startX - 22, startY - 15, 44, 10);

            // 3. 水しぶき/波紋 (浸かっている時)
            if (startY + bundleLength > waterLevelY) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(startX, waterLevelY, 30 + Math.sin(now * 0.1) * 5, 5 + Math.sin(now * 0.1) * 2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            waveOffset += 0.1;
            animationId = requestAnimationFrame(render);
        };

        const now = Date.now();
        render();

        return () => cancelAnimationFrame(animationId);
    }, [phase, bundleY, mudColorRatio]);

    // 物理演算っぽい動き (アニメーションループとは別に更新)
    useEffect(() => {
        if (phase !== 'dyeing') return;

        let interval: number;

        if (bundleState === 'dipping') {
            // 下降 (素早く)
            interval = window.setInterval(() => {
                setBundleY(prev => Math.min(200, prev + 15));
            }, 16);
        } else if (bundleState === 'lifting') {
            // 上昇 (素早く)
            interval = window.setInterval(() => {
                setBundleY(prev => Math.max(0, prev - 15));
            }, 16);

            // 上がりきったら完了判定
            if (bundleY <= 5) {
                setBundleState('completed');
                handleNextBundle();
            }
        } else if (bundleState === 'waiting') {
            // 初期位置
            setBundleY(0);
            setMudColorRatio(0);
        }

        return () => clearInterval(interval);
    }, [phase, bundleState, bundleY]);

    // 泥付き具合の変化
    useEffect(() => {
        if (phase !== 'dyeing') return;
        if (bundleState === 'dipping' && bundleY > 100) {
            // 浸かっていると徐々に色がつく
            setMudColorRatio(prev => Math.min(1, prev + 0.05));
        }
    }, [phase, bundleState, bundleY]);

    // 乾燥フェーズのシミュレーション
    useEffect(() => {
        if (phase !== 'drying') return;

        const interval = setInterval(() => {
            setDryingTime(prev => {
                const nextTime = prev + 0.2; // 0.2時間刻みで進める

                // 整数時間をまたいだら評価 (例: 1.0 -> 1.2 のタイミングでは遅れるので、floor値が変わったらか prev < integer <= nextTime)
                // ここではシンプルに、0.2刻みなので、整数に近いときに評価
                // 1.0, 2.0, ... 14.0
                if (Math.floor(prev) < Math.floor(nextTime) && nextTime <= 14) {
                    evaluateDrying(Math.floor(nextTime), dryingTemp);
                }

                // 終了判定 (14時間)
                if (nextTime >= 14) {
                    finishDryingStage();
                    return 14;
                }
                return nextTime;
            });

            // 温度変動 (自然に少し下がる & ランダム変動)
            setDryingTemp(prev => {
                const change = Math.random() * 2 - 1.5; // -1.5 ~ +0.5 (下がりやすい)
                return Math.max(40, Math.min(90, prev + change));
            });

        }, 500); // 0.5秒ごとに更新

        return () => clearInterval(interval);
    }, [phase, dryingTemp]); // dryingTimeはsetDryingTime内で使うため依存不要だが、evaluateでdryingTempが必要

    const evaluateDrying = (hour: number, temp: number) => {
        let idealTempMin = 0;
        let idealTempMax = 0;

        // 初期(0~7h): 70度
        // 後半(7h~): 55-60度
        if (hour <= 7) {
            idealTempMin = 68;
            idealTempMax = 72;
        } else {
            idealTempMin = 55;
            idealTempMax = 60;
        }

        let score = 0;
        let message = '';

        if (temp >= idealTempMin && temp <= idealTempMax) {
            score = 3;
            message = 'Perfect!';
        } else if (temp >= idealTempMin - 5 && temp <= idealTempMax + 5) {
            score = 1;
            message = 'Good';
        } else {
            score = -2;
            message = temp > idealTempMax ? '暑すぎ！🥵' : '寒すぎ！🥶';
        }

        if (score !== 0) {
            dispatch({ type: 'ADD_QP', amount: score });
            setDryingMessage(`${message} (${score > 0 ? '+' : ''}${score} QP)`);
            // 数秒後にメッセージを消すなどの処理はいったん省略（次々に更新されるため）
        }
    };

    const finishDryingStage = () => {
        setDryingMessage('乾燥完了！');

        // 最終的な合計スコアを計算（結果画面用）
        // 注: QPは既に加算されているので、ここではonCompleteに渡す表示用スコアを計算
        // (厳密にはonCompleteの引数は「ステージスコア」として使われるが、
        // 既存の泥染めスコア + 乾燥評価の合計としたい)
        // しかし、resultsには泥染めの結果しか入っていない。
        // 乾燥のスコア履歴がないため、ここでは泥染めスコアのみ渡すか、
        // あるいはonCompleteの引数をあまり気にしない（QPは直接増えているので）

        const mudScore = results.filter(r => r === 'perfect').length * 3 + results.filter(r => r === 'good').length;
        // 乾燥分は履歴がないが、だいたい Perfect 14回 * 3 = 42点くらい

        setTimeout(() => {
            // ステージクリア時のスコア表示用。QPは既に反映済み。
            onComplete(mudScore);
        }, 2000);
    };

    // 操作ハンドラ
    const handlePressStart = () => {
        if (phase !== 'dyeing' || bundleState !== 'waiting' || bundleIndex >= totalBundles) return;
        setBundleState('dipping');
        setFeedback(null); // 次のアクションで消す
        dipStartTimeRef.current = Date.now();
        setIsPressing(true);
    };

    const handlePressEnd = () => {
        if (phase !== 'dyeing' || bundleState !== 'dipping') return;
        setIsPressing(false);
        setBundleState('lifting');

        const dipTime = Date.now() - (dipStartTimeRef.current || 0);
        evaluateDip(dipTime);
    };

    // 評価ロジック
    const evaluateDip = (timeMs: number) => {
        // 理想: 1000ms - 2000ms
        let result: ResultType = 'bad';
        let score = 0;
        let text = '';
        let color = '';

        if (timeMs >= 800 && timeMs <= 1800) {
            result = 'perfect';
            score = 3;
            text = 'Perfect!!';
            color = '#5D4037'; // 濃い茶色
        } else if (timeMs >= 400 && timeMs <= 2500) {
            result = 'good';
            score = 1;
            text = 'Good!';
            color = '#8D6E63'; // 茶色
        } else {
            result = 'bad';
            score = -1;
            text = 'Bad...';
            color = '#BCAAA4'; // 薄い茶色
        }

        // QP反映
        dispatch({ type: 'ADD_QP', amount: score });

        // 結果保存
        const newResults = [...results, result];
        setResults(newResults);

        // フィードバック表示（setTimeout削除して維持）
        setFeedback({ text, color });
    };

    // 次の束へ移行
    const handleNextBundle = () => {
        setTimeout(() => {
            if (bundleIndex + 1 >= totalBundles) {
                // 泥染め完了 -> 乾燥フェーズへ
                setPhase('drying');
                setDryingTemp(65); // 開始温度
            } else {
                setBundleIndex(prev => prev + 1);
                setBundleState('waiting');
            }
        }, 800);
    };

    const adjustTemp = (amount: number) => {
        setDryingTemp(prev => prev + amount);
    };

    const isEarlyPhase = dryingTime < 7;
    const targetMin = isEarlyPhase ? 68 : 55;
    const targetMax = isEarlyPhase ? 72 : 60;
    const isTempGood = dryingTemp >= targetMin && dryingTemp <= targetMax;

    return (
        <div className="stage-game stage-dorozome">
            {phase === 'dyeing' ? (
                <>
                    <div className="game-instruction">
                        <p>🎨 <ruby>泥染<rt>どろぞ</rt></ruby>め: ボタン<ruby>長<rt>なが</rt></ruby><ruby>押<rt>お</rt></ruby>しで<ruby>泥<rt>どろ</rt></ruby>に<ruby>漬<rt>つ</rt></ruby>けよう！</p>
                        <p className="hint">10<ruby>束<rt>たば</rt></ruby>すべてを<ruby>適切<rt>てきせつ</rt></ruby>な<ruby>時間<rt>じかん</rt></ruby>（<ruby>約<rt>やく</rt></ruby>1<ruby>秒<rt>びょう</rt></ruby>）<ruby>漬<rt>つ</rt></ruby>けて<ruby>引<rt>ひ</rt></ruby>き<ruby>上<rt>あ</rt></ruby>げよう</p>
                    </div>

                    <div className="status-panel">
                        <span><ruby>残<rt>のこ</rt></ruby>り: {totalBundles - bundleIndex}<ruby>束<rt>たば</rt></ruby></span>
                        <span>スコア: {results.filter(r => r === 'perfect').length * 3 + results.filter(r => r === 'good').length}</span>
                    </div>

                    <div className="canvas-container">
                        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

                        {feedback && (
                            <div
                                className="dip-feedback show"
                                style={{ color: feedback.color, fontWeight: 'bold', fontSize: '24px', textShadow: '2px 2px 0px #fff' }}
                            >
                                {feedback.text}
                            </div>
                        )}
                    </div>

                    <div className="controls">
                        <button
                            className="dip-button"
                            onPointerDown={handlePressStart}
                            onPointerUp={handlePressEnd}
                            onPointerLeave={handlePressEnd} // マウスが外れた時も離したとみなす
                            onContextMenu={(e) => e.preventDefault()} // 右クリック無効
                            style={{ transform: isPressing ? 'scale(0.95)' : 'scale(1)' }}
                        >
                            👇
                            <span><ruby>漬<rt>つ</rt></ruby>ける</span>
                        </button>
                    </div>

                    <div className="results-preview" style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
                        {Array.from({ length: totalBundles }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: i < results.length
                                        ? (results[i] === 'perfect' ? '#5D4037' : results[i] === 'good' ? '#8D6E63' : '#D7CCC8')
                                        : '#ccc',
                                    border: i < results.length ? '1px solid rgba(0,0,0,0.1)' : 'none'
                                }}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="drying-phase" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="phase-indicator" style={{
                        background: isEarlyPhase ? '#FF9800' : '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {isEarlyPhase ? '🔥 乾燥初期 (高温)' : '🍃 乾燥後半 (低温)'}
                    </div>

                    <div className="game-instruction">
                        <p>温度を<span style={{ color: isEarlyPhase ? '#FF5722' : '#2E7D32', fontWeight: 'bold' }}>
                            {targetMin}〜{targetMax}℃
                        </span>にキープして！</p>
                    </div>

                    <div className="status-panel">
                        <span>🕒 <ruby>経過<rt>けいか</rt></ruby>: {Math.floor(dryingTime)}<ruby>時間<rt>じかん</rt></ruby> / 14<ruby>時間<rt>じかん</rt></ruby></span>
                    </div>

                    <div className="temperature-gauge-container" style={{ position: 'relative', width: '140px', margin: '20px auto' }}>
                        {/* Gauge Body */}
                        <div className="temperature-gauge" style={{
                            width: '100%',
                            height: '240px',
                            background: '#f0f0f0',
                            borderRadius: '10px',
                            border: '4px solid #555',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                        }}>
                            {/* Tick Marks */}
                            {[40, 60, 80, 100].map(tick => (
                                <div key={tick} style={{
                                    position: 'absolute',
                                    bottom: `${(tick - 20) * 1.5}%`,
                                    left: 0,
                                    width: '100%',
                                    borderBottom: '1px solid #ccc',
                                    fontSize: '12px',
                                    color: '#999',
                                    paddingLeft: '4px'
                                }}>
                                    {tick}
                                </div>
                            ))}

                            {/* Target Zone Highlight */}
                            <div style={{
                                position: 'absolute',
                                bottom: `${(targetMin - 20) * 1.5}%`,
                                height: `${(targetMax - targetMin) * 1.5}%`,
                                width: '100%',
                                background: 'rgba(76, 175, 80, 0.3)',
                                borderTop: '2px dashed #4CAF50',
                                borderBottom: '2px dashed #4CAF50',
                                zIndex: 1,
                                transition: 'all 0.5s ease'
                            }} />

                            {/* Current Temp Bar */}
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                width: '100%',
                                height: `${Math.min(100, Math.max(0, (dryingTemp - 20) * 1.5))}%`,
                                background: isTempGood ? '#4CAF50' : (dryingTemp > targetMax ? '#f44336' : '#2196f3'),
                                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                                opacity: 0.8,
                                zIndex: 2
                            }} />

                            {/* Current Temp Value */}
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                textAlign: 'center',
                                bottom: '10px',
                                fontWeight: 'bold',
                                fontSize: '28px',
                                color: '#333',
                                textShadow: '0 0 4px rgba(255,255,255,0.9)',
                                zIndex: 3
                            }}>
                                {Math.round(dryingTemp)}℃
                            </div>
                        </div>
                    </div>

                    <div className="temp-controls" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Button
                            variant="secondary"
                            onClick={() => adjustTemp(-3)}
                            disabled={dryingTime >= 14}
                            style={{ minWidth: '100px' }}
                        >
                            ❄️ 下げる
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => adjustTemp(3)}
                            disabled={dryingTime >= 14}
                            style={{ minWidth: '100px' }}
                        >
                            🔥 上げる
                        </Button>
                    </div>

                    {dryingMessage && (
                        <div className="result-message" style={{
                            marginTop: '16px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: dryingMessage.includes('Perfect') ? '#4CAF50' : (dryingMessage.includes('Good') ? '#FF9800' : '#f44336'),
                            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            {dryingMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
