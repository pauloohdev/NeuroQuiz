import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CheckCircle2, XCircle, Lightbulb, Brain, Star } from "lucide-react";
import { useGame } from "../context/GameContext";
import { questions, TOTAL_QUESTIONS } from "../data/questions";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function AnswerPage() {
  const { state } = useGame();
  const { currentQuestionIndex, selectedAnswer, isCorrect, pointsEarned } = state;
  const question = questions[currentQuestionIndex];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(".ans-item", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      clearProps: "all",
    });

    // Correct answer glow pulse
    if (isCorrect) {
      gsap.to(".score-badge", {
        scale: 1.05,
        duration: 0.4,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      });
    }
  }, [isCorrect]);

  if (!question) return null;

  const getOptionStyle = (i: number) => {
    const isCorrectOpt = i === question.correct;
    const isSelected = i === selectedAnswer;

    if (isCorrectOpt) {
      return {
        background: "rgba(52,211,153,0.12)",
        border: "1px solid rgba(52,211,153,0.5)",
        boxShadow: "0 0 20px rgba(52,211,153,0.15)",
      };
    }
    if (isSelected && !isCorrectOpt) {
      return {
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.3)",
      };
    }
    return {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
      opacity: 0.5,
    };
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Result header */}
        <div className="ans-item text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-4"
            style={{
              background: isCorrect ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
              border: `1px solid ${isCorrect ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}`,
              boxShadow: `0 0 20px ${isCorrect ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)"}`,
            }}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span
              className="font-bold text-base"
              style={{ color: isCorrect ? "#34d399" : "#f87171" }}
            >
              {isCorrect ? "Correto!" : selectedAnswer === null ? "Tempo esgotado!" : "Incorreto!"}
            </span>
          </div>

          {/* Points */}
          {pointsEarned > 0 && (
            <div
              className="score-badge inline-flex items-center gap-2 px-6 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15))",
                border: "1px solid rgba(34,211,238,0.3)",
              }}
            >
              <Star className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-black text-2xl">+{pointsEarned}</span>
              <span className="text-white/60 text-sm">pontos</span>
            </div>
          )}
        </div>

        {/* Question recap */}
        <div
          className="ans-item rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}
            >
              Q{currentQuestionIndex + 1}/{TOTAL_QUESTIONS} · {question.structure}
            </span>
          </div>
          <p className="text-white/80 text-base leading-relaxed">{question.question}</p>
        </div>

        {/* Options */}
        <div className="ans-item space-y-2 mb-5">
          {question.options.map((opt, i) => {
            const isCorrectOpt = i === question.correct;
            const isSelected = i === selectedAnswer;

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={getOptionStyle(i)}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    background: isCorrectOpt
                      ? "rgba(52,211,153,0.2)"
                      : isSelected
                      ? "rgba(248,113,113,0.2)"
                      : "rgba(255,255,255,0.06)",
                    color: isCorrectOpt
                      ? "#34d399"
                      : isSelected
                      ? "#f87171"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {OPTION_LABELS[i]}
                </span>
                <span
                  className="flex-1 font-medium"
                  style={{
                    color: isCorrectOpt ? "#34d399" : isSelected ? "#f87171" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {opt}
                </span>
                {isCorrectOpt && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {isSelected && !isCorrectOpt && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div
          className="ans-item rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.05), rgba(139,92,246,0.05))",
            border: "1px solid rgba(34,211,238,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34,211,238,0.15)" }}
            >
              <Lightbulb className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-cyan-400 text-sm font-semibold">Explicação Científica</span>
          </div>
          <p className="text-white/75 text-sm leading-relaxed">{question.explanation}</p>

          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-400/70 text-xs font-medium">Estrutura: {question.structure}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">{question.category}</span>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="ans-item mt-5 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/40"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/30"
                  style={{ animation: `bounce 1s ease ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            Carregando ranking...
          </div>
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
