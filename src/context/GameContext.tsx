import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
    GameState,
    GameAction,
    initialGameState,
    getStageByDay,
    StageType
} from '../types/game';
import { saveGameState, loadGameState } from '../utils/storage';

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

        case 'ADD_QP':
            return {
                ...state,
                qualityPoints: Math.max(0, state.qualityPoints + action.amount),
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
    const [state, dispatch] = useReducer(gameReducer, initialGameState);

    // ゲーム状態をロード
    useEffect(() => {
        const savedState = loadGameState();
        if (savedState) {
            dispatch({ type: 'LOAD_GAME', state: savedState });
        }
    }, []);

    // ゲーム状態を保存
    useEffect(() => {
        saveGameState(state);
    }, [state]);

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
