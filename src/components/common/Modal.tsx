import { ReactNode, useEffect } from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
}: ModalProps) {
    // ESCキーで閉じる
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
                {(title || showCloseButton) && (
                    <div className="modal-header">
                        {title && <h3 className="modal-title">{title}</h3>}
                        {showCloseButton && onClose && (
                            <button className="modal-close" onClick={onClose}>
                                ✕
                            </button>
                        )}
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
