"use client";

import { WalletSelector } from "@/components/WalletSelector";
import { useAccount } from "wagmi";
import { Wordle } from "@/components/wordle/Wordle";
import { Button } from "@/components/ui/button";

export default function Home() {
    const { address, isConnected } = useAccount();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent leading-tight">
                        Guess the Word.<br />
                        Stake.<br />
                        Win Rewards.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                        The ultimate on-chain word puzzle game. Connect your wallet, stake your claim, and outsmart the dictionary to win big.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {isConnected && address ? (
                            <Button
                                onClick={() => window.location.href = '/play'}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                Start Playing
                            </Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <WalletSelector />
                                <span className="text-slate-400">or</span>
                                <Button
                                    onClick={() => window.location.href = '/play'}
                                    variant="outline"
                                    className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                                >
                                    Try Demo
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Game Preview Section */}
            <section className="py-20 px-4 bg-slate-800/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-cyan-400">
                        Game Preview
                    </h2>
                    
                    <div className="flex justify-center">
                        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 shadow-2xl">
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {/* First row - WORDL */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600">
                                    W
                                </div>
                                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-yellow-400">
                                    O
                                </div>
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600">
                                    R
                                </div>
                                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-green-400">
                                    D
                                </div>
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600">
                                    L
                                </div>
                            </div>
                            
                            {/* Empty rows */}
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg border-2 border-slate-600"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg border-2 border-slate-600"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg border-2 border-slate-600"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-5 gap-3 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg border-2 border-slate-600"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg border-2 border-slate-600"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12">
                        <p className="text-slate-400 text-lg mb-6">
                            Guess the 5-letter word in 6 tries. Each guess must be a valid word.
                        </p>
                        <div className="flex justify-center gap-8 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span>Correct letter & position</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                <span>Correct letter, wrong position</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-700 rounded"></div>
                                <span>Letter not in word</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Game Section - Show when connected */}
            {isConnected && address && (
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <Wordle />
                    </div>
                </section>
            )}
        </div>
    );
}
