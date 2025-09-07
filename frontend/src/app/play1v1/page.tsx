"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { WalletSelector } from "@/components/WalletSelector";
import { Wordle1v1 } from "@/components/wordle/Wordle1v1";
import { useWordleContract } from "@/hooks/wordle/useWordleContract";
import { useWordleEvents } from "@/hooks/wordle/useWordleEvents";
import { keccak256, toUtf8Bytes } from "ethers";
import { Words } from "@/lib/word-list";
import { useSearchParams } from "next/navigation";
import { parseEther, formatEther } from "viem";

export default function Play1v1Page() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const { createMatch, joinMatch, seedMatchWord, getMatch } =
        useWordleContract();
    const { matchesCreated, matchesJoined, matchesResolved } =
        useWordleEvents();
    const searchParams = useSearchParams();
    const joinMatchId = searchParams.get("join");

    const [stakeAmount, setStakeAmount] = useState<string>("0.001");
    const [gameMode, setGameMode] = useState<
        "setup" | "waiting" | "playing" | "finished"
    >(joinMatchId ? "setup" : "setup");
    const [matchId, setMatchId] = useState<string | null>(joinMatchId);
    const [shareLink, setShareLink] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [matchResult, setMatchResult] = useState<{
        winner: string | null;
        prize: string | null;
        isDraw: boolean;
    } | null>(null);

    // Listen for match creation events to get the actual match ID
    useEffect(() => {
        if (!address || !isCreating) return;

        // Find the latest match created by this address
        const latestMatch = matchesCreated
            .filter(
                (match) =>
                    match.creator &&
                    typeof match.creator === "string" &&
                    match.creator.toLowerCase() === address.toLowerCase()
            )
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )[0];

        if (latestMatch && !matchId) {
            setMatchId(latestMatch.matchId);

            // Generate share link
            const link = `${window.location.origin}/play1v1?join=${latestMatch.matchId}`;
            setShareLink(link);

            setGameMode("waiting");
            setIsCreating(false);
        }
    }, [matchesCreated, address, isCreating, matchId]);

    // Listen for match join events
    useEffect(() => {
        if (!address || !matchId) return;

        // Check if someone joined this match (either current user or opponent)
        const matchJoined = matchesJoined.find(
            (join) => join.matchId === matchId
        );

        if (matchJoined) {
            // If current user joined (from join flow)
            if (
                isJoining &&
                matchJoined.joiner &&
                typeof matchJoined.joiner === "string" &&
                matchJoined.joiner.toLowerCase() === address.toLowerCase()
            ) {
                setGameMode("playing");
                setIsJoining(false);
            }
            // If opponent joined (from create flow)
            else if (
                gameMode === "waiting" &&
                matchJoined.joiner &&
                typeof matchJoined.joiner === "string" &&
                matchJoined.joiner.toLowerCase() !== address.toLowerCase()
            ) {
                setGameMode("playing");
            }
        }
    }, [matchesJoined, address, isJoining, matchId, gameMode]);

    // Listen for match resolution events
    useEffect(() => {
        if (!matchId) return;

        const resolvedMatch = matchesResolved.find(
            (event) => event.matchId === matchId
        );

        if (resolvedMatch) {
            setGameMode("finished");
            setMatchResult({
                winner: (resolvedMatch.winner as string) || null,
                prize: resolvedMatch.prize?.toString() || null,
                isDraw:
                    resolvedMatch.winner ===
                    "0x0000000000000000000000000000000000000000",
            });
        }
    }, [matchId, matchesResolved]);

    // Check match status directly from contract
    useEffect(() => {
        if (!matchId || !isConnected) return;

        const checkMatchStatus = async () => {
            try {
                const matchData = await getMatch(parseInt(matchId));

                if (matchData && matchData.resolved) {
                    setGameMode("finished");
                    setMatchResult({
                        winner: matchData.winner || null,
                        prize: matchData.stake
                            ? (
                                  parseFloat(matchData.stake.toString()) / 1e18
                              ).toString()
                            : null,
                        isDraw:
                            matchData.winner ===
                            "0x0000000000000000000000000000000000000000",
                    });
                }
            } catch (error) {
                console.error("Error checking match status:", error);
            }
        };

        checkMatchStatus();
    }, [matchId, isConnected, getMatch]);

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
                    <WalletSelector />
                </div>
            </div>
        );
    }

    const handleCreateMatch = async () => {
        if (isCreating) return;

        setIsCreating(true);
        try {
            // Check balance before creating match
            if (balance) {
                const balanceInEth = parseFloat(formatEther(balance.value));
                const stakeInEth = parseFloat(stakeAmount);
                console.log(
                    `Balance: ${balanceInEth} ETH, Stake: ${stakeInEth} ETH`
                );

                if (balanceInEth < stakeInEth) {
                    console.error("Insufficient balance");
                    setIsCreating(false);
                    return;
                }
            }

            // Create match on contract
            const createMatchTx = await createMatch(300, stakeAmount); // 5 minutes duration
            console.log("Match creation transaction:", createMatchTx);

            // Wait for the transaction to be mined and get the match ID from events
            // We'll listen for the MatchCreated event to get the actual match ID
        } catch (error) {
            console.error("Error creating match:", error);
            setIsCreating(false);
        }
    };

    const handleJoinMatch = async () => {
        if (isJoining || !matchId) return;

        setIsJoining(true);
        try {
            // Join the existing match
            const joinMatchTx = await joinMatch(parseInt(matchId), stakeAmount);
            console.log("Join match transaction:", joinMatchTx);

            // Wait for the transaction to be mined
            // We'll listen for the MatchJoined event
        } catch (error) {
            console.error("Error joining match:", error);
            setIsJoining(false);
        }
    };

    if (gameMode === "waiting") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#151a23] text-white p-8">
                <h1 className="text-4xl font-bold mb-8">CRYPTLE 1v1</h1>

                <div className="bg-[#232b39] p-8 rounded-2xl max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Match Created! 🎮
                    </h2>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">Stake Amount:</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            {stakeAmount} ETH
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">Match ID:</p>
                        <p className="text-lg font-mono bg-gray-800 p-2 rounded">
                            #{matchId}
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">
                            Share this link with your opponent:
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-1 bg-gray-800 p-2 rounded text-sm"
                            />
                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(shareLink)
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-bold transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-slate-400 mb-4">
                            Waiting for opponent to join...
                        </p>
                        <div className="animate-pulse">
                            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameMode === "playing") {
        return <Wordle1v1 matchId={matchId} stakeAmount={stakeAmount} />;
    }

    if (gameMode === "finished") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#151a23] text-white p-8">
                <h1 className="text-4xl font-bold mb-8">CRYPTLE 1v1</h1>

                <div className="bg-[#232b39] p-8 rounded-2xl max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        🏁 Game Finished! 🏁
                    </h2>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">Match ID:</p>
                        <p className="text-lg font-mono bg-gray-800 p-2 rounded">
                            #{matchId}
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="text-slate-300 mb-2">Stake Amount:</p>
                        <p className="text-2xl font-bold text-emerald-400">
                            {stakeAmount} ETH
                        </p>
                    </div>

                    <div className="text-center">
                        {matchResult?.isDraw ? (
                            <div>
                                <p className="text-yellow-400 text-lg font-bold mb-2">
                                    🤝 It's a Draw!
                                </p>
                                <p className="text-slate-300 text-sm mb-4">
                                    Neither player solved the word in time
                                </p>
                                <p className="text-yellow-300 text-sm">
                                    Both players got their stakes back
                                </p>
                            </div>
                        ) : matchResult?.winner ? (
                            <div>
                                <p className="text-emerald-400 text-lg font-bold mb-2">
                                    🎉 Match Completed!
                                </p>
                                <p className="text-slate-300 text-sm mb-4">
                                    Winner: {matchResult.winner.slice(0, 6)}...
                                    {matchResult.winner.slice(-4)}
                                </p>
                                <p className="text-emerald-300 text-sm">
                                    Prize:{" "}
                                    {matchResult.prize
                                        ? `${(
                                              parseFloat(matchResult.prize) /
                                              1e18
                                          ).toFixed(3)} ETH`
                                        : "N/A"}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-400 mb-4">
                                    This match has already been completed.
                                </p>
                                <p className="text-slate-300 text-sm">
                                    Check the results in the game interface or
                                    create a new match!
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setGameMode("setup");
                                setMatchId(null);
                                setStakeAmount("0.001");
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold transition-colors"
                        >
                            Start New Match
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#151a23] text-white p-8">
            <h1 className="text-4xl font-bold mb-8">CRYPTLE 1v1</h1>

            <div className="bg-[#232b39] p-8 rounded-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {joinMatchId ? "Join Match ⚔️" : "Create Match ⚔️"}
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
                </div>

                <div className="mb-6">
                    <p className="text-slate-300 mb-2">Rules:</p>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Both players guess the same word</li>
                        <li>• First to solve wins all stakes</li>
                        <li>• 5 minute time limit</li>
                        <li>• 6 guesses maximum</li>
                    </ul>
                </div>

                <button
                    onClick={joinMatchId ? handleJoinMatch : handleCreateMatch}
                    disabled={
                        (joinMatchId ? isJoining : isCreating) ||
                        parseFloat(stakeAmount) < 0.001
                    }
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-colors"
                >
                    {joinMatchId
                        ? isJoining
                            ? "Joining Match..."
                            : `Join Match & Stake ${stakeAmount} ETH`
                        : isCreating
                        ? "Creating Match..."
                        : `Create Match & Stake ${stakeAmount} ETH`}
                </button>
            </div>
        </div>
    );
}
