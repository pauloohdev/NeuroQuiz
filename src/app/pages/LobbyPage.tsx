import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Copy, Check, Users, Zap, Crown, LogOut, Wifi } from "lucide-react";
import { useGame } from "../context/GameContext";

export default function LobbyPage() {
  const { state, startGame, leaveGame } = useGame();
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(".lobby-item", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      clearProps: "all",
    });
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playerColors = [
    "from-cyan-400 to-cyan-600",
    "from-violet-400 to-violet-600",
    "from-rose-400 to-rose-600",
    "from-amber-400 to-amber-600",
    "from-emerald-400 to-emerald-600",
    "from-pink-400 to-pink-600",
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="lobby-item text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}>
            <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">
              Sala Aberta
            </span>
          </div>
          <h2 className="text-3xl font-black text-white mb-1">Aguardando jogadores</h2>
          <p className="text-white/40">
            {state.isHost ? "Compartilhe o código quando todos estiverem prontos" : "Aguarde o host iniciar o jogo"}
          </p>
        </div>

        {/* Room Code */}
        <div
          className="lobby-item rounded-2xl p-6 mb-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
            Código da Sala
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {state.roomCode.split("").map((char, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded-lg flex items-center justify-center font-black text-xl text-white"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    boxShadow: "0 0 15px rgba(34,211,238,0.1)",
                    textShadow: "0 0 10px rgba(34,211,238,0.5)",
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: copied ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.06)",
                border: copied ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: copied ? "#22d3ee" : "rgba(255,255,255,0.6)",
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Players */}
        <div
          className="lobby-item rounded-2xl p-6 mb-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-sm">Jogadores na sala</span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(34,211,238,0.15)",
                border: "1px solid rgba(34,211,238,0.3)",
                color: "#22d3ee",
              }}
            >
              {state.players.length} online
            </span>
          </div>

          <div className="space-y-2">
            {state.players.length === 0 ? (
              <div className="text-center py-8 text-white/25 text-sm">
                Nenhum jogador ainda...
              </div>
            ) : (
              state.players.map((player, i) => (
                <div
                  key={player.id || player.name}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
                  }}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${playerColors[i % playerColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium">{player.name}</span>
                  {player.isHost && (
                    <div className="ml-auto flex items-center gap-1 text-amber-400">
                      <Crown className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Host</span>
                    </div>
                  )}
                  {!player.isHost && player.id === state.playerId && (
                    <span className="ml-auto text-white/30 text-xs">Você</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lobby-item flex gap-3">
          <button
            onClick={leaveGame}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/50 text-sm font-medium transition-all hover:text-white/80 hover:bg-white/05"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>

          {state.isHost && (
            <button
              onClick={startGame}
              disabled={state.players.length < 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                boxShadow: "0 0 30px rgba(34,211,238,0.25)",
              }}
            >
              <Zap className="w-5 h-5" />
              Iniciar Batalha
            </button>
          )}

          {!state.isHost && (
            <div
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white/40 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Aguardando o host...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
