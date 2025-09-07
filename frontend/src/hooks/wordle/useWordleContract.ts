import { useCallback } from "react";
import { parseEther } from "viem";
import { createContractHook } from "../useContractFactory";

// Create the base hook using the factory
const useBaseWordle = createContractHook("SimpleWordle", { isPayable: true });

/**
 * Custom hook for SimpleWordle contract interactions
 * Built on top of the generic contract factory
 *
 * This demonstrates how to create contract-specific hooks with
 * type-safe methods and business logic for Wordle game
 */
export function useWordleContract() {
    const { read, write, isLoading } = useBaseWordle();

    // Read functions with proper typing
    const getGame = useCallback(
        async (gameId: number): Promise<any> => {
            return await read("getGame", [gameId]);
        },
        [read]
    );

    const getTimeLeft = useCallback(
        async (gameId: number): Promise<number> => {
            const timeLeft = (await read("timeLeft", [gameId])) as bigint;
            return Number(timeLeft);
        },
        [read]
    );

    const getNextGameId = useCallback(async (): Promise<number> => {
        const nextId = (await read("nextGameId")) as bigint;
        return Number(nextId);
    }, [read]);

    const getOwner = useCallback(async (): Promise<string> => {
        return (await read("owner")) as string;
    }, [read]);

    const getOracle = useCallback(async (): Promise<string> => {
        return (await read("oracle")) as string;
    }, [read]);

    const getWordLength = useCallback(async (): Promise<number> => {
        const wordLen = (await read("WORD_LEN")) as bigint;
        return Number(wordLen);
    }, [read]);

    const getMaxGuesses = useCallback(async (): Promise<number> => {
        const maxGuesses = (await read("MAX_GUESSES")) as bigint;
        return Number(maxGuesses);
    }, [read]);

    // Match read functions
    const getMatch = useCallback(
        async (matchId: number): Promise<any> => {
            return await read("getMatch", [matchId]);
        },
        [read]
    );

    const getMatchTimeLeft = useCallback(
        async (matchId: number): Promise<number> => {
            const timeLeft = (await read("getMatchTimeLeft", [
                matchId,
            ])) as bigint;
            return Number(timeLeft);
        },
        [read]
    );

    const getNextMatchId = useCallback(async (): Promise<number> => {
        const nextId = (await read("nextMatchId")) as bigint;
        return Number(nextId);
    }, [read]);

    // Write functions with proper typing
    const createGame = useCallback(
        async (durationSeconds: number = 60) => {
            return await write("createGame", [durationSeconds]);
        },
        [write]
    );

    const seedWordHash = useCallback(
        async (gameId: number, wordHash: string) => {
            return await write("seedWordHash", [gameId, wordHash]);
        },
        [write]
    );

    const submitGuess = useCallback(
        async (gameId: number, guess: string) => {
            return await write("submitGuess", [gameId, guess]);
        },
        [write]
    );

    const createGameForPlayer = useCallback(
        async (player: string, durationSeconds: number = 60) => {
            return await write("createGameForPlayer", [
                player,
                durationSeconds,
            ]);
        },
        [write]
    );

    const createGameWithWord = useCallback(
        async (player: string, durationSeconds: number, wordHash: string) => {
            return await write("createGameWithWord", [
                player,
                durationSeconds,
                wordHash,
            ]);
        },
        [write]
    );

    const batchCreateGames = useCallback(
        async (
            players: string[],
            durationSeconds: number,
            wordHashes: string[]
        ) => {
            return await write("batchCreateGames", [
                players,
                durationSeconds,
                wordHashes,
            ]);
        },
        [write]
    );

    // Match write functions
    const createMatch = useCallback(
        async (durationSeconds: number = 300, stakeAmount: string) => {
            // Convert ETH to Wei using viem's parseEther
            const stakeInWei = parseEther(stakeAmount);
            return await write("createMatch", [durationSeconds], {
                value: stakeInWei,
            });
        },
        [write]
    );

    const joinMatch = useCallback(
        async (matchId: number, stakeAmount: string) => {
            // Convert ETH to Wei using viem's parseEther
            const stakeInWei = parseEther(stakeAmount);
            return await write("joinMatch", [matchId], {
                value: stakeInWei,
            });
        },
        [write]
    );

    const seedMatchWord = useCallback(
        async (matchId: number, wordHash: string) => {
            return await write("seedMatchWord", [matchId, wordHash]);
        },
        [write]
    );

    const submitMatchGuess = useCallback(
        async (matchId: number, guess: string) => {
            return await write("submitMatchGuess", [matchId, guess]);
        },
        [write]
    );

    // Admin functions (only owner)
    const setOracle = useCallback(
        async (oracleAddress: string) => {
            return await write("setOracle", [oracleAddress]);
        },
        [write]
    );

    return {
        // State
        isLoading,

        // Read functions
        getGame,
        getTimeLeft,
        getNextGameId,
        getOwner,
        getOracle,
        getWordLength,
        getMaxGuesses,

        // Match read functions
        getMatch,
        getMatchTimeLeft,
        getNextMatchId,

        // Write functions
        createGame,
        seedWordHash,
        submitGuess,
        createGameForPlayer,
        createGameWithWord,
        batchCreateGames,

        // Match write functions
        createMatch,
        joinMatch,
        seedMatchWord,
        submitMatchGuess,

        // Admin functions
        setOracle,
    };
}
