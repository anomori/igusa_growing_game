import { Badge } from '../types/game';

export const badgeDefinitions: Omit<Badge, 'earnedAt'>[] = [
    {
        id: 'first_harvest',
        name: '新米農家',
        icon: '🌱',
        description: '初めてい草を収穫した',
    },
    {
        id: 'quiz_master_50',
        name: '畳マスター',
        icon: '🎓',
        description: 'クイズ50問正解',
    },
    {
        id: 'yatsushiro_star',
        name: '八代の星',
        icon: '⭐',
        description: '畳表製造まで完了',
    },
    {
        id: 'igusa_professor',
        name: 'い草博士',
        icon: '📚',
        description: 'クイズ100問正解',
    },
    {
        id: 'tradition_keeper',
        name: '伝統の継承者',
        icon: '🏆',
        description: '全品種を育成',
    },
    {
        id: 'kabuwake_master',
        name: '株分け名人',
        icon: '✨',
        description: '株分けで全てPerfect',
    },
    {
        id: 'water_master',
        name: '水管理マスター',
        icon: '💧',
        description: '植え付け期間中、全日Perfect維持',
    },
    {
        id: 'sakigari_master',
        name: '先刈り名人',
        icon: '✂️',
        description: '先刈りでPerfect率50%以上',
    },
    {
        id: 'harvest_master',
        name: '収穫マスター',
        icon: '🌾',
        description: '50本以上連続で刈り取り',
    },
    {
        id: 'weaving_master',
        name: '織師の匠',
        icon: '🧵',
        description: '製織で密度90%以上達成',
    },
    {
        id: 'rank_s',
        name: '特等畳職人',
        icon: '👑',
        description: 'Sランクの畳を完成させた',
    },
];

export function getBadgeById(id: string): Omit<Badge, 'earnedAt'> | undefined {
    return badgeDefinitions.find(badge => badge.id === id);
}
