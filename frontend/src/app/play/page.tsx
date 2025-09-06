"use client";

import Link from "next/link";
import { Wordle } from "@/components/wordle/Wordle";
import { Button } from "@/components/ui/button";

export default function PlayPage() {
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
          <Wordle />
        </div>
      </main>
    </div>
  );
}
