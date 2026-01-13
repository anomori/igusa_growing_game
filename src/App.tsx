import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StatusBar } from './components/layout/StatusBar';
import { StageProgress } from './components/layout/StageProgress';
import { IgusaChan } from './components/character/IgusaChan';
import { QuizModal } from './components/quiz/QuizModal';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { Stage1Kabuwake } from './stages/Stage1Kabuwake';
import { Stage2Uetsuke } from './stages/Stage2Uetsuke';
import { Stage3Sakigari } from './stages/Stage3Sakigari';
import { Stage4Seicho } from './stages/Stage4Seicho';
import { Stage5Shukaku } from './stages/Stage5Shukaku';
import { Stage6Dorozome } from './stages/Stage6Dorozome';
import { Stage7Seishoku } from './stages/Stage7Seishoku';
import { Stage8Kensa } from './stages/Stage8Kensa';
import { TitleVisual } from './components/title/TitleVisual';
import { StatusIcon } from './components/common/StatusIcon';
import { BadgeIcon } from './components/common/BadgeIcon';
import { getMoodByQP, getStageByDay, getFinalRank, getNextStageStartDay, STAGES } from './types/game';
import { getQuizForStage, resetUsedQuizzes } from './data/quizData';
import { getHintForStage } from './data/hintsData';
import { clearGameState } from './utils/storage';
import { FuriganaText } from './components/common/FuriganaText';
import { DEBUG_MODE } from './utils/debug';
import './App.css';

type GameScreen = 'title' | 'game' | 'results';

function GameContent() {
    const { state, dispatch } = useGame();
    const [screen, setScreen] = useState<GameScreen>('title');
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(getQuizForStage(0));
    const [showHint, setShowHint] = useState(false);
    const [stageCompleted, setStageCompleted] = useState(false);
    const [previousStage, setPreviousStage] = useState(state.currentStage);
    const [showDebugPanel, setShowDebugPanel] = useState(false);

    const currentStageInfo = getStageByDay(state.currentDay);
    const stageIndex = STAGES.findIndex(s => s.type === state.currentStage);

    // ステージ変更時にクイズを出題
    useEffect(() => {
        if (state.currentStage !== previousStage && screen === 'game') {
            // 新しいステージに入った
            const newStageIndex = STAGES.findIndex(s => s.type === state.currentStage);
            setCurrentQuiz(getQuizForStage(newStageIndex));
            setShowQuiz(true);
            setPreviousStage(state.currentStage);
        }
    }, [state.currentStage, previousStage, screen]);

    const [showFurigana, setShowFurigana] = useState(() => {
        const saved = localStorage.getItem('igusa_game_furigana');
        return saved !== null ? saved === 'true' : false;
    });

    // フリガナの表示切り替え
    useEffect(() => {
        localStorage.setItem('igusa_game_furigana', String(showFurigana));
        if (showFurigana) {
            document.body.classList.remove('no-furigana');
        } else {
            document.body.classList.add('no-furigana');
        }
    }, [showFurigana]);

    // ゲーム開始
    const handleStartGame = () => {
        clearGameState(); // 保存データをクリア
        resetUsedQuizzes(); // クイズ履歴をリセット
        dispatch({ type: 'START_GAME' });
        setScreen('game');
        setShowHint(true);
        setPreviousStage('kabuwake');
    };

    // ゲーム継続
    const handleContinueGame = () => {
        setScreen('game');
    };

    // 次の日へ
    const handleNextDay = () => {
        const currentStage = state.currentStage;
        dispatch({ type: 'NEXT_DAY' });

        // ステージが変わるかチェック
        const nextDay = Math.min(state.currentDay + 1, 30);
        const nextStageInfo = getStageByDay(nextDay);

        if (nextStageInfo.type !== currentStage) {
            // 新ステージに入る前にクイズ
            setCurrentQuiz(getQuizForStage(STAGES.findIndex(s => s.type === nextStageInfo.type)));
        }

        setStageCompleted(false);
    };

    // ステージ完了
    const handleStageComplete = (score: number) => {
        dispatch({
            type: 'COMPLETE_STAGE',
            stage: state.currentStage,
            score
        });

        // 最終ステージの場合は結果画面へ
        if (state.currentStage === 'kensa') {
            setScreen('results');
        } else {
            // 次のステージの開始日までスキップ
            const nextStartDay = getNextStageStartDay(state.currentStage);
            const targetDay = nextStartDay > state.currentDay ? nextStartDay : state.currentDay + 1;

            dispatch({ type: 'JUMP_TO_DAY', day: targetDay });

            const nextStageInfo = getStageByDay(targetDay);
            if (nextStageInfo.type !== state.currentStage) {
                // クイズ更新
                const nextStageIdx = STAGES.findIndex(s => s.type === nextStageInfo.type);
                if (nextStageIdx !== -1) {
                    setCurrentQuiz(getQuizForStage(nextStageIdx));
                }
            }

            setStageCompleted(false);
        }
    };

    // クイズ回答
    const handleQuizAnswer = (correct: boolean) => {
        dispatch({ type: 'ANSWER_QUIZ', correct });
        setShowQuiz(false);
        setShowHint(true);
    };

    // リセット
    const handleReset = () => {
        clearGameState(); // 保存データをクリア
        resetUsedQuizzes(); // クイズ履歴をリセット
        dispatch({ type: 'RESET_GAME' });
        setScreen('title');
        setStageCompleted(false);
        setPreviousStage('kabuwake');
        setShowQuiz(false);
        setShowHint(false);
    };

    // 現在のステージコンポーネントを取得
    const renderStage = () => {
        const commonProps = {
            onComplete: handleStageComplete,
            onNextDay: handleNextDay
        };

        switch (state.currentStage) {
            case 'kabuwake':
                return <Stage1Kabuwake {...commonProps} />;
            case 'uetsuke':
                return <Stage2Uetsuke {...commonProps} />;
            case 'sakigari':
                return <Stage3Sakigari {...commonProps} />;
            case 'seicho':
                return <Stage4Seicho {...commonProps} />;
            case 'shukaku':
                return <Stage5Shukaku {...commonProps} />;
            case 'dorozome':
                return <Stage6Dorozome {...commonProps} />;
            case 'seishoku':
                return <Stage7Seishoku {...commonProps} />;
            case 'kensa':
                return <Stage8Kensa {...commonProps} />;
            default:
                return null;
        }
    };

    const hint = getHintForStage(state.currentStage);
    const finalRank = getFinalRank(state.qualityPoints);

    return (
        <div className="app">
            {/* タイトル画面 */}
            {screen === 'title' && (
                <div className="title-screen" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setShowFurigana(!showFurigana)}
                        >
                            <span>{showFurigana ? 'フリガナ OFF' : 'フリガナ ON'}</span>
                        </Button>
                    </div>

                    <TitleVisual />
                    <h1><ruby>い草<rt>いぐさ</rt></ruby><ruby>育成<rt>いくせい</rt></ruby>ゲーム</h1>
                    <p className="subtitle"><ruby>畳<rt>たたみ</rt></ruby>の<ruby>知識<rt>ちしき</rt></ruby>を<ruby>学<rt>まな</rt></ruby>びながら<br /><ruby>い草<rt>いぐさ</rt></ruby>を<ruby>育<rt>そだ</rt></ruby>てよう！</p>

                    <div className="title-buttons">
                        <Button variant="primary" size="large" fullWidth onClick={handleStartGame}>
                            <span>🌱 <ruby>新<rt>あたら</rt></ruby>しく<ruby>始<rt>はじ</rt></ruby>める</span>
                        </Button>
                        {state.currentDay > 1 && (
                            <Button variant="secondary" size="large" fullWidth onClick={handleContinueGame}>
                                <span>📂 <ruby>続<rt>つづ</rt></ruby>きから（{state.currentDay}）</span>
                            </Button>
                        )}
                    </div>

                    <div className="title-info">
                        <p>🎮 8つのステージ</p>
                        <p>📚 <ruby>畳<rt>たたみ</rt></ruby>クイズで<ruby>知識<rt>ちしき</rt></ruby>UP</p>
                        <p>⏱️ 約30分でクリア</p>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Version 1.3</p>
                    </div>
                </div>
            )}

            {/* デバッグモード: 左上ボタン */}
            {DEBUG_MODE && (
                <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 9999 }}>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setShowDebugPanel(!showDebugPanel)}
                        style={{
                            background: 'rgba(255, 0, 0, 0.9)',
                            color: 'white',
                            border: '2px solid #c00'
                        }}
                    >
                        🔧 デバッグ
                    </Button>

                    {showDebugPanel && (
                        <div style={{
                            marginTop: '8px',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '2px solid #c00',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            minWidth: '200px'
                        }}>
                            <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>ステージ選択</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                {STAGES.map((stage, index) => (
                                    <Button
                                        key={stage.type}
                                        variant="secondary"
                                        size="small"
                                        onClick={() => {
                                            resetUsedQuizzes();
                                            dispatch({ type: 'START_GAME' });
                                            dispatch({ type: 'JUMP_TO_DAY', day: stage.dayRange[0] });
                                            setScreen('game');
                                            setPreviousStage(stage.type);
                                            setShowHint(true);
                                            setShowDebugPanel(false);
                                        }}
                                    >
                                        {stage.icon} {index + 1}
                                    </Button>
                                ))}
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />

                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ color: '#c00', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>QP設定</p>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        defaultValue={state.qualityPoints}
                                        style={{ width: '80px', padding: '4px' }}
                                        onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) {
                                                dispatch({ type: 'SET_QP', amount: val });
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = parseInt(e.currentTarget.value);
                                                if (!isNaN(val)) {
                                                    dispatch({ type: 'SET_QP', amount: val });
                                                    e.currentTarget.blur();
                                                }
                                            }
                                        }}
                                    />
                                    <span style={{ fontSize: '12px', alignSelf: 'center' }}>QP</span>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
                            <Button
                                variant="secondary"
                                size="small"
                                fullWidth
                                onClick={() => {
                                    setScreen('title');
                                    setShowDebugPanel(false);
                                }}
                            >
                                🏠 ホームへ戻る
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ゲーム画面 */}
            {screen === 'game' && (
                <div className="game-layout">
                    <StatusBar />
                    <StageProgress />

                    <div className="game-main">
                        <div className="stage-container">
                            <div className="stage-header">
                                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <StatusIcon type={currentStageInfo.type} size={40} />
                                    <FuriganaText text={currentStageInfo.name} />
                                </h2>
                                <p className="stage-description"><FuriganaText text={currentStageInfo.description} /></p>
                            </div>

                            <div className="stage-content">
                                {renderStage()}
                            </div>
                        </div>
                    </div>

                    {/* 次の日へボタン */}
                    {stageCompleted && state.currentStage !== 'kensa' && (
                        <div className="skip-button-area">
                            <Button variant="success" fullWidth onClick={handleNextDay}>
                                ☀️ <span><ruby>次<rt>つぎ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby>へ → {Math.min(state.currentDay + 1, 30)}</span>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* 結果画面 */}
            {screen === 'results' && (
                <div className={`results-screen rank-${finalRank.toLowerCase()}`}>
                    <IgusaChan mood={getMoodByQP(state.qualityPoints, 8)} size="large" stage={8} day={30} />

                    <div className={`results-rank rank-${finalRank.toLowerCase()}`}>
                        {finalRank}
                    </div>

                    <h2 className="results-title">
                        {finalRank === 'S' && <><FuriganaText text="✨ {最高級|さいこうきゅう}{畳|たたみ}{完成|かんせい}！" /></>}
                        {finalRank === 'A' && <><FuriganaText text="⭐ {高品質|こうひんしつ}{畳|たたみ}{完成|かんせい}！" /></>}
                        {finalRank === 'B' && <><FuriganaText text="👍 {標準|ひょうじゅん}{品質|ひんしつ}{畳|たたみ}{完成|かんせい}" /></>}
                        {finalRank === 'C' && <><FuriganaText text="📦 なんとか{完成|かんせい}..." /></>}
                        {finalRank === 'D' && <><FuriganaText text="😢 {規格外|きかくがい}..." /></>}
                    </h2>

                    <p className="results-qp"><ruby>最終<rt>さいしゅう</rt></ruby>QP: {state.qualityPoints}</p>

                    <div className="results-badges">
                        {state.badges.length > 0 ? (
                            state.badges.map(badge => (
                                <div key={badge.id} className="badge-item">
                                    <BadgeIcon type={badge.id as any} size={40} />
                                    <span className="badge-name"><FuriganaText text={badge.name} /></span>
                                </div>
                            ))
                        ) : (
                            <p>バッジ<ruby>獲得<rt>かくとく</rt></ruby>なし</p>
                        )}
                    </div>

                    <div className="results-stats">
                        <p>クイズ<ruby>正解<rt>せいかい</rt></ruby><ruby>率<rt>りつ</rt></ruby>: {state.quizAnswered > 0
                            ? Math.round((state.quizCorrect / state.quizAnswered) * 100)
                            : 0}%</p>
                    </div>

                    <div className="title-buttons">
                        <Button variant="secondary" size="large" fullWidth onClick={handleReset}>
                            <span>🏠 タイトルへ<ruby>戻<rt>もど</rt></ruby>る</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* クイズモーダル */}
            <QuizModal
                quiz={currentQuiz}
                isOpen={showQuiz}
                onAnswer={handleQuizAnswer}
            />

            {/* ヒントモーダル */}
            <Modal
                isOpen={showHint}
                onClose={() => setShowHint(false)}
                title={<>💡 <FuriganaText text={hint.title} /></>}
            >
                <div className="hint-content">
                    <ul>
                        {hint.hints.map((h, i) => (
                            <li key={i}><FuriganaText text={h} /></li>
                        ))}
                    </ul>
                    <p className="hint-warning">
                        ⚠️ <FuriganaText text={hint.failureWarning} />
                    </p>
                    <Button variant="primary" fullWidth onClick={() => setShowHint(false)}>
                        わかった！
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

function App() {
    return (
        <GameProvider>
            <GameContent />
        </GameProvider>
    );
}

export default App;
