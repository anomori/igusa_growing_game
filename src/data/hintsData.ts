import { StageType } from '../types/game';

export interface StageHint {
    title: string;
    hints: string[];
    failureWarning: string;
}

export const hintsData: Record<StageType, StageHint> = {
    kabuwake: {
        title: '株分けのコツ',
        hints: [
            'い草は種ではなく株分けで増やす！',
            '新しい芽を傷つけないように丁寧に分けよう',
            '3〜4本ずつの束に分けるのがポイント！',
        ],
        failureWarning: '株分けが雑だと新芽が傷つき、その後の成長が悪くなる',
    },
    uetsuke: {
        title: '植え付けのコツ',
        hints: [
            '植え付け直後は3〜4cmの深水管理で苗を保護',
            '寒さから守る保温効果もあるよ！',
            '活着後は2〜3cmの浅水管理に切り替え',
        ],
        failureWarning: '浅すぎると苗が乾燥して枯れる、深水のままだと茎が弱く育つ',
    },
    sakigari: {
        title: '先刈りのコツ',
        hints: [
            '収穫の約60日前に出る芽が最も質の良いい草になる！',
            '地上45cmの高さで刈り揃えよう',
            '「ひのみどり」品種なら1株130本、その他は100本が目安',
        ],
        failureWarning: '早すぎると茎数不足、遅すぎると伸長不足',
    },
    seicho: {
        title: '成長期のコツ',
        hints: [
            'い草は150cm以上に成長！風で倒れると折れて品質低下',
            '10日ごとに網を10cm上げるのがポイント',
            '田んぼから泡（ガス）が出てきたら間断かん水でガスを抜こう',
        ],
        failureWarning: '網上げを忘れると倒伏して品質が落ちる',
    },
    shukaku: {
        title: '収穫のコツ',
        hints: [
            '気温の低い早朝・夕方に収穫しよう！',
            '夏の暑さでい草が傷むのを防ぐため、手早く刈り取る',
            '刈り取ったい草は紐でくくり、すぐに泥染めへ！',
        ],
        failureWarning: '暑い時間帯に収穫すると鮮度が落ちる',
    },
    dorozome: {
        title: '泥染め・乾燥のコツ',
        hints: [
            '天然の染土（淡路島産など）を溶かした水に浸す',
            '泥染めで色・香り・光沢が出るよ。畳の良い香りの秘密！',
            '60〜70℃でじっくり乾燥。乾燥後は日光を避けて保管！',
        ],
        failureWarning: '泥染めをしないと色ムラ・日焼けの原因に、乾燥不足だとカビの原因',
    },
    seishoku: {
        title: '製織のコツ',
        hints: [
            '穂先と根元が切り落とされた、良質な部分だけを選別しよう',
            '高級畳は1畳に約8000本ものい草を使う！',
            'い草を左右から交互に送り込んで織っていく',
        ],
        failureWarning: '選別が雑だと仕上がりにムラが出る、織りが粗いと品質が低い畳に',
    },
    kensa: {
        title: '検査のコツ',
        hints: [
            '一枚一枚手作業で傷がないかチェック！',
            '検査に合格した畳表はランクごとに分けられる',
            '見落としがないように丁寧に確認しよう',
        ],
        failureWarning: '見落とすと不良品として返品される',
    },
};

export function getHintForStage(stage: StageType): StageHint {
    return hintsData[stage];
}
