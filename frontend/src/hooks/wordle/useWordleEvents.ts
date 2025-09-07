import { useMemo } from "react";
import {
    useContractEventSubscription,
    useContractEventHandlers,
} from "../useContractEventSubscription";
import { ContractEvent } from "@/types/contracts";

/**
 * Hook for SimpleWordle contract event subscriptions
 * Handles all game-related events
 */
export function useWordleEvents() {
    // Get all GameCreated events
    const gameCreatedEvents = useContractEventSubscription(
        "SimpleWordle",
        "GameCreated"
    );

    // Get all WordSeeded events
    const wordSeededEvents = useContractEventSubscription(
        "SimpleWordle",
        "WordSeeded"
    );

    // Get all GuessSubmitted events
    const guessSubmittedEvents = useContractEventSubscription(
        "SimpleWordle",
        "GuessSubmitted"
    );

    // Get all GameResolved events
    const gameResolvedEvents = useContractEventSubscription(
        "SimpleWordle",
        "GameResolved"
    );

    // Get all OracleUpdated events
    const oracleUpdatedEvents = useContractEventSubscription(
        "SimpleWordle",
        "OracleUpdated"
    );

    // Process game created events into a more usable format
    const gamesCreated = useMemo(() => {
        return gameCreatedEvents.map((event) => ({
            gameId: event.args?.id?.toString() || "0",
            player: event.args?.player || "",
            duration: event.args?.duration?.toString() || "0",
            txHash: event.transactionHash || "",
            timestamp: event.timestamp || new Date(),
            blockNumber: event.blockNumber,
        }));
    }, [gameCreatedEvents]);

    // Process word seeded events
    const wordsSeeded = useMemo(() => {
        return wordSeededEvents.map((event) => ({
            gameId: event.args?.id?.toString() || "0",
            wordHash: event.args?.wordHash || "",
            txHash: event.transactionHash || "",
            timestamp: event.timestamp || new Date(),
            blockNumber: event.blockNumber,
        }));
    }, [wordSeededEvents]);

    // Process guess submitted events
    const guessesSubmitted = useMemo(() => {
        return guessSubmittedEvents.map((event) => ({
            gameId: event.args?.id?.toString() || "0",
            player: event.args?.player || "",
            guess: event.args?.guess || "",
            correct: event.args?.correct || false,
            guessCount: event.args?.guessCount?.toString() || "0",
            txHash: event.transactionHash || "",
            timestamp: event.timestamp || new Date(),
            blockNumber: event.blockNumber,
        }));
    }, [guessSubmittedEvents]);

    // Process game resolved events
    const gamesResolved = useMemo(() => {
        return gameResolvedEvents.map((event) => ({
            gameId: event.args?.id?.toString() || "0",
            won: event.args?.won || false,
            usedGuesses: event.args?.usedGuesses?.toString() || "0",
            txHash: event.transactionHash || "",
            timestamp: event.timestamp || new Date(),
            blockNumber: event.blockNumber,
        }));
    }, [gameResolvedEvents]);

    // Process oracle updated events
    const oracleUpdates = useMemo(() => {
        return oracleUpdatedEvents.map((event) => ({
            oracle: event.args?.oracle || "",
            txHash: event.transactionHash || "",
            timestamp: event.timestamp || new Date(),
            blockNumber: event.blockNumber,
        }));
    }, [oracleUpdatedEvents]);

    return {
        gamesCreated,
        wordsSeeded,
        guessesSubmitted,
        gamesResolved,
        oracleUpdates,
        // Raw events if needed
        gameCreatedEvents,
        wordSeededEvents,
        guessSubmittedEvents,
        gameResolvedEvents,
        oracleUpdatedEvents,
    };
}

/**
 * Hook for real-time Wordle game notifications
 */
export function useWordleNotifications(
    onGameCreated?: (event: ContractEvent) => void,
    onWordSeeded?: (event: ContractEvent) => void,
    onGuessSubmitted?: (event: ContractEvent) => void,
    onGameResolved?: (event: ContractEvent) => void,
    onOracleUpdated?: (event: ContractEvent) => void
) {
    useContractEventHandlers("SimpleWordle", {
        GameCreated: (event) => {
            console.log("New game created:", event.args);
            onGameCreated?.(event);
        },
        WordSeeded: (event) => {
            console.log("Word seeded for game:", event.args);
            onWordSeeded?.(event);
        },
        GuessSubmitted: (event) => {
            console.log("Guess submitted:", event.args);
            onGuessSubmitted?.(event);
        },
        GameResolved: (event) => {
            console.log("Game resolved:", event.args);
            onGameResolved?.(event);
        },
        OracleUpdated: (event) => {
            console.log("Oracle updated:", event.args);
            onOracleUpdated?.(event);
        },
    });
}

/**
 * Hook to get events for a specific game
 */
export function useGameEvents(gameId: number) {
    const { gamesCreated, wordsSeeded, guessesSubmitted, gamesResolved } =
        useWordleEvents();

    const gameEvents = useMemo(() => {
        const gameIdStr = gameId.toString();

        return {
            gameCreated: gamesCreated.find(
                (event) => event.gameId === gameIdStr
            ),
            wordSeeded: wordsSeeded.find((event) => event.gameId === gameIdStr),
            guessesSubmitted: guessesSubmitted.filter(
                (event) => event.gameId === gameIdStr
            ),
            gameResolved: gamesResolved.find(
                (event) => event.gameId === gameIdStr
            ),
        };
    }, [gameId, gamesCreated, wordsSeeded, guessesSubmitted, gamesResolved]);

    return gameEvents;
}
