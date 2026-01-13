import { Quiz } from '../types/game';

export const quizData: Quiz[] = [
    // 畳の効果
    {
        id: 'effect_01',
        category: 'effect',
        question: '{畳|たたみ}に{使|つか}われる{い草|いぐさ}の{香|かお}り{成分|せいぶん}として{知|し}られているのは？',
        options: ['フィトンチッド', 'カテキン', 'リモネン', 'メントール'],
        correctIndex: 0,
        explanation: 'フィトンチッドは{森林|しんりん}{浴|よく}でも{知|し}られるリラックス{効果|こうか}のある{成分|せいぶん}です。{い草|いぐさ}にも{含|ふく}まれており、{畳|たたみ}の{心地|ここち}よい{香|かお}りの{正体|しょうたい}です。',
    },
    {
        id: 'effect_02',
        category: 'effect',
        question: '{畳|たたみ}が{持|も}つ{湿度|しつど}を{調整|ちょうせい}する{機能|きのう}は{何|なん}と{呼|よ}ばれる？',
        options: ['{断熱|だんねつ}{効果|こうか}', '{調湿|ちょうしつ}{効果|こうか}', '{加湿|かしつ}{効果|こうか}', '{防虫|ぼうちゅう}{効果|こうか}'],
        correctIndex: 1,
        explanation: '{畳|たたみ}は{湿気|しっけ}を{吸収|きゅうしゅう}したり{放出|ほうしゅつ}したりする「{調湿|ちょうしつ}{効果|こうか}」があります。{梅雨|つゆ}{時|じ}は{湿気|しっけ}を{吸|す}い、{乾燥|かんそう}{時|じ}は{放出|ほうしゅつ}してくれます。',
    },
    {
        id: 'effect_03',
        category: 'effect',
        question: '{畳|たたみ}の{断熱|だんねつ}{性|せい}に{関|かん}する{特徴|とくちょう}として{正|ただ}しいのは？',
        options: ['{夏|なつ}は{暑|あつ}く{冬|ふゆ}は{寒|さむ}い', '{冬|ふゆ}{暖|あたた}かく{夏|なつ}{涼|すず}しい', '{年中|ねんじゅう}{一定|いってい}の{温度|おんど}', '{断熱|だんねつ}{性|せい}はない'],
        correctIndex: 1,
        explanation: '{畳|たたみ}は{空気|くうき}を{多|おお}く{含|ふく}んでいるため{断熱|だんねつ}{性|せい}が{高|たか}く、{冬|ふゆ}は{暖|あたた}かく{夏|なつ}は{涼|すず}しく{過|す}ごせます。',
    },
    {
        id: 'effect_04',
        category: 'effect',
        question: '{畳|たたみ}が{音|おと}を{吸収|きゅうしゅう}する{効果|こうか}は{何|なん}と{呼|よ}ばれる？',
        options: ['{防音|ぼうおん}{効果|こうか}', '{吸音|きゅうおん}{効果|こうか}', '{反響|はんきょう}{効果|こうか}', '{消音|しょうおん}{効果|こうか}'],
        correctIndex: 1,
        explanation: '{畳|たたみ}には{多|おお}くの{空気|くうき}が{含|ふく}まれており、{音|おと}を{吸収|きゅうしゅう}する「{吸音|きゅうおん}{効果|こうか}」があります。{生活|せいかつ}{音|おん}を{和|やわ}らげてくれます。',
    },

    // い草の知識
    {
        id: 'knowledge_01',
        category: 'knowledge',
        question: '{い草|いぐさ}の{国内|こくない}{生産量|せいさんりょう}1{位|い}の{都道府県|とどうふけん}はどこ？',
        options: ['{福岡県|ふくおかけん}', '{熊本県|くまもとけん}', '{大分県|おおいたけん}', '{佐賀県|さがけん}'],
        correctIndex: 1,
        explanation: '{熊本県|くまもとけん}が{国内|こくない}{い草|いぐさ}{生産量|せいさんりょう}の{約|やく}9{割|わり}を{占|し}めています。{特|とく}に{八代市|やつしろし}が{有名|ゆうめい}な{産地|さんち}です。',
    },
    {
        id: 'knowledge_02',
        category: 'knowledge',
        question: '{熊本県|くまもとけん}の{い草|いぐさ}の{主|おも}な{産地|さんち}として{知|し}られる{市|し}は？',
        options: ['{熊本市|くまもとし}', '{八代市|やつしろし}', '{天草市|あまくさし}', '{阿蘇市|あそし}'],
        correctIndex: 1,
        explanation: '{八代市|やつしろし}は「{い草|いぐさ}の{里|さと}」として{知|し}られ、{国内|こくない}{最大|さいだい}の{い草|いぐさ}{産地|さんち}です。',
    },
    {
        id: 'knowledge_03',
        category: 'knowledge',
        question: '{高級|こうきゅう}{い草|いぐさ}の{品種|ひんしゅ}として{知|し}られるのは？',
        options: ['ひのみどり', 'こしひかり', 'あきたこまち', 'ゆめぴりか'],
        correctIndex: 0,
        explanation: '「ひのみどり」は{細|ほそ}くて{美|うつく}しい{高級|こうきゅう}{い草|いぐさ}の{品種|ひんしゅ}です。この{品種|ひんしゅ}を{使|つか}った{畳表|たたみおもて}は「ひのさらさ」というブランド{名|めい}で{知|し}られています。',
    },
    {
        id: 'knowledge_04',
        category: 'knowledge',
        question: '{高級|こうきゅう}{畳|たたみ}1{畳|じょう}に{使|つか}われる{い草|いぐさ}の{本数|ほんすう}は{約|やく}{何|なん}{本|ぼん}？',
        options: ['{約|やく}2000{本|ぼん}', '{約|やく}4000{本|ぼん}', '{約|やく}6000{本|ぼん}', '{約|やく}8000{本|ぼん}'],
        correctIndex: 3,
        explanation: '{高級|こうきゅう}{畳|たたみ}は1{畳|じょう}に{約|やく}8000{本|ぼん}もの{い草|いぐさ}を{使用|しよう}します。{密|みつ}に{織|お}り{込|こ}むほど{高品質|こうひんしつ}な{畳|たたみ}になります。',
    },
    {
        id: 'knowledge_05',
        category: 'knowledge',
        question: '{い草|いぐさ}はどうやって{増|ふ}やす？',
        options: ['{種|たね}まき', '{株|かぶ}{分|わ}け', '{挿|さ}し{木|き}', '{接|つ}ぎ{木|き}'],
        correctIndex: 1,
        explanation: '{い草|いぐさ}は{種|たね}ではなく「{株|かぶ}{分|わ}け」で{増|ふ}やします。{親|おや}{株|かぶ}から{苗|なえ}を{分|わ}けて{植|う}え{付|つ}けます。',
    },
    {
        id: 'knowledge_06',
        category: 'knowledge',
        question: '{い草|いぐさ}の{収穫|しゅうかく}に{適|てき}した{時間|じかん}{帯|たい}は？',
        options: ['{正午|しょうご}', '{深夜|しんや}', '{早朝|そうちょう}や{夕方|ゆうがた}', 'いつでも{同|おな}じ'],
        correctIndex: 2,
        explanation: '{い草|いぐさ}は{鮮度|せんど}が{命|いのち}！{暑|あつ}い{時間|じかん}{帯|たい}に{刈|か}ると{色|いろ}・{香|かお}りが{落|お}ちるため、{気温|きおん}の{低|ひく}い{早朝|そうちょう}や{夕方|ゆうがた}に{収穫|しゅうかく}します。',
    },
    {
        id: 'knowledge_07',
        category: 'knowledge',
        question: '{畳|たたみ}の{良|い}い{香|かお}りを{出|だ}すために{収穫|しゅうかく}{後|ご}に{行|おこな}う{作業|さぎょう}は？',
        options: ['{天日干|てんぴぼ}し', '{泥|どろ}{染|ぞ}め', '{塩漬|しおづ}け', '{煮沸|しゃふつ}'],
        correctIndex: 1,
        explanation: '{収穫|しゅうかく}{後|ご}すぐに「{泥|どろ}{染|ぞ}め」を{行|おこな}います。{天然|てんねん}{染土|せんど}で{染|そ}めることで、{畳|たたみ}{独特|どくとく}の{色|いろ}・{香|かお}り・{光沢|こうたく}が{生|う}まれます。',
    },

    // 畳の歴史
    {
        id: 'history_01',
        category: 'history',
        question: '{畳|たたみ}の{原型|げんけい}（筵/むしろ）が{使|つか}われ{始|はじ}めたのは{何|なに}{時代|じだい}？',
        options: ['{弥生|やよい}{時代|じだい}', '{縄文|じょうもん}{時代|じだい}', '{古墳|こふん}{時代|じだい}', '{飛鳥|あすか}{時代|じだい}'],
        correctIndex: 1,
        explanation: '{縄文|じょうもん}{時代|じだい}には{既|すで}に筵（むしろ）が{使|つか}われていました。これが{畳|たたみ}の{原型|げんけい}とされています。',
    },
    {
        id: 'history_02',
        category: 'history',
        question: '{貴族|きぞく}が{現代|げんだい}に{近|ちか}い{形|かたち}の{畳|たたみ}を{使|つか}い{始|はじ}めたのは{何|なに}{時代|じだい}？',
        options: ['{奈良|なら}{時代|じだい}', '{平安|へいあん}{時代|じだい}', '{鎌倉|かまくら}{時代|じだい}', '{室町|むろまち}{時代|じだい}'],
        correctIndex: 1,
        explanation: '{平安|へいあん}{時代|じだい}になると、{貴族|きぞく}の{間|あいだ}で{現代|げんだい}に{近|ちか}い{形|かたち}の{畳|たたみ}が{使|つか}われるようになりました。',
    },
    {
        id: 'history_03',
        category: 'history',
        question: '{庶民|しょみん}に{畳|たたみ}が{広|ひろ}く{普及|ふきゅう}したのはいつ{頃|ごろ}？',
        options: ['{鎌倉|かまくら}{時代|じだい}', '{室町|むろまち}{時代|じだい}', '{安土|あづち}{桃山|ももやま}{時代|じだい}', '{江戸|えど}{時代|じだい}{中期|ちゅうき}{以降|いこう}'],
        correctIndex: 3,
        explanation: '{江戸|えど}{時代|じだい}{中期|ちゅうき}{以降|いこう}になって、{畳|たたみ}は{庶民|しょみん}の{家|いえ}にも{普及|ふきゅう}しました。それまでは{上流|じょうりゅう}{階級|かいきゅう}のものでした。',
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
