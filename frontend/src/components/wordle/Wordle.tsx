"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Keyboard } from "../keyboard/Keyboard";
import { WalletSelector } from "../WalletSelector";
import Confetti from "../Confetti";
import Link from "next/link";

type LetterState = "correct" | "present" | "absent" | "empty" | "unused";

interface Letter {
    letter: string;
    state: LetterState;
}

const WORDS = ["CRANE"];

export function Wordle() {
    const { address, isConnected } = useAccount();
    const [guesses, setGuesses] = useState<Letter[][]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [targetWord, setTargetWord] = useState<string>("");
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [gameWon, setGameWon] = useState<boolean>(false);
    const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
    const [inputValue, setInputValue] = useState<string>("");
    const [animatingRow, setAnimatingRow] = useState<number | null>(null);

    // Check wallet connection first
    if (!isConnected || !address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
                <h1 className="text-4xl font-bold mb-8">CRYPTLE</h1>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">
                        Wallet Required
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Please connect your wallet to play CRYPTLE
                    </p>
                    <WalletSelector />
                </div>
            </div>
        );
    }

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
    // inputValue ile de submit edilebilsin
    const guessToSubmit = inputValue.length === 5 ? inputValue : currentGuess;
    if (guessToSubmit.length !== 5 || guesses.length >= 6) return;

        const newGuess: Letter[] = guessToSubmit
            .split("")
            .map((letter, index) => ({
                letter: letter.toUpperCase(),
                state: getLetterState(
                    letter.toUpperCase(),
                    index,
                    guessToSubmit
                ),
            }));

        setGuesses(prev => {
            setAnimatingRow(prev.length); // yeni eklenen satırın index'i
            return [...prev, newGuess];
        });
        updateLetterStates(newGuess);

        setTimeout(() => {
            if (guessToSubmit.toUpperCase() === targetWord) {
                setGameWon(true);
                setGameOver(true);
            } else if (guesses.length === 5) {
                setGameOver(true);
            }
            setAnimatingRow(null);
        }, 5 * 120); // 5 harf * 120ms gecikme

        setCurrentGuess("");
        setInputValue("");
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
                return "bg-gray-700";
            default:
                return "bg-gray-800";
        }
    };

    const renderGrid = () => {
        const rows = [];
        // Render completed guesses
        for (let i = 0; i < guesses.length; i++) {
            const isAnimating = i === animatingRow;
            rows.push(
                <div key={i} className="flex gap-2">
                    {guesses[i].map((letter, j) => (
                        isAnimating ? (
                            <motion.div
                                key={j}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1.1 }}
                                transition={{ delay: j * 0.12, duration: 0.32, type: "spring" }}
                                className={`w-16 h-16 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#2c3443] ${getCellColor(
                                    letter.state
                                )}`}
                                style={{ willChange: "opacity, transform" }}
                            >
                                {letter.letter}
                            </motion.div>
                        ) : (
                            <div
                                key={j}
                                className={`w-16 h-16 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#2c3443] ${getCellColor(
                                    letter.state
                                )}`}
                            >
                                {letter.letter}
                            </div>
                        )
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
                        className="w-16 h-16 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#2c3443] bg-[#232b39]"
                    >
                        {letter}
                    </div>
                );
            }
            rows.push(
                <div key="current" className="flex gap-2">
                    {currentRow}
                </div>
            );
        }
        // Render empty rows
        for (let i = guesses.length + (gameOver ? 0 : 1); i < 6; i++) {
            rows.push(
                <div key={i} className="flex gap-2">
                    {Array.from({ length: 5 }, (_, j) => (
                        <div
                            key={j}
                            className="w-16 h-16 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#2c3443] bg-[#232b39]"
                        ></div>
                    ))}
                </div>
            );
        }
        return rows;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#151a23] text-white px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">Word of the Day</h1>
            <p className="text-slate-300 text-lg mb-8 text-center">Guess the hidden word in 6 tries.</p>

            <div className="mb-8">
                <div className="flex flex-col gap-2">
                    {renderGrid()}
                </div>
            </div>

            <div className="text-center mb-6">
                <span className="text-slate-400 text-base">Attempts remaining: </span>
                <span className="text-white text-lg font-bold">{6 - guesses.length}</span>
            </div>

            {gameOver && (
                <div className="flex flex-col items-center justify-center mb-8">
                    {gameWon ? (
                        <>
                            <Confetti />
                            <motion.h2
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                transition={{ type: "spring", duration: 0.7 }}
                                className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 drop-shadow-lg mb-4"
                            >
                                Congratulations!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-xl text-slate-200 mb-6"
                            >
                                You found the word!
                            </motion.p>
                        </>
                    ) : (
                        <>
                            <motion.h2
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", duration: 0.7 }}
                                className="text-4xl font-extrabold text-red-500 mb-4 drop-shadow-lg"
                            >
                                Game Over
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-lg text-slate-300 mb-2"
                            >
                                The word was: <span className="text-yellow-400 font-bold">{targetWord}</span>
                            </motion.p>
                        </>
                    )}
                    <Link href="/leaderboard">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:scale-105 hover:from-cyan-400 hover:to-blue-500 transition"
                        >
                            View Leaderboard
                        </motion.button>
                    </Link>
                </div>
            )}

            <div className="mt-4">
                <Keyboard
                    onKeyPress={handleKeyPress}
                    letterStates={letterStates}
                />
            </div>

            <div className="text-sm text-gray-400 mt-4 text-center">
                <p>Green = correct position, Yellow = wrong position, Gray = not in word</p>
            </div>
        </div>
    );
}