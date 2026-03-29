import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { Brain, Zap, Users, ArrowRight, Hash, Layers, ChevronRight } from "lucide-react";
import { useGame } from "../context/GameContext";

function MagneticButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const { createRoom, joinRoom, state } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"host" | "join" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.from(".reveal-item", {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      clearProps: "all",
    });
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createRoom(name.trim());
    } catch {
      // error handled in context
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !joinCode.trim()) return;
    try {
      await joinRoom(name.trim(), joinCode.trim().toUpperCase());
    } catch {
      // error handled in context
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl">
        {/* Hero */}
        <div className="reveal-item text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(124,58,237,0.3))",
                border: "1px solid rgba(34,211,238,0.3)",
                boxShadow: "0 0 30px rgba(34,211,238,0.2)",
              }}
            >
              <Brain className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2"
            style={{ textShadow: "0 0 40px rgba(34,211,238,0.3)" }}
          >
            NeuroQuiz
            <span
              className="ml-3"
              style={{
                background: "linear-gradient(90deg, #22d3ee, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Battle
            </span>
          </h1>
          <p className="text-white/50 text-lg font-light tracking-wide">
            Quiz de Neuroanatomia · Multiplayer em Tempo Real
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Card */}
          <div
            className="reveal-item md:row-span-2 rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                  Identificação
                </span>
              </div>
              <p className="text-white/40 text-xs mb-2">Seu nome no jogo</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mode === "host") handleCreate();
                  if (e.key === "Enter" && mode === "join") handleJoin();
                }}
                placeholder="Digite seu nome..."
                maxLength={24}
                className="w-full text-white placeholder-white/20 text-xl font-semibold bg-transparent border-0 border-b-2 border-white/10 focus:border-cyan-400/60 pb-3 mb-2 outline-none transition-colors"
                style={{ caretColor: "#22d3ee" }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Perguntas", value: "10" },
                { label: "Timer", value: "10s" },
                { label: "Máx pts", value: "100" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-cyan-400 font-black text-lg">{s.value}</div>
                  <div className="text-white/40 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Room Card */}
          <div
            className="reveal-item rounded-2xl p-6"
            style={{
              background:
                mode === "host"
                  ? "rgba(34,211,238,0.07)"
                  : "rgba(255,255,255,0.04)",
              border:
                mode === "host"
                  ? "1px solid rgba(34,211,238,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              transition: "all 0.3s",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                Host
              </span>
            </div>
            <p className="text-white text-lg font-semibold mb-1">Criar Sala</p>
            <p className="text-white/40 text-sm mb-5">
              Gere um código e convide seus colegas
            </p>

            {state.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {state.error}
              </div>
            )}

            <MagneticButton
              onClick={() => { setMode("host"); handleCreate(); }}
              disabled={!name.trim() || state.isLoading}
              className={`w-full py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm ${
                !name.trim() || state.isLoading
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-[1.02]"
              }`}
              style={{
                background:
                  !name.trim() || state.isLoading
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                color: "white",
              } as React.CSSProperties}
            >
              {state.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  Criar Sala <ArrowRight className="w-4 h-4" />
                </>
              )}
            </MagneticButton>
          </div>

          {/* Join Room Card */}
          <div
            className="reveal-item rounded-2xl p-6"
            style={{
              background:
                mode === "join"
                  ? "rgba(244,63,94,0.07)"
                  : "rgba(255,255,255,0.04)",
              border:
                mode === "join"
                  ? "1px solid rgba(244,63,94,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              transition: "all 0.3s",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Hash className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                Player
              </span>
            </div>
            <p className="text-white text-lg font-semibold mb-1">Entrar na Sala</p>
            <p className="text-white/40 text-sm mb-4">
              Digite o código fornecido pelo host
            </p>

            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setMode("join");
              }}
              onFocus={() => setMode("join")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
              placeholder="EX: ABC123"
              maxLength={6}
              className="w-full text-white placeholder-white/20 text-xl font-mono font-bold bg-transparent border-0 border-b-2 border-white/10 focus:border-rose-400/60 pb-3 mb-4 outline-none transition-colors tracking-[0.3em]"
              style={{ caretColor: "#f43f5e" }}
            />

            <MagneticButton
              onClick={handleJoin}
              disabled={!name.trim() || !joinCode.trim() || state.isLoading}
              className={`w-full py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm ${
                !name.trim() || !joinCode.trim() || state.isLoading
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-[1.02]"
              }`}
              style={{
                background:
                  !name.trim() || !joinCode.trim() || state.isLoading
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(135deg, #f43f5e, #ec4899)",
                color: "white",
              } as React.CSSProperties}
            >
              {state.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </MagneticButton>
          </div>
        </div>

        {/* Footer */}
        <p className="reveal-item text-center text-white/20 text-xs mt-8 tracking-wider">
          NEUROANATOMIA · SISTEMA NERVOSO CENTRAL · CONECTE E APRENDA
        </p>

        {/* Mini-games Section */}
        <div className="reveal-item mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-white/25 text-xs uppercase tracking-widest">Treino Solo</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/mini-games/identify")}
              className="group flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(34,211,238,0.04)",
                border: "1px solid rgba(34,211,238,0.12)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.2)" }}>
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">Identificar Estrutura</p>
                <p className="text-white/35 text-[10px]">6 rodadas · 10s timer</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => navigate("/mini-games/match")}
              className="group flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(139,92,246,0.04)",
                border: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <Layers className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">Sinapses</p>
                <p className="text-white/35 text-[10px]">6 pares · flip cards</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-violet-400 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}