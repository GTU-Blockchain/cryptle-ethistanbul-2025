"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Keyboard } from "../keyboard/Keyboard";
import { isValidWord } from "@/lib/words";
import { Words } from "@/lib/word-list";
import Confetti from "react-confetti";
import { useWordleContract } from "@/hooks/wordle/useWordleContract";
import { useWordleEvents } from "@/hooks/wordle/useWordleEvents";
import { keccak256, toUtf8Bytes } from "ethers";

type LetterState = "correct" | "present" | "absent" | "empty" | "unused";

interface Letter {
    letter: string;
    state: LetterState;
}

interface Wordle1v1Props {
    matchId: string | null;
    stakeAmount: string;
}

export function Wordle1v1({ matchId, stakeAmount }: Wordle1v1Props) {
    const { address, isConnected } = useAccount();
    const {
        createMatch,
        joinMatch,
        seedMatchWord,
        submitMatchGuess: submitMatchGuessContract,
        getMatch,
    } = useWordleContract();
    const {
        matchesCreated,
        matchesJoined,
        matchGuessesSubmitted,
        matchesResolved,
    } = useWordleEvents();

    const [guesses, setGuesses] = useState<Letter[][]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [targetWord, setTargetWord] = useState<string>("");
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [gameWon, setGameWon] = useState<boolean>(false);
    const [letterStates, setLetterStates] = useState<
        Record<string, LetterState>
    >({});
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [isPlayer1, setIsPlayer1] = useState<boolean>(false);
    const [opponentGuesses, setOpponentGuesses] = useState<Letter[][]>([]);
    const [matchData, setMatchData] = useState<any>(null);
    const [wordSeeded, setWordSeeded] = useState<boolean>(false);

    // Check wallet connection first
    if (!isConnected || !address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
                <h1 className="text-4xl font-bold mb-8">CRYPTLE 1v1</h1>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">
                        Wallet Required
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Please connect your wallet to play CRYPTLE 1v1
                    </p>
                </div>
            </div>
        );
    }

    // Initialize match
    useEffect(() => {
        const initializeMatch = async () => {
            try {
                if (!matchId) return;

                // Get match data
                const match = await getMatch(parseInt(matchId));
                setMatchData(match);

                // Determine if player is player1 or player2
                const isP1 =
                    match.player1.toLowerCase() === address.toLowerCase();
                setIsPlayer1(isP1);

                // Select random word (same for both players)
                const randomWord =
                    Words[Math.floor(Math.random() * Words.length)];
                setTargetWord(randomWord);
                console.log("Target word:", randomWord);

                // Only seed if not already seeded
                if (!wordSeeded) {
                    const wordHash = keccak256(toUtf8Bytes(randomWord));
                    console.log("Word hash:", wordHash);

                    try {
                        await seedMatchWord(parseInt(matchId), wordHash);
                        console.log("Word seeded to contract");
                        setWordSeeded(true);
                    } catch (seedError) {
                        console.error("Error seeding word:", seedError);
                        // Don't fail the whole initialization if seeding fails
                    }
                }
            } catch (error) {
                console.error("Error initializing match:", error);
                setErrorMessage("Failed to initialize match");
                setTimeout(() => setErrorMessage(""), 3000);
            }
        };

        if (isConnected && address && matchId) {
            initializeMatch();
        }
    }, [isConnected, address, matchId, getMatch, seedMatchWord, wordSeeded]);

    // Listen for match events
    useEffect(() => {
        if (!matchId) return;

        const matchIdStr = matchId;

        // Listen for opponent guesses
        const opponentGuesses = matchGuessesSubmitted.filter(
            (event) =>
                event.matchId === matchIdStr &&
                event.player &&
                typeof event.player === "string" &&
                event.player.toLowerCase() !== address.toLowerCase()
        );

        if (opponentGuesses.length > 0) {
            const latestOpponentGuess =
                opponentGuesses[opponentGuesses.length - 1];
            // Update opponent's guesses display
            // TODO: Implement opponent guess display
        }

        // Listen for match resolution
        const resolvedMatch = matchesResolved.find(
            (event) => event.matchId === matchIdStr
        );

        if (resolvedMatch) {
            setGameOver(true);
            if (
                resolvedMatch.winner &&
                typeof resolvedMatch.winner === "string" &&
                resolvedMatch.winner.toLowerCase() === address.toLowerCase()
            ) {
                setGameWon(true);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        }
    }, [matchId, matchGuessesSubmitted, matchesResolved, address]);

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

    const submitGuess = async () => {
        if (currentGuess.length !== 5 || guesses.length >= 6 || !matchId)
            return;

        // Check if the word is valid
        if (!isValidWord(currentGuess)) {
            setErrorMessage("Not a valid word!");
            setTimeout(() => setErrorMessage(""), 2000);
            return;
        }

        // Clear any previous error
        setErrorMessage("");

        try {
            // Submit guess to contract
            await submitMatchGuessContract(
                parseInt(matchId),
                currentGuess.toUpperCase()
            );
        } catch (error) {
            console.error("Error submitting guess:", error);
            setErrorMessage("Failed to submit guess");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

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
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
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
                return "bg-gray-700";
            default:
                return "bg-gray-800";
        }
    };

    const renderGrid = () => {
        const rows = [];
        // Render completed guesses
        for (let i = 0; i < guesses.length; i++) {
            rows.push(
                <div key={i} className="flex gap-2">
                    {guesses[i].map((letter, j) => (
                        <div
                            key={j}
                            className={`w-16 h-16 flex items-center justify-center text-white font-bold text-2xl border-2 border-[#2c3443] ${getCellColor(
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
            {/* Confetti Animation */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                />
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">
                CRYPTLE 1v1 ⚔️
            </h1>
            <p className="text-slate-300 text-lg mb-4 text-center">
                First to solve wins {stakeAmount} ETH!
            </p>

            {/* Match Info */}
            <div className="bg-[#232b39] p-4 rounded-lg mb-6">
                <div className="flex gap-8 text-sm">
                    <div>
                        <span className="text-slate-400">Match ID:</span>
                        <span className="ml-2 font-mono">#{matchId}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">Stake:</span>
                        <span className="ml-2 text-emerald-400 font-bold">
                            {stakeAmount} ETH
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">You are:</span>
                        <span className="ml-2 text-blue-400 font-bold">
                            {isPlayer1 ? "Player 1" : "Player 2"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {errorMessage && (
                <div className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg text-center font-semibold">
                    {errorMessage}
                </div>
            )}

            <div className="mb-8">{renderGrid()}</div>

            {/* Game Over Messages */}
            {gameOver && gameWon && (
                <div className="text-center mb-8">
                    <p className="text-emerald-400 text-2xl font-bold mb-2">
                        🎉 You Won! 🎉
                    </p>
                    <p className="text-yellow-400 text-lg">
                        You won {stakeAmount} ETH!
                    </p>
                </div>
            )}

            {gameOver && !gameWon && (
                <div className="text-center mb-8">
                    <p className="text-red-400 text-2xl font-bold mb-2">
                        😔 You Lost!
                    </p>
                    <p className="text-slate-300 text-lg">
                        Better luck next time!
                    </p>
                </div>
            )}

            <div className="mt-4">
                <Keyboard
                    onKeyPress={handleKeyPress}
                    letterStates={letterStates}
                />
            </div>

            <div className="text-sm text-gray-400 mt-4 text-center">
                <p>
                    Green = correct position, Yellow = wrong position, Gray =
                    not in word
                </p>
            </div>
        </div>
    );
}
