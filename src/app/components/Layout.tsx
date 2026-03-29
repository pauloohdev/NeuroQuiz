import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { CustomCursor } from "./CustomCursor";
import { GrainOverlay } from "./GrainOverlay";
import { NeuralBackground } from "./NeuralBackground";
import { useGame } from "../context/GameContext";
import { GameProvider } from "../context/GameContext";

// Maps game status to route
const STATUS_TO_ROUTE: Record<string, string> = {
  idle: "/",
  lobby: "/lobby",
  question: "/question",
  answer: "/answer",
  ranking: "/ranking",
  finished: "/final",
};

function NavigationController() {
  const { state } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Never interfere with mini-game routes
    if (location.pathname.startsWith("/mini-games")) return;

    const target = STATUS_TO_ROUTE[state.gameStatus] ?? "/";
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameStatus]);

  return null;
}

export function Layout() {
  return (
    <GameProvider>
      <LayoutInner />
    </GameProvider>
  );
}

function LayoutInner() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #030308 0%, #080818 40%, #0a0620 100%)",
        cursor: "none",
      }}
    >
      {/* Ambient orbs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float1 12s ease-in-out infinite",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float2 15s ease-in-out infinite",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "40%",
          left: "60%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "float3 18s ease-in-out infinite",
        }}
      />

      <NeuralBackground />
      <GrainOverlay />
      <CustomCursor />
      <NavigationController />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -30px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(20px, 30px); }
          75% { transform: translate(-30px, -10px); }
        }
        * { cursor: none !important; }
      `}</style>
    </div>
  );
}