import { Quiz } from '../types/game';

export const quizData: Quiz[] = [
    // 畳の効果
    {
        id: 'effect_01',
        category: 'effect',
        question: '畳に使われるい草の香り成分として知られているのは？',
        options: ['フィトンチッド', 'カテキン', 'リモネン', 'メントール'],
        correctIndex: 0,
        explanation: 'フィトンチッドは森林浴でも知られるリラックス効果のある成分です。い草にも含まれており、畳の心地よい香りの正体です。',
    },
    {
        id: 'effect_02',
        category: 'effect',
        question: '畳が持つ湿度を調整する機能は何と呼ばれる？',
        options: ['断熱効果', '調湿効果', '加湿効果', '防虫効果'],
        correctIndex: 1,
        explanation: '畳は湿気を吸収したり放出したりする「調湿効果」があります。梅雨時は湿気を吸い、乾燥時は放出してくれます。',
    },
    {
        id: 'effect_03',
        category: 'effect',
        question: '畳の断熱性に関する特徴として正しいのは？',
        options: ['夏は暑く冬は寒い', '冬暖かく夏涼しい', '年中一定の温度', '断熱性はない'],
        correctIndex: 1,
        explanation: '畳は空気を多く含んでいるため断熱性が高く、冬は暖かく夏は涼しく過ごせます。',
    },
    {
        id: 'effect_04',
        category: 'effect',
        question: '畳が音を吸収する効果は何と呼ばれる？',
        options: ['防音効果', '吸音効果', '反響効果', '消音効果'],
        correctIndex: 1,
        explanation: '畳には多くの空気が含まれており、音を吸収する「吸音効果」があります。生活音を和らげてくれます。',
    },

    // い草の知識
    {
        id: 'knowledge_01',
        category: 'knowledge',
        question: 'い草の国内生産量1位の都道府県はどこ？',
        options: ['福岡県', '熊本県', '大分県', '佐賀県'],
        correctIndex: 1,
        explanation: '熊本県が国内い草生産量の約9割を占めています。特に八代市が有名な産地です。',
    },
    {
        id: 'knowledge_02',
        category: 'knowledge',
        question: '熊本県のい草の主な産地として知られる市は？',
        options: ['熊本市', '八代市', '天草市', '阿蘇市'],
        correctIndex: 1,
        explanation: '八代市は「い草の里」として知られ、国内最大のい草産地です。',
    },
    {
        id: 'knowledge_03',
        category: 'knowledge',
        question: '高級い草の品種として知られるのは？',
        options: ['ひのみどり', 'こしひかり', 'あきたこまち', 'ゆめぴりか'],
        correctIndex: 0,
        explanation: '「ひのみどり」は細くて美しい高級い草の品種です。この品種を使った畳表は「ひのさらさ」というブランド名で知られています。',
    },
    {
        id: 'knowledge_04',
        category: 'knowledge',
        question: '高級畳1畳に使われるい草の本数は約何本？',
        options: ['約2000本', '約4000本', '約6000本', '約8000本'],
        correctIndex: 3,
        explanation: '高級畳は1畳に約8000本ものい草を使用します。密に織り込むほど高品質な畳になります。',
    },
    {
        id: 'knowledge_05',
        category: 'knowledge',
        question: 'い草はどうやって増やす？',
        options: ['種まき', '株分け', '挿し木', '接ぎ木'],
        correctIndex: 1,
        explanation: 'い草は種ではなく「株分け」で増やします。親株から苗を分けて植え付けます。',
    },
    {
        id: 'knowledge_06',
        category: 'knowledge',
        question: 'い草の収穫に適した時間帯は？',
        options: ['正午', '深夜', '早朝や夕方', 'いつでも同じ'],
        correctIndex: 2,
        explanation: 'い草は鮮度が命！暑い時間帯に刈ると色・香りが落ちるため、気温の低い早朝や夕方に収穫します。',
    },
    {
        id: 'knowledge_07',
        category: 'knowledge',
        question: '畳の良い香りを出すために収穫後に行う作業は？',
        options: ['天日干し', '泥染め', '塩漬け', '煮沸'],
        correctIndex: 1,
        explanation: '収穫後すぐに「泥染め」を行います。天然染土で染めることで、畳独特の色・香り・光沢が生まれます。',
    },

    // 畳の歴史
    {
        id: 'history_01',
        category: 'history',
        question: '畳の原型（筵/むしろ）が使われ始めたのは何時代？',
        options: ['弥生時代', '縄文時代', '古墳時代', '飛鳥時代'],
        correctIndex: 1,
        explanation: '縄文時代には既に筵（むしろ）が使われていました。これが畳の原型とされています。',
    },
    {
        id: 'history_02',
        category: 'history',
        question: '貴族が現代に近い形の畳を使い始めたのは何時代？',
        options: ['奈良時代', '平安時代', '鎌倉時代', '室町時代'],
        correctIndex: 1,
        explanation: '平安時代になると、貴族の間で現代に近い形の畳が使われるようになりました。',
    },
    {
        id: 'history_03',
        category: 'history',
        question: '庶民に畳が広く普及したのはいつ頃？',
        options: ['鎌倉時代', '室町時代', '安土桃山時代', '江戸時代中期以降'],
        correctIndex: 3,
        explanation: '江戸時代中期以降になって、畳は庶民の家にも普及しました。それまでは上流階級のものでした。',
    },
];

// 使用済みクイズIDを追跡
let usedQuizIds: Set<string> = new Set();

// 選択肢をシャッフルしたクイズを返す
function shuffleQuizOptions(quiz: Quiz): Quiz {
    // 選択肢とインデックスのペアを作成
    const optionsWithIndex = quiz.options.map((opt, idx) => ({ opt, idx }));

    // シャッフル
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }

    // 新しい正解インデックスを見つける
    const newCorrectIndex = optionsWithIndex.findIndex(item => item.idx === quiz.correctIndex);

    return {
        ...quiz,
        options: optionsWithIndex.map(item => item.opt),
        correctIndex: newCorrectIndex
    };
}

// カテゴリーからランダムにクイズを取得（未使用のもの優先）
export function getRandomQuiz(category?: 'effect' | 'knowledge' | 'history'): Quiz {
    const filtered = category
        ? quizData.filter(q => q.category === category)
        : quizData;

    // 未使用のクイズを優先
    const unused = filtered.filter(q => !usedQuizIds.has(q.id));
    const pool = unused.length > 0 ? unused : filtered;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedQuiz = pool[randomIndex];

    // 使用済みとしてマーク
    usedQuizIds.add(selectedQuiz.id);

    // 選択肢をシャッフルして返す
    return shuffleQuizOptions(selectedQuiz);
}

// ステージに応じたクイズを取得
export function getQuizForStage(stageIndex: number): Quiz {
    // ステージに応じてカテゴリを変える
    const categories: ('effect' | 'knowledge' | 'history')[] = ['knowledge', 'knowledge', 'effect', 'knowledge', 'knowledge', 'effect', 'history', 'history'];
    return getRandomQuiz(categories[stageIndex % categories.length]);
}

// ゲームリセット時に使用済みクイズをクリア
export function resetUsedQuizzes(): void {
    usedQuizIds = new Set();
}
