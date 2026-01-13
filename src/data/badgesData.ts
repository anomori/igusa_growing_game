import { Badge } from '../types/game';

export const badgeDefinitions: Omit<Badge, 'earnedAt'>[] = [
    {
        id: 'first_harvest',
        name: '{新米|しんまい}{農家|のうか}',
        icon: '🌱',
        description: '{初|はじ}めて{い草|いぐさ}を{収穫|しゅうかく}した',
    },
    {
        id: 'quiz_master_50',
        name: '{畳|たたみ}マスター',
        icon: '🎓',
        description: 'クイズ50{問|もん}{正解|せいかい}',
    },
    {
        id: 'yatsushiro_star',
        name: '{八代|やつしろ}の{星|ほし}',
        icon: '⭐',
        description: '{畳表|たたみおもて}{製造|せいぞう}まで{完了|かんりょう}',
    },
    {
        id: 'igusa_professor',
        name: '{い草|いぐさ}{博士|はかせ}',
        icon: '📚',
        description: 'クイズ100{問|もん}{正解|せいかい}',
    },
    {
        id: 'tradition_keeper',
        name: '{伝統|でんとう}の{継承|けいしょう}{者|しゃ}',
        icon: '🏆',
        description: '{全|ぜん}{品種|ひんしゅ}を{育成|いくせい}',
    },
    {
        id: 'kabuwake_master',
        name: '{株|かぶ}{分|わ}け{名人|めいじん}',
        icon: '✨',
        description: '{株|かぶ}{分|わ}けで{全|すべ}てPerfect',
    },
    {
        id: 'water_master',
        name: '{水|みず}{管理|かんり}マスター',
        icon: '💧',
        description: '{植|う}え{付|つ}け{期間|きかん}{中|ちゅう}、{全日|ぜんじつ}Perfect{維持|いじ}',
    },
    {
        id: 'sakigari_master',
        name: '{先|さき}{刈|が}り{名人|めいじん}',
        icon: '✂️',
        description: '{先|さき}{刈|が}りでPerfect{率|りつ}50%[以上|いじょう}',
    },
    {
        id: 'harvest_master',
        name: '{収穫|しゅうかく}マスター',
        icon: '🌾',
        description: '50{本|ほん}{以上|いじょう}{連続|れんぞく}で{刈|か}り{取|と}り',
    },
    {
        id: 'weaving_master',
        name: '{織師|おりし}の{匠|たくみ}',
        icon: '🧵',
        description: '{製織|せいしょく}で{密度|みつど}90%[以上|いじょう}{達成|たっせい}',
    },
    {
        id: 'rank_s',
        name: '{特等|とくとう}{畳|たたみ}{職人|しょくにん}',
        icon: '👑',
        description: 'Sランクの{畳|たたみ}を{完成|かんせい}させた',
    },
];

export function getBadgeById(id: string): Omit<Badge, 'earnedAt'> | undefined {
    return badgeDefinitions.find(badge => badge.id === id);
}
