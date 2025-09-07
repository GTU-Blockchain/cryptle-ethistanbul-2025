"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { Keyboard } from "../keyboard/Keyboard";
import { WalletSelector } from "../WalletSelector";
import { isValidWord } from "@/lib/words";
import { Words } from "@/lib/word-list";
import Confetti from "react-confetti";
import { useWordleContract } from "@/hooks/wordle/useWordleContract";
import { useWordleEvents } from "@/hooks/wordle/useWordleEvents";
import { keccak256, toUtf8Bytes } from "ethers";
import { parseEther, formatEther } from "viem";

type LetterState = "correct" | "present" | "absent" | "empty" | "unused";

interface Letter {
    letter: string;
    state: LetterState;
}

export function Wordle() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const {
        createGame,
        seedWordHash,
        submitGuess: submitGuessContract,
    } = useWordleContract();
    const { gamesCreated, wordsSeeded, guessesSubmitted, gamesResolved } =
        useWordleEvents();

    const [guesses, setGuesses] = useState<Letter[][]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>("");
    const [targetWord, setTargetWord] = useState<string>("");
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [gameWon, setGameWon] = useState<boolean>(false);
    const [letterStates, setLetterStates] = useState<
        Record<string, LetterState>
    >({});
    const [inputValue, setInputValue] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [gameId, setGameId] = useState<string | null>(null);
    const [wordSeeded, setWordSeeded] = useState<boolean>(false);
    const [stakeAmount, setStakeAmount] = useState<string>("0.001");
    const [gameMode, setGameMode] = useState<"setup" | "playing">("setup");
    const [isCreating, setIsCreating] = useState<boolean>(false);

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

    // Listen for game created events to get the real game ID
    useEffect(() => {
        if (!isConnected || !address) return;

        if (gamesCreated.length > 0) {
            // Get the most recent game created by this player
            const latestGame = gamesCreated
                .filter(
                    (game) =>
                        game.player &&
                        typeof game.player === "string" &&
                        game.player.toLowerCase() === address?.toLowerCase()
                )
                .sort((a, b) => {
                    const aBlock = Number(a.blockNumber) || 0;
                    const bBlock = Number(b.blockNumber) || 0;
                    return bBlock - aBlock;
                })[0];

            if (latestGame && latestGame.gameId !== gameId) {
                console.log("New game ID received:", latestGame.gameId);
                setGameId(latestGame.gameId);
                setGameMode("playing");
                setIsCreating(false);
            }
        }
    }, [gamesCreated, address, gameId, isConnected]);

    // Handle game creation
    const handleCreateGame = async () => {
        if (isCreating) return;

        setIsCreating(true);
        try {
            // Check balance before creating game
            if (balance) {
                const balanceInEth = parseFloat(formatEther(balance.value));
                const stakeInEth = parseFloat(stakeAmount);
                console.log(
                    `Balance: ${balanceInEth} ETH, Stake: ${stakeInEth} ETH`
                );

                if (balanceInEth < stakeInEth) {
                    console.error("Insufficient balance");
                    setErrorMessage("Insufficient balance for stake");
                    setTimeout(() => setErrorMessage(""), 3000);
                    setIsCreating(false);
                    return;
                }
            }

            // Reset word seeded state for new game
            setWordSeeded(false);

            // Select random word
            const randomWord = Words[Math.floor(Math.random() * Words.length)];
            setTargetWord(randomWord);
            console.log("Target word:", randomWord); // For debugging

            // Create game on contract with stake
            const createGameTx = await createGame(300, stakeAmount); // 5 minutes duration
            console.log("Game created:", createGameTx);

            // Game ID will be set by the event listener above
        } catch (error) {
            console.error("Error starting game:", error);
            setErrorMessage("Failed to start game");
            setTimeout(() => setErrorMessage(""), 3000);
            setIsCreating(false);
        }
    };

    // Seed word hash when game ID is available
    useEffect(() => {
        if (!isConnected || !address) return;

        const seedWord = async () => {
            if (gameId && targetWord && !wordSeeded) {
                try {
                    // Generate word hash and seed it
                    const wordHash = keccak256(toUtf8Bytes(targetWord));
                    console.log("Word hash:", wordHash);

                    // Seed the word hash
                    const seedTx = await seedWordHash(
                        parseInt(gameId),
                        wordHash
                    );
                    console.log("Word seeded:", seedTx);
                    setWordSeeded(true);
                } catch (error) {
                    console.error("Error seeding word:", error);
                    setErrorMessage("Failed to seed word");
                    setTimeout(() => setErrorMessage(""), 3000);
                }
            }
        };

        seedWord();
    }, [gameId, targetWord, wordSeeded, seedWordHash, isConnected, address]);

    // Listen for game resolution events
    useEffect(() => {
        if (!gameId) return;

        const resolvedGame = gamesResolved.find(
            (event) => event.gameId === gameId
        );

        if (resolvedGame) {
            setGameOver(true);
            if (resolvedGame.won) {
                setGameWon(true);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            } else {
                setGameWon(false);
            }
        }
    }, [gameId, gamesResolved]);

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
        // Check wallet connection first
        if (!isConnected || !address) {
            setErrorMessage("Wallet not connected!");
            setTimeout(() => setErrorMessage(""), 2000);
            return;
        }

        // inputValue ile de submit edilebilsin
        const guessToSubmit =
            inputValue.length === 5 ? inputValue : currentGuess;
        if (guessToSubmit.length !== 5 || guesses.length >= 6) return;

        // Check if we have a valid game ID
        if (!gameId || gameId === "0") {
            setErrorMessage("Game not ready yet. Please wait...");
            setTimeout(() => setErrorMessage(""), 2000);
            return;
        }

        // Check if the word is valid
        if (!isValidWord(guessToSubmit)) {
            setErrorMessage("Not a valid word!");
            setTimeout(() => setErrorMessage(""), 2000); // Clear error after 2 seconds
            return;
        }

        // Clear any previous error
        setErrorMessage("");

        try {
            // Submit guess to contract
            const submitTx = await submitGuessContract(
                parseInt(gameId),
                guessToSubmit.toUpperCase()
            );
            console.log("Guess submitted:", submitTx);

            // Wait for transaction to be mined
            // TODO: Wait for transaction receipt and get result
        } catch (error) {
            console.error("Error submitting guess:", error);
            setErrorMessage("Failed to submit guess");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

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

        setGuesses([...guesses, newGuess]);
        updateLetterStates(newGuess);

        if (guessToSubmit.toUpperCase() === targetWord) {
            setGameWon(true);
            setGameOver(true);
            setShowConfetti(true);
            // Stop confetti after 5 seconds
            setTimeout(() => setShowConfetti(false), 5000);
        } else if (guesses.length === 5) {
            setGameOver(true);
        }

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

    // Show setup mode if not playing yet
    if (gameMode === "setup") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#151a23] text-white p-8">
                <h1 className="text-4xl font-bold mb-8">CRYPTLE</h1>

                <div className="bg-[#232b39] p-8 rounded-2xl max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Start New Game 🎮
                    </h2>

                    <div className="mb-6">
                        <label className="block text-slate-300 mb-2">
                            Stake Amount (ETH)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            className="w-full bg-gray-800 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.001"
                        />
                        <p className="text-sm text-slate-400 mt-1">
                            Minimum: 0.001 ETH
                        </p>
                        {balance && (
                            <p className="text-sm text-slate-400 mt-1">
                                Balance: {formatEther(balance.value)} ETH
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">Prize Structure:</p>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li>• Win: Get stake back + 50% bonus</li>
                            <li>• Lose: Lose your stake</li>
                            <li>• 5 minute time limit</li>
                            <li>• 6 guesses maximum</li>
                        </ul>
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                        <div className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg text-center font-semibold">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        onClick={handleCreateGame}
                        disabled={
                            isCreating ||
                            parseFloat(stakeAmount) < 0.001 ||
                            (balance &&
                                parseFloat(formatEther(balance.value)) <
                                    parseFloat(stakeAmount))
                        }
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-colors"
                    >
                        {isCreating
                            ? "Creating Game..."
                            : `Start Game & Stake ${stakeAmount} ETH`}
                    </button>
                </div>
            </div>
        );
    }

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
                Word of the Day
            </h1>
            <p className="text-slate-300 text-lg mb-8 text-center">
                Guess the hidden word in 6 tries.
            </p>
            <p className="text-emerald-400 text-lg mb-4 text-center">
                Stake: {stakeAmount} ETH | Prize:{" "}
                {(parseFloat(stakeAmount) * 1.5).toFixed(3)} ETH
            </p>

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
                        🎉 Congratulations! You won!
                    </p>
                    <p className="text-slate-300 text-lg mb-2">
                        The word was:{" "}
                        <span className="font-bold text-emerald-300">
                            {targetWord}
                        </span>
                    </p>
                    <p className="text-yellow-400 text-lg font-bold">
                        You won {(parseFloat(stakeAmount) * 1.5).toFixed(3)}{" "}
                        ETH!
                    </p>
                    <p className="text-slate-400 text-sm">
                        (Your stake: {stakeAmount} ETH + 50% bonus)
                    </p>
                </div>
            )}

            {gameOver && !gameWon && (
                <div className="text-center mb-8">
                    <p className="text-red-400 text-2xl font-bold mb-2">
                        😔 You Lost!
                    </p>
                    <p className="text-slate-300 text-lg mb-2">
                        The word was:{" "}
                        <span className="font-bold text-red-300">
                            {targetWord}
                        </span>
                    </p>
                    <p className="text-red-300 text-sm">
                        You lost your stake of {stakeAmount} ETH
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
