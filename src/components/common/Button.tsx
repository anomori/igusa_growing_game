import { ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        disabled ? 'btn-disabled' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled} {...props}>
            {children}
        </button>
    );
}
