import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { useGame } from "../context/GameContext";
import { questions, TOTAL_QUESTIONS } from "../data/questions";

const TIMER_DURATION = 10;

const OPTION_STYLES = [
  { border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.08)", label: "rgba(34,211,238,0.9)" },
  { border: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.08)", label: "rgba(139,92,246,0.9)" },
  { border: "rgba(244,63,94,0.3)", bg: "rgba(244,63,94,0.08)", label: "rgba(244,63,94,0.9)" },
  { border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.08)", label: "rgba(245,158,11,0.9)" },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

function MagneticOption({
  children,
  onClick,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  style: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    ref.current.style.transform = `perspective(600px) rotateX(${-dy}deg) rotateY(${dx}deg) translate(${dx * 0.4}px, ${dy * 0.4}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(600px) rotateX(0) rotateY(0) translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, willChange: "transform", transition: "transform 0.2s ease, background 0.2s, border-color 0.2s, box-shadow 0.2s" }}
      className="w-full text-left p-5 rounded-2xl disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export default function QuestionPage() {
  const { state, submitAnswer } = useGame();
  const { currentQuestionIndex, questionStartTime, hasAnswered, selectedAnswer } = state;

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const question = questions[currentQuestionIndex];

  // Start timer synced to broadcast startTime
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const calcRemaining = () => {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      return Math.max(0, TIMER_DURATION - elapsed);
    };

    setTimeLeft(Math.ceil(calcRemaining()));

    timerRef.current = setInterval(() => {
      const rem = calcRemaining();
      setTimeLeft(Math.ceil(rem));
      if (rem <= 0) clearInterval(timerRef.current!);
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionStartTime, currentQuestionIndex]);

  // Page reveal animation
  useEffect(() => {
    gsap.from(".q-item", {
      y: 30,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: "power3.out",
      clearProps: "all",
    });
  }, [currentQuestionIndex]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (hasAnswered || timeLeft <= 0) return;
      submitAnswer(index);
    },
    [hasAnswered, timeLeft, submitAnswer]
  );

  const progress = (timeLeft / TIMER_DURATION) * 100;
  const timerColor =
    timeLeft > 6 ? "#22d3ee" : timeLeft > 3 ? "#f59e0b" : "#ef4444";

  const getOptionStyle = (i: number): React.CSSProperties => {
    const base = OPTION_STYLES[i];

    if (hasAnswered) {
      if (selectedAnswer === i) {
        // Answered option
        return {
          background: base.bg,
          border: `1px solid ${base.border}`,
          boxShadow: `0 0 20px ${base.border}`,
          opacity: 1,
        };
      }
      return {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        opacity: 0.4,
      };
    }

    return {
      background: base.bg,
      border: `1px solid ${base.border}`,
    };
  };

  if (!question) return null;

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header row */}
        <div className="q-item flex items-center justify-between mb-6">
          {/* Question counter */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-white/50 text-sm">Questão</span>
            <span className="text-white font-bold text-sm">
              {currentQuestionIndex + 1}
            </span>
            <span className="text-white/30 text-sm">/ {TOTAL_QUESTIONS}</span>
          </div>

          {/* Timer */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-16 h-16 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={timerColor}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.2s linear, stroke 0.3s", filter: `drop-shadow(0 0 6px ${timerColor})` }}
              />
            </svg>
            <div
              className="absolute font-black text-xl"
              style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}` }}
            >
              {timeLeft}
            </div>
          </div>

          {/* Answered counter */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Users className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white/60 text-sm font-medium">{state.answeredCount}</span>
            <span className="text-white/30 text-sm">responderam</span>
          </div>
        </div>

        {/* Category badge */}
        <div className="q-item mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#a78bfa",
            }}
          >
            <Clock className="w-3 h-3" />
            {question.category} · {question.structure}
          </span>
        </div>

        {/* Question */}
        <div
          className="q-item rounded-2xl p-7 mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Progress bar */}
        <div className="q-item mb-5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)`,
              boxShadow: `0 0 8px ${timerColor}`,
            }}
          />
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <div key={i} className="q-item">
              <MagneticOption
                onClick={() => handleAnswer(i)}
                disabled={hasAnswered || timeLeft <= 0}
                style={getOptionStyle(i)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                    style={{
                      background: OPTION_STYLES[i].bg,
                      color: OPTION_STYLES[i].label,
                      border: `1px solid ${OPTION_STYLES[i].border}`,
                    }}
                  >
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="text-white font-medium leading-snug">{opt}</span>
                </div>
                {hasAnswered && selectedAnswer === i && (
                  <div className="flex items-center gap-1 mt-2 ml-10">
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                    <span className="text-white/60 text-xs">Sua resposta</span>
                  </div>
                )}
              </MagneticOption>
            </div>
          ))}
        </div>

        {/* Waiting indicator */}
        {hasAnswered && (
          <div className="q-item mt-4 text-center">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
              style={{
                background: state.isCorrect ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                border: `1px solid ${state.isCorrect ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                color: state.isCorrect ? "#34d399" : "#f87171",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {state.isCorrect
                ? `✓ Correto! +${state.pointsEarned} pts · Aguardando resultado...`
                : "✗ Resposta enviada · Aguardando resultado..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
