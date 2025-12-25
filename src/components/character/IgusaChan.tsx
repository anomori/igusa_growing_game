import { CharacterMood } from '../../types/game';
import './IgusaChan.css';

interface IgusaChanProps {
    mood: CharacterMood;
    size?: 'small' | 'medium' | 'large';
    stage?: number; // 1-8 for growth stages
}

export function IgusaChan({ mood, size = 'medium', stage = 1 }: IgusaChanProps) {
    const getExpression = () => {
        switch (mood) {
            case 'excellent': return { eyes: '✨', mouth: '◡', blush: true };
            case 'happy': return { eyes: '◠', mouth: '◡', blush: false };
            case 'normal': return { eyes: '•', mouth: '―', blush: false };
            case 'sad': return { eyes: '•', mouth: '︵', blush: false };
        }
    };

    const getGrowthClass = () => {
        if (stage <= 2) return 'growth-seedling';
        if (stage <= 5) return 'growth-young';
        return 'growth-mature';
    };

    const expression = getExpression();

    return (
        <div className={`igusa-chan igusa-${size} ${getGrowthClass()} mood-${mood}`}>
            <div className="igusa-body">
                {/* 葉っぱ部分 */}
                <div className="igusa-leaves">
                    <div className="igusa-leaf leaf-left" />
                    <div className="igusa-leaf leaf-center" />
                    <div className="igusa-leaf leaf-right" />
                </div>

                {/* 顔部分 */}
                <div className="igusa-face">
                    {expression.blush && <div className="igusa-blush blush-left" />}
                    <div className="igusa-eyes">
                        <span className="igusa-eye eye-left">{expression.eyes}</span>
                        <span className="igusa-eye eye-right">{expression.eyes}</span>
                    </div>
                    <div className="igusa-mouth">{expression.mouth}</div>
                    {expression.blush && <div className="igusa-blush blush-right" />}
                </div>
            </div>

            {/* 輝きエフェクト */}
            {mood === 'excellent' && (
                <div className="igusa-sparkles">
                    <span className="sparkle">✦</span>
                    <span className="sparkle">✦</span>
                    <span className="sparkle">✦</span>
                </div>
            )}
        </div>
    );
}
