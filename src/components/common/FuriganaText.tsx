import React from 'react';

interface FuriganaTextProps {
    text: string;
}

/**
 * Parses text containing {Kanji|Furigana} format and renders it with <ruby> tags.
 * Example: "{漢字|かん}{字|じ}" -> <ruby>漢字<rt>かん</rt></ruby><ruby>字<rt>じ</rt></ruby>
 * Also supports nested brackets if needed, but primarily designed for {Base|Reading}.
 */
export const FuriganaText: React.FC<FuriganaTextProps> = ({ text }) => {
    // Regex to match {Kanji|Furigana} pattern
    const regex = /\{([^|]+)\|([^}]+)\}/g;

    // Split the text by the pattern
    const parts = text.split(regex);

    // If no matches, return text as is
    if (parts.length === 1) {
        return <>{text}</>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Use replace to iterate through matches and rebuild the string with React elements
    // We don't actually use the result of replace, just the callback to build elements
    text.replace(regex, (match, kanji, furigana, offset) => {
        // Push preceding text if any
        if (offset > lastIndex) {
            elements.push(text.substring(lastIndex, offset));
        }

        // Push ruby element
        elements.push(
            <ruby key={offset}>
                {kanji}
                <rt>{furigana}</rt>
            </ruby>
        );

        lastIndex = offset + match.length;
        return match;
    });

    // Push remaining text if any
    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }

    return <span>{elements}</span>;
};
