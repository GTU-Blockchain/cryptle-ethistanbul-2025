"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { Wordle } from "@/components/wordle/Wordle";
import { WalletSelector } from "@/components/WalletSelector";
import { Button } from "@/components/ui/button";
import { parseEther, formatEther } from "viem";

export default function PlayPage() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const [stakeAmount, setStakeAmount] = useState<string>("0.001");
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    const handleStartGame = () => {
        if (balance) {
            const balanceInEth = parseFloat(formatEther(balance.value));
            const stakeInEth = parseFloat(stakeAmount);

            if (balanceInEth < stakeInEth) {
                alert("Insufficient balance");
                return;
            }
        }
        setGameStarted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    CRYPTLE
                </h1>
                <Link href="/">
                    <Button
                        variant="outline"
                        className="border-2 border-slate-600 text-slate-300"
                    >
                        ← Back
                    </Button>
                </Link>
            </header>

            <main className="py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    {isConnected && address ? (
                        gameStarted ? (
                            <Wordle stakeAmount={stakeAmount} />
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-slate-800 p-8 rounded-2xl max-w-md mx-auto">
                                    <h2 className="text-3xl font-bold text-white mb-6">
                                        Single Player Mode
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
                                            onChange={(e) =>
                                                setStakeAmount(e.target.value)
                                            }
                                            className="w-full bg-gray-800 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="0.001"
                                        />
                                        <p className="text-sm text-slate-400 mt-1">
                                            Minimum: 0.001 ETH
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-slate-300 mb-2">
                                            Prize Structure:
                                        </p>
                                        <ul className="text-sm text-slate-400 space-y-1 text-left">
                                            <li>
                                                • Win: Get stake back + 50%
                                                bonus
                                            </li>
                                            <li>• Lose: Lose your stake</li>
                                            <li>• 1 minute time limit</li>
                                            <li>• 6 guesses maximum</li>
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={handleStartGame}
                                        disabled={
                                            parseFloat(stakeAmount) < 0.001
                                        }
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-all"
                                    >
                                        Start Game & Stake {stakeAmount} ETH
                                    </Button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-3xl font-bold text-white mb-6">
                                Connect Your Wallet to Play
                            </h2>
                            <p className="text-slate-400 mb-8 text-lg">
                                You need to connect your wallet to start playing
                                CRYPTLE.
                            </p>
                            <div className="flex justify-center">
                                <WalletSelector />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
