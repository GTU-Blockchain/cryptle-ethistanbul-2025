"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Wordle } from "@/components/wordle/Wordle";
import { WalletSelector } from "@/components/WalletSelector";
import { Button } from "@/components/ui/button";

export default function PlayPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          CRYPTLE
        </h1>
        <Link href="/">
          <Button variant="outline" className="border-2 border-slate-600 text-slate-300">
            ← Back
          </Button>
        </Link>
      </header>

      <main className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {isConnected && address ? (
            <Wordle />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-white mb-6">
                Connect Your Wallet to Play
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                You need to connect your wallet to start playing CRYPTLE.
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
