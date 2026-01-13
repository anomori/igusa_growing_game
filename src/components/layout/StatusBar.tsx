import { useGame } from '../../context/GameContext';
import { getStageByDay, getMoodByQP, STAGES } from '../../types/game';
import { IgusaChan } from '../character/IgusaChan';
import { FuriganaText } from '../common/FuriganaText';
import './StatusBar.css';

export function StatusBar() {
    const { state } = useGame();
    const currentStageInfo = getStageByDay(state.currentDay);
    const stageIndex = STAGES.findIndex(s => s.type === state.currentStage) + 1;
    const mood = getMoodByQP(state.qualityPoints, stageIndex);

    const getQPColor = () => {
        if (state.qualityPoints >= 120) return 'excellent';
        if (state.qualityPoints >= 90) return 'happy';
        if (state.qualityPoints >= 60) return 'normal';
        return 'sad';
    };

    return (
        <div className="status-bar">
            <div className="status-left">
                <span className="status-month">{currentStageInfo.month}</span>
                <span className="status-stage">（<FuriganaText text={currentStageInfo.name} />）</span>
            </div>
            <div className="status-center">
                <span className="status-day">{state.currentDay}/30</span>
            </div>
            <div className="status-right">
                <span className={`status-qp qp-${getQPColor()}`}>
                    QP: {state.qualityPoints}
                </span>
                <div className="status-character">
                    <IgusaChan mood={mood} size="small" stage={stageIndex} day={state.currentDay} />
                </div>
            </div>
        </div>
    );
}
