// ゲームの状態
export interface GameState {
    currentDay: number;           // 現在の日数 (1-30)
    currentStage: StageType;      // 現在のステージ
    qualityPoints: number;        // 品質ポイント (QP)
    badges: Badge[];              // 獲得したバッジ
    quizAnswered: number;         // 回答したクイズ数
    quizCorrect: number;          // 正解したクイズ数
    variety: IgusaVariety;        // 品種
    stageProgress: StageProgress; // 各ステージの進捗
    isGameCompleted: boolean;     // ゲームクリアフラグ
}

// ステージの種類
export type StageType =
    | 'kabuwake'   // ① 株分け (Day 1-2)
    | 'uetsuke'    // ② 植え付け (Day 3-5)
    | 'sakigari'   // ③ 先刈り (Day 6-8)
    | 'seicho'     // ④ 成長期・網張り (Day 9-20)
    | 'shukaku'    // ⑤ 収穫 (Day 21-23)
    | 'dorozome'   // ⑥ 泥染め・乾燥 (Day 24-26)
    | 'seishoku'   // ⑦ 製織 (Day 27-29)
    | 'kensa';     // ⑧ 仕上げ・検査 (Day 30)

// ステージ情報
export interface StageInfo {
    type: StageType;
    name: string;
    icon: string;
    dayRange: [number, number];
    month: string;
    description: string;
}

// ステージ進捗
export interface StageProgress {
    kabuwake: { completed: boolean; score: number };
    uetsuke: { completed: boolean; score: number };
    sakigari: { completed: boolean; score: number };
    seicho: { completed: boolean; score: number };
    shukaku: { completed: boolean; score: number };
    dorozome: { completed: boolean; score: number };
    seishoku: { completed: boolean; score: number };
    kensa: { completed: boolean; score: number };
}

// い草の品種
export type IgusaVariety = 'zairai' | 'hinomidori' | 'hinoharuka' | 'shichitoi' | 'yunagi';

export interface VarietyInfo {
    id: IgusaVariety;
    name: string;
    description: string;
    rarity: number; // 1-3
}

// バッジ
export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedAt?: Date;
}

// クイズ
export interface Quiz {
    id: string;
    category: 'effect' | 'knowledge' | 'history';
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

// 判定結果
export type JudgementType = 'perfect' | 'good' | 'miss';

export interface JudgementResult {
    type: JudgementType;
    qpChange: number;
    message: string;
}

// キャラクターの表情
export type CharacterMood = 'excellent' | 'happy' | 'normal' | 'sad';

// ゲームアクション
export type GameAction =
    | { type: 'START_GAME'; variety?: IgusaVariety }
    | { type: 'NEXT_DAY' }
    | { type: 'JUMP_TO_DAY'; day: number }
    | { type: 'ADD_QP'; amount: number }
    | { type: 'COMPLETE_STAGE'; stage: StageType; score: number }
    | { type: 'ANSWER_QUIZ'; correct: boolean }
    | { type: 'EARN_BADGE'; badge: Badge }
    | { type: 'RESET_GAME' }
    | { type: 'LOAD_GAME'; state: GameState };

// ステージ設定
export const STAGES: StageInfo[] = [
    { type: 'kabuwake', name: '株分け', icon: '🌱', dayRange: [1, 2], month: '11月中旬', description: '親株から苗を分ける' },
    { type: 'uetsuke', name: '植え付け', icon: '🌿', dayRange: [3, 5], month: '11月下旬', description: '本田へ植え付け' },
    { type: 'sakigari', name: '先刈り', icon: '✂️', dayRange: [6, 8], month: '5月上旬', description: '先端を刈り揃える' },
    { type: 'seicho', name: '成長期', icon: '📏', dayRange: [9, 20], month: '5月〜6月', description: '網張り・水管理' },
    { type: 'shukaku', name: '収穫', icon: '🌾', dayRange: [21, 23], month: '6月下旬', description: '刈り取り' },
    { type: 'dorozome', name: '泥染め', icon: '🎨', dayRange: [24, 26], month: '収穫後', description: '泥染め・乾燥' },
    { type: 'seishoku', name: '製織', icon: '🧵', dayRange: [27, 29], month: '通年', description: '畳表に織り上げる' },
    { type: 'kensa', name: '検査', icon: '✅', dayRange: [30, 30], month: '仕上げ', description: '品質チェック' },
];

// 日数からステージを取得
export function getStageByDay(day: number): StageInfo {
    const stage = STAGES.find(s => day >= s.dayRange[0] && day <= s.dayRange[1]);
    return stage || STAGES[STAGES.length - 1];
}

// QPからキャラクターの気分を取得
// QPからキャラクターの気分を取得
export function getMoodByQP(qp: number, stage: number = 1): CharacterMood {
    // ステージ終了時点での目安QP
    const thresholds: Record<number, number> = {
        1: 100, // 株分け
        2: 150, // 植え付け
        3: 250, // 先刈り
        4: 350, // 成長期
        5: 450, // 収穫
        6: 550, // 泥染め
        7: 650, // 製織
        8: 450  // 検査 (最終評価): Aランクライン(450)以上ならHappyにする
    };

    const target = thresholds[stage] || 200;

    // Stage8（最終）は閾値調整を緩める
    if (stage === 8) {
        if (qp >= 550) return 'excellent'; // Sランク
        if (qp >= 450) return 'happy';     // Aランク
        if (qp >= 350) return 'normal';    // Bランク
        return 'sad';
    }

    if (qp >= target + 50) return 'excellent';
    if (qp >= target) return 'happy';
    if (qp >= target - 50) return 'normal';
    return 'sad';
}

// 最終ランク判定
export type FinalRank = 'S' | 'A' | 'B' | 'C' | 'D';

export function getFinalRank(qp: number): FinalRank {
    if (qp >= 550) return 'S';
    if (qp >= 450) return 'A';
    if (qp >= 350) return 'B';
    if (qp >= 200) return 'C';
    return 'D';
}

export function getNextStageStartDay(currentStage: StageType): number {
    const currentIndex = STAGES.findIndex(s => s.type === currentStage);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) {
        return 30; // 最終日またはエラー
    }
    return STAGES[currentIndex + 1].dayRange[0];
}

// 初期状態
export const initialGameState: GameState = {
    currentDay: 1,
    currentStage: 'kabuwake',
    qualityPoints: 100,
    badges: [],
    quizAnswered: 0,
    quizCorrect: 0,
    variety: 'zairai',
    stageProgress: {
        kabuwake: { completed: false, score: 0 },
        uetsuke: { completed: false, score: 0 },
        sakigari: { completed: false, score: 0 },
        seicho: { completed: false, score: 0 },
        shukaku: { completed: false, score: 0 },
        dorozome: { completed: false, score: 0 },
        seishoku: { completed: false, score: 0 },
        kensa: { completed: false, score: 0 },
    },
    isGameCompleted: false,
};
