"use client";
import React from "react";

const leaderboardData = {
  daily: [
    { rank: 1, player: "PlayerOne", score: 200, rewards: "20 ETH" },
    { rank: 2, player: "PlayerTwo", score: 180, rewards: "18 ETH" },
    { rank: 3, player: "PlayerThree", score: 170, rewards: "17 ETH" },
    { rank: 4, player: "PlayerFour", score: 160, rewards: "16 ETH" },
    { rank: 5, player: "PlayerFive", score: 150, rewards: "15 ETH" },
    { rank: 6, player: "PlayerSix", score: 140, rewards: "14 ETH" },
    { rank: 7, player: "PlayerSeven", score: 130, rewards: "13 ETH" },
    { rank: 8, player: "PlayerEight", score: 120, rewards: "12 ETH" },
    { rank: 9, player: "PlayerNine", score: 110, rewards: "11 ETH" },
  ],
  weekly: [
    { rank: 1, player: "PlayerOne", score: 500, rewards: "50 ETH" },
    { rank: 2, player: "PlayerTwo", score: 480, rewards: "48 ETH" },
    { rank: 3, player: "PlayerThree", score: 470, rewards: "47 ETH" },
    { rank: 4, player: "PlayerFour", score: 460, rewards: "46 ETH" },
    { rank: 5, player: "PlayerFive", score: 450, rewards: "45 ETH" },
    { rank: 6, player: "PlayerSix", score: 440, rewards: "44 ETH" },
    { rank: 7, player: "PlayerSeven", score: 430, rewards: "43 ETH" },
    { rank: 8, player: "PlayerEight", score: 420, rewards: "42 ETH" },
    { rank: 9, player: "PlayerNine", score: 410, rewards: "41 ETH" },
  ],
  all: [
    { rank: 1, player: "PlayerOne", score: 1000, rewards: "100 ETH" },
    { rank: 2, player: "PlayerTwo", score: 950, rewards: "95 ETH" },
    { rank: 3, player: "PlayerThree", score: 900, rewards: "90 ETH" },
    { rank: 4, player: "PlayerFour", score: 850, rewards: "85 ETH" },
    { rank: 5, player: "PlayerFive", score: 800, rewards: "80 ETH" },
    { rank: 6, player: "PlayerSix", score: 750, rewards: "75 ETH" },
    { rank: 7, player: "PlayerSeven", score: 700, rewards: "70 ETH" },
    { rank: 8, player: "PlayerEight", score: 650, rewards: "65 ETH" },
    { rank: 9, player: "PlayerNine", score: 600, rewards: "60 ETH" },
  ],
};

const trophy = [
  <span key="gold" className="text-yellow-400">🏆</span>,
  <span key="silver" className="text-slate-300">🏆</span>,
  <span key="bronze" className="text-orange-400">🏆</span>,
];

export default function LeaderboardPage() {
  const [tab, setTab] = React.useState<'daily' | 'weekly' | 'all'>('all');
  const tabList = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'all', label: 'All Time' },
  ];
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-4xl bg-slate-800/90 rounded-2xl shadow-2xl p-8 border border-cyan-500/20">
        <h1
          className="text-5xl font-extrabold text-center mb-8 tracking-tight"
          style={{
            fontFamily: 'FKGrotesk-Bold, FKGrotesk, Arial, sans-serif',
            color: '#5eead4', // mat cyan
            letterSpacing: '0.04em',
            lineHeight: 1.1,
          }}
        >
          Leaderboards
        </h1>
        <div className="flex justify-center gap-4 mb-10">
          {tabList.map(t => (
            <button
              key={t.key}
              className={`px-6 py-2 rounded-full font-semibold border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/30
                ${tab === t.key
                  ? 'bg-cyan-600 text-white border-cyan-400 scale-105'
                  : 'bg-slate-800 text-cyan-200 border-cyan-400/40 hover:bg-cyan-800/40 hover:text-cyan-100'}`}
              style={tab === t.key ? {} : {}}
              onClick={() => setTab(t.key as 'daily' | 'weekly' | 'all')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-slate-400 text-sm">
              <th className="px-4">RANK</th>
              <th className="px-4">PLAYER</th>
              <th className="px-4">SCORE</th>
              <th className="px-4">REWARDS</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData[tab].map((row, i) => (
              <tr
                key={row.rank}
                className="text-lg text-slate-100 group transition-all cursor-pointer hover:bg-cyan-400/10 hover:shadow-lg hover:scale-[1.01]"
                style={{ borderRadius: 12 }}
              >
                <td className="px-4 font-bold" style={{color: row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : row.rank === 3 ? '#CD7F32' : undefined}}>
                  {row.rank}
                </td>
                <td className="px-4 flex items-center gap-2">
                  {row.rank <= 3 ? trophy[row.rank-1] : null}
                  {row.player}
                </td>
                <td className="px-4 text-cyan-300 font-mono">
                  {row.score}
                </td>
                <td className="px-4">
                  {row.rewards}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
