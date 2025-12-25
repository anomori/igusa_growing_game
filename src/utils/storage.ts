import { GameState } from '../types/game';

const STORAGE_KEY = 'igusa_game_save';

export function saveGameState(state: GameState): void {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

export function loadGameState(): GameState | null {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized) as GameState;
    } catch (error) {
        console.error('Failed to load game state:', error);
        return null;
    }
}

export function clearGameState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear game state:', error);
    }
}
