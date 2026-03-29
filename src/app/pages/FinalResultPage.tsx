import { useEffect, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { Trophy, Crown, Medal, Brain, RotateCcw, Star } from "lucide-react";
import { useGame } from "../context/GameContext";
import { TOTAL_QUESTIONS } from "../data/questions";

const RANK_COLORS = [
  { text: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)", glow: "rgba(251,191,36,0.25)" },
  { text: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", glow: "rgba(148,163,184,0.15)" },
  { text: "#cd7c2f", bg: "rgba(205,124,47,0.08)", border: "rgba(205,124,47,0.25)", glow: "rgba(205,124,47,0.15)" },
];

export default function FinalResultPage() {
  const { state, leaveGame } = useGame();
  const { players } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiFired = useRef(false);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isWinner = winner && (winner.id === state.playerId || winner.name === state.playerName);

  useEffect(() => {
    if (!confettiFired.current) {
      confettiFired.current = true;

      // Burst confetti
      const colors = ["#22d3ee", "#8b5cf6", "#f43f5e", "#fbbf24", "#34d399"];
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...opts,
          origin: { y: 0.6 },
          colors,
          particleCount: Math.floor(200 * particleRatio),
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }

    gsap.from(".final-item", {
      y: 40,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power3.out",
      clearProps: "all",
    });
  }, []);

  const maxScore = TOTAL_QUESTIONS * 100;

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="final-item text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))",
              border: "1px solid rgba(251,191,36,0.4)",
              boxShadow: "0 0 50px rgba(251,191,36,0.2)",
            }}
          >
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            {isWinner ? "🧠 Você Venceu!" : "Resultado Final"}
          </h1>
          <p className="text-white/50 text-base">
            {winner ? (
              <>
                <span className="text-amber-400 font-semibold">{winner.name}</span> dominou o quiz com{" "}
                <span className="text-amber-400 font-semibold">{winner.score} pontos</span>!
              </>
            ) : (
              "Quiz concluído!"
            )}
          </p>
        </div>

        {/* Podium (top 3) */}
        {sorted.length >= 2 && (
          <div className="final-item flex items-end justify-center gap-3 mb-6">
            {[1, 0, 2].map((rankIdx) => {
              const player = sorted[rankIdx];
              if (!player) return <div key={rankIdx} className="w-24" />;
              const style = RANK_COLORS[rankIdx] ?? RANK_COLORS[2];
              const heights = ["h-20", "h-28", "h-16"];
              const isMe = player.id === state.playerId || player.name === state.playerName;

              return (
                <div key={rankIdx} className="flex flex-col items-center gap-2 w-28">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${style.text}33, ${style.text}11)`,
                      border: `2px solid ${style.border}`,
                      boxShadow: `0 0 20px ${style.glow}`,
                      color: style.text,
                    }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/80 text-xs font-semibold text-center truncate w-full text-center">
                    {player.name}
                    {isMe && " ✦"}
                  </span>
                  <span className="text-xs font-bold" style={{ color: style.text }}>{player.score} pts</span>
                  {/* Podium block */}
                  <div
                    className={`w-full ${heights[rankIdx]} rounded-t-xl flex items-center justify-center`}
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderBottom: "none",
                    }}
                  >
                    {rankIdx === 0 && <Crown className="w-6 h-6" style={{ color: style.text }} />}
                    {rankIdx === 1 && <Medal className="w-5 h-5" style={{ color: style.text }} />}
                    {rankIdx === 2 && <Star className="w-4 h-4" style={{ color: style.text }} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full leaderboard */}
        <div
          className="final-item rounded-2xl overflow-hidden mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Classificação Final
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {sorted.map((player, i) => {
              const style = RANK_COLORS[i];
              const isMe = player.id === state.playerId || player.name === state.playerName;
              const pct = maxScore > 0 ? Math.round((player.score / maxScore) * 100) : 0;

              return (
                <div
                  key={player.id || player.name}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{
                    background: isMe ? "rgba(34,211,238,0.04)" : "transparent",
                  }}
                >
                  <span
                    className="w-6 text-center font-black text-sm"
                    style={{ color: style ? style.text : "rgba(255,255,255,0.4)" }}
                  >
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{
                      background: style ? `${style.text}22` : "rgba(255,255,255,0.06)",
                      color: style ? style.text : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-white/85 font-medium text-sm">{player.name}</span>
                      {isMe && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}>
                          Você
                        </span>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: style
                            ? `linear-gradient(90deg, ${style.text}, ${style.text}88)`
                            : "rgba(255,255,255,0.2)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-black text-base"
                      style={{ color: style ? style.text : "rgba(255,255,255,0.7)" }}
                    >
                      {player.score}
                    </div>
                    <div className="text-white/30 text-xs">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="final-item flex gap-3 justify-center">
          <button
            onClick={leaveGame}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
              color: "white",
              boxShadow: "0 0 30px rgba(34,211,238,0.2)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Jogar Novamente
          </button>
        </div>

        <p className="final-item text-center text-white/20 text-xs mt-6 tracking-wider">
          NeuroQuiz Battle · {TOTAL_QUESTIONS} questões · Neuroanatomia
        </p>
      </div>
    </div>
  );
}
