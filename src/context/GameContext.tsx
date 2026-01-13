import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import {
    GameState,
    GameAction,
    initialGameState,
    getStageByDay,
    StageType
} from '../types/game';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...initialGameState,
                variety: action.variety || 'zairai',
            };

        case 'NEXT_DAY': {
            const nextDay = Math.min(state.currentDay + 1, 30);
            const nextStage = getStageByDay(nextDay);
            return {
                ...state,
                currentDay: nextDay,
                currentStage: nextStage.type,
                isGameCompleted: nextDay === 30 && state.stageProgress.kensa.completed,
            };
        }

        case 'JUMP_TO_DAY': {
            const nextDay = Math.min(action.day, 30);
            const nextStage = getStageByDay(nextDay);
            return {
                ...state,
                currentDay: nextDay,
                currentStage: nextStage.type,
                isGameCompleted: nextDay === 30 && state.stageProgress.kensa.completed,
            };
        }

        case 'ADD_QP':
            return {
                ...state,
                qualityPoints: Math.max(0, state.qualityPoints + action.amount),
            };

        case 'SET_QP':
            return {
                ...state,
                qualityPoints: Math.max(0, action.amount),
            };

        case 'COMPLETE_STAGE': {
            const stageKey = action.stage as StageType;
            return {
                ...state,
                stageProgress: {
                    ...state.stageProgress,
                    [stageKey]: { completed: true, score: action.score },
                },
            };
        }

        case 'ANSWER_QUIZ':
            return {
                ...state,
                quizAnswered: state.quizAnswered + 1,
                quizCorrect: action.correct ? state.quizCorrect + 1 : state.quizCorrect,
                qualityPoints: action.correct
                    ? state.qualityPoints + 5
                    : state.qualityPoints,
            };

        case 'EARN_BADGE':
            if (state.badges.some(b => b.id === action.badge.id)) {
                return state;
            }
            return {
                ...state,
                badges: [...state.badges, { ...action.badge, earnedAt: new Date() }],
            };

        case 'RESET_GAME':
            return initialGameState;

        case 'LOAD_GAME':
            return action.state;

        default:
            return state;
    }
}

// Context
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    // 初期状態をlocalStorageから読み込み（同期的に）
    const getInitialState = (): GameState => {
        const savedState = loadGameState();
        return savedState || initialGameState;
    };

    const [state, dispatch] = useReducer(gameReducer, getInitialState());
    const [isInitialized, setIsInitialized] = useState(false);

    // 初期化完了をマーク
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // ゲーム状態を保存（初期化後のみ）
    useEffect(() => {
        if (isInitialized) {
            saveGameState(state);
        }
    }, [state, isInitialized]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

// Hook
export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
