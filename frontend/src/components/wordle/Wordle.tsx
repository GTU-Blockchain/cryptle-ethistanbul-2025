"use client";

import { useState, useEffect } from "react";
import { Keyboard } from "../keyboard/Keyboard";

type LetterState = "correct" | "present" | "absent" | "empty" | "unused";

interface Letter {
    letter: string;
    state: LetterState;
}

const WORDS = ["CRANE"];

export function Wordle() {
    const [guesses, setGuesses] = useState<Letter[][]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [targetWord, setTargetWord] = useState<string>("");
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [gameWon, setGameWon] = useState<boolean>(false);
    const [letterStates, setLetterStates] = useState<
        Record<string, LetterState>
    >({});

    // Initialize game
    useEffect(() => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
        console.log("Target word:", randomWord); // For debugging
    }, []);

    const getLetterState = (
        letter: string,
        position: number,
        guess: string
    ): LetterState => {
        if (targetWord[position] === letter) {
            return "correct";
        } else if (targetWord.includes(letter)) {
            return "present";
        } else {
            return "absent";
        }
    };

    const updateLetterStates = (newGuess: Letter[]) => {
        const newLetterStates = { ...letterStates };

        newGuess.forEach(({ letter, state }) => {
            const currentState = newLetterStates[letter];

            // Priority: correct > present > absent
            if (
                state === "correct" ||
                (state === "present" && currentState !== "correct") ||
                (state === "absent" && !currentState)
            ) {
                newLetterStates[letter] = state;
            }
        });

        setLetterStates(newLetterStates);
    };

    const submitGuess = () => {
        if (currentGuess.length !== 5 || guesses.length >= 6) return;

        const newGuess: Letter[] = currentGuess
            .split("")
            .map((letter, index) => ({
                letter: letter.toUpperCase(),
                state: getLetterState(
                    letter.toUpperCase(),
                    index,
                    currentGuess
                ),
            }));

        setGuesses([...guesses, newGuess]);
        updateLetterStates(newGuess);

        if (currentGuess.toUpperCase() === targetWord) {
            setGameWon(true);
            setGameOver(true);
        } else if (guesses.length === 5) {
            setGameOver(true);
        }

        setCurrentGuess("");
    };

    const handleKeyPress = (key: string) => {
        if (gameOver) return;

        if (key === "ENTER") {
            submitGuess();
        } else if (key === "BACKSPACE") {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (key.match(/[A-Z]/) && currentGuess.length < 5) {
            setCurrentGuess(currentGuess + key);
        }
    };

    const getCellColor = (state: LetterState) => {
        switch (state) {
            case "correct":
                return "bg-green-600";
            case "present":
                return "bg-yellow-500";
            case "absent":
                return "bg-gray-600";
            default:
                return "bg-gray-800";
        }
    };

    const renderGrid = () => {
        const rows = [];

        // Render completed guesses
        for (let i = 0; i < guesses.length; i++) {
            rows.push(
                <div key={i} className="flex gap-1">
                    {guesses[i].map((letter, j) => (
                        <div
                            key={j}
                            className={`w-12 h-12 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600 ${getCellColor(
                                letter.state
                            )}`}
                        >
                            {letter.letter}
                        </div>
                    ))}
                </div>
            );
        }

        // Render current guess
        if (guesses.length < 6 && !gameOver) {
            const currentRow = [];
            for (let i = 0; i < 5; i++) {
                const letter = currentGuess[i] || "";
                currentRow.push(
                    <div
                        key={i}
                        className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600 bg-gray-800"
                    >
                        {letter}
                    </div>
                );
            }
            rows.push(
                <div key="current" className="flex gap-1">
                    {currentRow}
                </div>
            );
        }

        // Render empty rows
        for (let i = guesses.length + (gameOver ? 0 : 1); i < 6; i++) {
            rows.push(
                <div key={i} className="flex gap-1">
                    {Array.from({ length: 5 }, (_, j) => (
                        <div
                            key={j}
                            className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600 bg-gray-800"
                        ></div>
                    ))}
                </div>
            );
        }

        return rows;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
            <h1 className="text-4xl font-bold mb-8">CRYPTLE</h1>

            <div className="mb-8">{renderGrid()}</div>

            {gameOver && (
                <div className="text-center mb-8">
                    {gameWon ? (
                        <p className="text-green-500 text-xl font-bold">
                            Congratulations! You won!
                        </p>
                    ) : (
                        <p className="text-red-500 text-xl font-bold">
                            Game Over! The word was:{" "}
                            <span className="text-yellow-500">
                                {targetWord}
                            </span>
                        </p>
                    )}
                </div>
            )}

            <div className="mt-8">
                <Keyboard
                    onKeyPress={handleKeyPress}
                    letterStates={letterStates}
                />
            </div>

            <div className="text-sm text-gray-400 mt-4">
                <p>Type your guess and press Enter</p>
                <p>
                    Green = correct position, Yellow = wrong position, Gray =
                    not in word
                </p>
            </div>
        </div>
    );
}
