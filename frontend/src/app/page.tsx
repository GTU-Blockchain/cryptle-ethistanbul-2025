"use client";

import { WalletSelector } from "@/components/WalletSelector";
import { useAccount } from "wagmi";
import { Wordle } from "@/components/wordle/Wordle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Home() {
    const { address, isConnected } = useAccount();
    const [currentStep, setCurrentStep] = useState(0);

    const scrollStep = (direction: number) => {
        const newStep = currentStep + direction;
        if (newStep >= 0 && newStep <= 3) {
            setCurrentStep(newStep);
        }
    };

    const scrollToStep = (step: number) => {
        setCurrentStep(step);
    };

    useEffect(() => {
        const container = document.getElementById('steps-container');
        if (container) {
            container.style.transform = `translateX(-${currentStep * 100}%)`;
        }

        // Update dots
        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) {
                if (i === currentStep) {
                    dot.className = "w-3 h-3 bg-cyan-500 rounded-full transition-all";
                } else {
                    dot.className = "w-3 h-3 bg-slate-600 hover:bg-slate-500 rounded-full transition-all";
                }
            }
        }
    }, [currentStep]);

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

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                        How It Works
                        </h2>
                    <p className="text-xl text-slate-300 text-center mb-16 max-w-3xl mx-auto">
                        A seamless, step-by-step guide to your WordChain adventure.
                    </p>
                    
                    <div className="relative overflow-hidden">
                        <div className="flex transition-transform duration-500 ease-in-out" id="steps-container">
                            {/* Step 1: Connect Wallet */}
                            <div className="w-full flex-shrink-0 px-4">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30 shadow-2xl">
                                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full border-2 border-cyan-500/50">
                                            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Connect Wallet</h3>
                                        <p className="text-slate-300 text-center leading-relaxed">
                                            Your secure gateway to the blockchain gaming world.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Stake & Play */}
                            <div className="w-full flex-shrink-0 px-4">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full border-2 border-purple-500/50">
                                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Stake & Play</h3>
                                        <p className="text-slate-300 text-center leading-relaxed">
                                            Put your tokens on the line to join the daily challenge.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Guess the Word */}
                            <div className="w-full flex-shrink-0 px-4">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full border-2 border-purple-500/50">
                                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Guess the Word</h3>
                                        <p className="text-slate-300 text-center leading-relaxed">
                                            Six tries to solve the secret five-letter word.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Win & Earn */}
                            <div className="w-full flex-shrink-0 px-4">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full border-2 border-purple-500/50">
                                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Win & Earn</h3>
                                        <p className="text-slate-300 text-center leading-relaxed">
                                            Claim your rewards and climb the leaderboards.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex justify-center items-center mt-12 gap-4">
                            <button 
                                onClick={() => scrollStep(-1)}
                                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-cyan-400 transition-colors"
                                id="prev-btn"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => scrollToStep(0)}
                                    className="w-3 h-3 bg-cyan-500 rounded-full transition-all"
                                    id="dot-0"
                                ></button>
                                <button 
                                    onClick={() => scrollToStep(1)}
                                    className="w-3 h-3 bg-slate-600 hover:bg-slate-500 rounded-full transition-all"
                                    id="dot-1"
                                ></button>
                                <button 
                                    onClick={() => scrollToStep(2)}
                                    className="w-3 h-3 bg-slate-600 hover:bg-slate-500 rounded-full transition-all"
                                    id="dot-2"
                                ></button>
                                <button 
                                    onClick={() => scrollToStep(3)}
                                    className="w-3 h-3 bg-slate-600 hover:bg-slate-500 rounded-full transition-all"
                                    id="dot-3"
                                ></button>
                            </div>
                            
                            <button 
                                onClick={() => scrollStep(1)}
                                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-cyan-400 transition-colors"
                                id="next-btn"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-center text-slate-500 text-sm mt-4">
                            Swipe or use arrows to see the next step
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
