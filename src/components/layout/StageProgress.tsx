import { StatusIcon } from '../common/StatusIcon';
import { STAGES, StageType } from '../../types/game';
import { useGame } from '../../context/GameContext';
import './StageProgress.css';

export function StageProgress() {
    const { state } = useGame();

    const getStageStatus = (stageType: StageType): 'completed' | 'current' | 'upcoming' => {
        const stageIndex = STAGES.findIndex(s => s.type === stageType);
        const currentIndex = STAGES.findIndex(s => s.type === state.currentStage);

        if (stageIndex < currentIndex || state.stageProgress[stageType].completed) {
            return 'completed';
        }
        if (stageIndex === currentIndex) {
            return 'current';
        }
        return 'upcoming';
    };

    return (
        <div className="stage-progress">
            <div className="stage-progress-track">
                {STAGES.map((stage, index) => {
                    const status = getStageStatus(stage.type);
                    return (
                        <div key={stage.type} className="stage-item-wrapper">
                            <div className={`stage-item stage-${status}`}>
                                <StatusIcon type={stage.type} size={24} />
                            </div>
                            {index < STAGES.length - 1 && (
                                <div className={`stage-connector ${status === 'completed' ? 'completed' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="stage-labels">
                {STAGES.map((stage) => {
                    const status = getStageStatus(stage.type);
                    return (
                        <span
                            key={stage.type}
                            className={`stage-label stage-label-${status}`}
                        >
                            {stage.name}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
