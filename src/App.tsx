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
import { getMoodByQP, getStageByDay, getFinalRank, STAGES } from './types/game';
import { getQuizForStage } from './data/quizData';
import { getHintForStage } from './data/hintsData';
import { badgeDefinitions } from './data/badgesData';
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

    // ゲーム開始
    const handleStartGame = () => {
        dispatch({ type: 'START_GAME' });
        setScreen('game');
        setShowHint(true);
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
            // 次の日へ進む
            handleNextDay();
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
        dispatch({ type: 'RESET_GAME' });
        setScreen('title');
        setStageCompleted(false);
        setPreviousStage('kabuwake');
    };

    // 現在のステージコンポーネントを取得
    const renderStage = () => {
        switch (state.currentStage) {
            case 'kabuwake':
                return <Stage1Kabuwake onComplete={handleStageComplete} />;
            case 'uetsuke':
                return <Stage2Uetsuke onComplete={handleStageComplete} />;
            case 'sakigari':
                return <Stage3Sakigari onComplete={handleStageComplete} />;
            case 'seicho':
                return <Stage4Seicho onComplete={handleStageComplete} />;
            case 'shukaku':
                return <Stage5Shukaku onComplete={handleStageComplete} />;
            case 'dorozome':
                return <Stage6Dorozome onComplete={handleStageComplete} />;
            case 'seishoku':
                return <Stage7Seishoku onComplete={handleStageComplete} />;
            case 'kensa':
                return <Stage8Kensa onComplete={handleStageComplete} />;
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
                <div className="title-screen">
                    <div className="title-character">🌱</div>
                    <h1>い草ちゃん育成ゲーム</h1>
                    <p className="subtitle">畳の知識を学びながら<br />い草を育てよう！</p>

                    <div className="title-buttons">
                        <Button variant="primary" size="large" fullWidth onClick={handleStartGame}>
                            🌱 新しく始める
                        </Button>
                        {state.currentDay > 1 && (
                            <Button variant="secondary" size="large" fullWidth onClick={handleContinueGame}>
                                📂 続きから（Day {state.currentDay}）
                            </Button>
                        )}
                    </div>

                    <div className="title-info">
                        <p>🎮 8つのステージ</p>
                        <p>📚 畳クイズで知識UP</p>
                        <p>⏱️ 約30分でクリア</p>
                    </div>
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
                                <h2>{currentStageInfo.icon} {currentStageInfo.name}</h2>
                                <p className="stage-description">{currentStageInfo.description}</p>
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
                                ☀️ 次の日へ → Day {Math.min(state.currentDay + 1, 30)}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* 結果画面 */}
            {screen === 'results' && (
                <div className={`results-screen rank-${finalRank.toLowerCase()}`}>
                    <IgusaChan mood={getMoodByQP(state.qualityPoints)} size="large" stage={8} />

                    <div className={`results-rank rank-${finalRank.toLowerCase()}`}>
                        {finalRank}
                    </div>

                    <h2 className="results-title">
                        {finalRank === 'S' && '✨ 最高級畳完成！'}
                        {finalRank === 'A' && '⭐ 高品質畳完成！'}
                        {finalRank === 'B' && '👍 標準品質畳完成'}
                        {finalRank === 'C' && '📦 なんとか完成...'}
                        {finalRank === 'D' && '😢 規格外...'}
                    </h2>

                    <p className="results-qp">最終QP: {state.qualityPoints}</p>

                    <div className="results-badges">
                        {state.badges.map(badge => (
                            <div key={badge.id} className="badge-item">
                                <span className="badge-icon">{badge.icon}</span>
                                <span className="badge-name">{badge.name}</span>
                            </div>
                        ))}
                        {state.badges.length === 0 && (
                            <p>バッジ獲得なし</p>
                        )}
                    </div>

                    <div className="results-stats">
                        <p>クイズ正解率: {state.quizAnswered > 0
                            ? Math.round((state.quizCorrect / state.quizAnswered) * 100)
                            : 0}%</p>
                    </div>

                    <div className="title-buttons">
                        <Button variant="primary" size="large" fullWidth onClick={handleReset}>
                            🔄 もう一度遊ぶ
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
                title={`💡 ${hint.title}`}
            >
                <div className="hint-content">
                    <ul>
                        {hint.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                    <p className="hint-warning">
                        ⚠️ {hint.failureWarning}
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
