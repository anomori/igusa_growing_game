import { useState } from 'react';
import { Quiz } from '../../types/game';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import './QuizModal.css';

interface QuizModalProps {
    quiz: Quiz;
    isOpen: boolean;
    onAnswer: (correct: boolean) => void;
}

export function QuizModal({ quiz, isOpen, onAnswer }: QuizModalProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (index: number) => {
        if (showResult) return;
        setSelectedIndex(index);
    };

    const handleSubmit = () => {
        if (selectedIndex === null) return;
        setShowResult(true);
    };

    const handleClose = () => {
        const correct = selectedIndex === quiz.correctIndex;
        onAnswer(correct);
        // リセット
        setSelectedIndex(null);
        setShowResult(false);
    };

    const isCorrect = selectedIndex === quiz.correctIndex;

    return (
        <Modal isOpen={isOpen} title="📚 畳クイズ" showCloseButton={false}>
            <div className="quiz-content">
                <p className="quiz-question">{quiz.question}</p>

                <div className="quiz-options">
                    {quiz.options.map((option, index) => (
                        <button
                            key={index}
                            className={`quiz-option ${selectedIndex === index ? 'selected' : ''
                                } ${showResult
                                    ? index === quiz.correctIndex
                                        ? 'correct'
                                        : selectedIndex === index
                                            ? 'incorrect'
                                            : ''
                                    : ''
                                }`}
                            onClick={() => handleSelect(index)}
                            disabled={showResult}
                        >
                            <span className="option-letter">
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="option-text">{option}</span>
                        </button>
                    ))}
                </div>

                {showResult && (
                    <div className={`quiz-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <p className="result-label">
                            {isCorrect ? '🎉 正解！' : '😢 残念…'}
                        </p>
                        <p className="result-explanation">{quiz.explanation}</p>
                        {isCorrect && (
                            <p className="result-bonus">✨ +5 QP ゲット！</p>
                        )}
                    </div>
                )}

                <div className="quiz-actions">
                    {!showResult ? (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={selectedIndex === null}
                        >
                            回答する
                        </Button>
                    ) : (
                        <Button variant="success" fullWidth onClick={handleClose}>
                            次へ進む
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
