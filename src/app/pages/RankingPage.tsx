import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Trophy, Crown, Medal, Zap, ChevronRight } from "lucide-react";
import { useGame } from "../context/GameContext";
import { questions, TOTAL_QUESTIONS } from "../data/questions";

const RANK_COLORS = [
  { text: "#fbbf24", glow: "rgba(251,191,36,0.3)", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" }, // Gold
  { text: "#94a3b8", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" }, // Silver
  { text: "#cd7c2f", glow: "rgba(205,124,47,0.3)", bg: "rgba(205,124,47,0.08)", border: "rgba(205,124,47,0.2)" }, // Bronze
];

export default function RankingPage() {
  const { state } = useGame();
  const { players, currentQuestionIndex } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const isLastQuestion = currentQuestionIndex >= TOTAL_QUESTIONS - 1;
  const nextQuestion = questions[currentQuestionIndex + 1];

  useEffect(() => {
    gsap.from(".rank-item", {
      x: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
      clearProps: "all",
    });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-5 h-5" style={{ color: RANK_COLORS[0].text }} />;
    if (rank === 1) return <Medal className="w-5 h-5" style={{ color: RANK_COLORS[1].text }} />;
    if (rank === 2) return <Medal className="w-4 h-4" style={{ color: RANK_COLORS[2].text }} />;
    return <span className="text-white/40 font-bold text-sm w-5 text-center">{rank + 1}</span>;
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="rank-item text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))",
              border: "1px solid rgba(251,191,36,0.3)",
              boxShadow: "0 0 30px rgba(251,191,36,0.15)",
            }}
          >
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-1">Ranking Parcial</h2>
          <p className="text-white/40 text-sm">
            Após questão {currentQuestionIndex + 1} de {TOTAL_QUESTIONS}
          </p>
        </div>

        {/* Players list */}
        <div className="space-y-3 mb-6">
          {sorted.map((player, i) => {
            const rankStyle = RANK_COLORS[i] ?? { text: "rgba(255,255,255,0.6)", glow: "transparent", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)" };
            const isMe = player.id === state.playerId || player.name === state.playerName;

            return (
              <div
                key={player.id || player.name}
                className="rank-item flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: isMe
                    ? "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(139,92,246,0.05))"
                    : rankStyle.bg,
                  border: isMe
                    ? "1px solid rgba(34,211,238,0.25)"
                    : `1px solid ${rankStyle.border}`,
                  boxShadow: i < 3 ? `0 0 20px ${rankStyle.glow}` : "none",
                  backdropFilter: "blur(20px)",
                  transform: i === 0 ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 flex-shrink-0">
                  {getRankIcon(i)}
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                  style={{
                    background: i < 3
                      ? `linear-gradient(135deg, ${rankStyle.text}33, ${rankStyle.text}11)`
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${i < 3 ? rankStyle.border : "rgba(255,255,255,0.08)"}`,
                    color: i < 3 ? rankStyle.text : "rgba(255,255,255,0.7)",
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold truncate"
                      style={{ color: i < 3 ? rankStyle.text : "rgba(255,255,255,0.85)" }}
                    >
                      {player.name}
                    </span>
                    {isMe && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.25)" }}
                      >
                        Você
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-black text-xl"
                    style={{
                      color: i < 3 ? rankStyle.text : "rgba(255,255,255,0.7)",
                      textShadow: i < 3 ? `0 0 10px ${rankStyle.glow}` : "none",
                    }}
                  >
                    {player.score}
                  </div>
                  <div className="text-white/30 text-xs">pts</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next up */}
        <div
          className="rank-item rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {isLastQuestion ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.15)" }}
                >
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Última questão respondida!</p>
                  <p className="text-white/40 text-xs">Calculando resultado final...</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{ animation: `bounce 1s ease ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(34,211,238,0.12)" }}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-0.5">Próxima questão</p>
                  <p className="text-white font-semibold text-sm">
                    {nextQuestion?.structure ?? "—"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
