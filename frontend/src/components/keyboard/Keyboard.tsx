"use client";

type LetterState = "correct" | "present" | "absent" | "empty" | "unused";

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    letterStates: Record<string, LetterState>;
}

export function Keyboard({ onKeyPress, letterStates }: KeyboardProps) {
    const getKeyColor = (letter: string) => {
        const state = letterStates[letter];
        switch (state) {
            case "correct":
                return "bg-green-600 text-white";
            case "present":
                return "bg-yellow-500 text-white";
            case "absent":
                return "bg-gray-600 text-white";
            default:
                return "bg-gray-800 text-white";
        }
    };

    const topRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    const middleRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    const bottomRow = ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"];

    const renderKey = (key: string) => {
        const isSpecialKey = key === "ENTER" || key === "BACKSPACE";
        const keyWidth = isSpecialKey ? "w-16" : "w-8";
        const keyHeight = "h-10";

        return (
            <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`${keyWidth} ${keyHeight} flex items-center justify-center text-sm font-bold rounded border border-gray-600 hover:bg-gray-700 transition-colors ${getKeyColor(
                    key
                )}`}
            >
                {key === "BACKSPACE" ? (
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    key
                )}
            </button>
        );
    };

    return (
        <div className="flex flex-col items-center gap-1">
            {/* Top Row */}
            <div className="flex gap-1">{topRow.map(renderKey)}</div>

            {/* Middle Row */}
            <div className="flex gap-1">{middleRow.map(renderKey)}</div>

            {/* Bottom Row */}
            <div className="flex gap-1">{bottomRow.map(renderKey)}</div>
        </div>
    );
}
