import './ProgressBar.css';

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    size?: 'small' | 'medium' | 'large';
    unit?: string;
}

export function ProgressBar({
    value,
    max = 100,
    label,
    showValue = false,
    color = 'primary',
    size = 'medium',
    unit = '',
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`progress-container progress-${size}`}>
            {label && <span className="progress-label">{label}</span>}
            <div className="progress-track">
                <div
                    className={`progress-fill progress-${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue && (
                <span className="progress-value">
                    {value}/{max}{unit}
                </span>
            )}
        </div>
    );
}
