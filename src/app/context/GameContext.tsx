import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, apiRequest } from "../../lib/supabase";
import { questions, TOTAL_QUESTIONS } from "../data/questions";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export type GameStatus = "idle" | "lobby" | "question" | "answer" | "ranking" | "finished";

export interface GameState {
  playerId: string;
  playerName: string;
  isHost: boolean;
  roomCode: string;
  gameStatus: GameStatus;
  currentQuestionIndex: number;
  questionStartTime: number;
  selectedAnswer: number | null;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  pointsEarned: number;
  players: PlayerScore[];
  answeredCount: number;
  error: string | null;
  isLoading: boolean;
}

type GameAction =
  | { type: "SET_IDENTITY"; payload: { id: string; name: string; isHost: boolean; roomCode: string } }
  | { type: "SET_STATUS"; payload: GameStatus }
  | { type: "QUESTION_START"; payload: { questionIndex: number; startTime: number } }
  | { type: "ANSWER_SUBMITTED"; payload: { isCorrect: boolean; pointsEarned: number; selectedAnswer: number } }
  | { type: "PLAYER_ANSWERED"; payload: { count: number } }
  | { type: "UPDATE_PLAYERS"; payload: PlayerScore[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

// ─── Broadcast event types ────────────────────────────────────────────────────

type BroadcastEvent =
  | { type: "QUESTION_START"; questionIndex: number; startTime: number }
  | { type: "PLAYER_ANSWERED"; playerId: string; answeredCount: number }
  | { type: "SHOW_ANSWER" }
  | { type: "SHOW_RANKING"; players: PlayerScore[] }
  | { type: "GAME_END"; players: PlayerScore[] };

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: GameState = {
  playerId: "",
  playerName: "",
  isHost: false,
  roomCode: "",
  gameStatus: "idle",
  currentQuestionIndex: 0,
  questionStartTime: 0,
  selectedAnswer: null,
  hasAnswered: false,
  isCorrect: null,
  pointsEarned: 0,
  players: [],
  answeredCount: 0,
  error: null,
  isLoading: false,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_IDENTITY":
      return {
        ...state,
        playerId: action.payload.id,
        playerName: action.payload.name,
        isHost: action.payload.isHost,
        roomCode: action.payload.roomCode,
      };
    case "SET_STATUS":
      return { ...state, gameStatus: action.payload };
    case "QUESTION_START":
      return {
        ...state,
        gameStatus: "question",
        currentQuestionIndex: action.payload.questionIndex,
        questionStartTime: action.payload.startTime,
        selectedAnswer: null,
        hasAnswered: false,
        isCorrect: null,
        pointsEarned: 0,
        answeredCount: 0,
      };
    case "ANSWER_SUBMITTED":
      return {
        ...state,
        hasAnswered: true,
        selectedAnswer: action.payload.selectedAnswer,
        isCorrect: action.payload.isCorrect,
        pointsEarned: action.payload.pointsEarned,
      };
    case "PLAYER_ANSWERED":
      return { ...state, answeredCount: action.payload.count };
    case "UPDATE_PLAYERS":
      return { ...state, players: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface GameContextType {
  state: GameState;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (name: string, code: string) => Promise<void>;
  startGame: () => void;
  submitAnswer: (answerIndex: number) => Promise<void>;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Refs for stable closures
  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const hostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHostTimer = () => {
    if (hostTimerRef.current) {
      clearTimeout(hostTimerRef.current);
      hostTimerRef.current = null;
    }
  };

  // ─── Broadcast helpers ─────────────────────────────────────────────────────

  const broadcast = useCallback((event: BroadcastEvent) => {
    channelRef.current?.send({ type: "broadcast", event: "GAME_EVENT", payload: event });
  }, []);

  // ─── Fetch updated players from server ────────────────────────────────────

  const fetchPlayers = useCallback(async (code: string): Promise<PlayerScore[]> => {
    try {
      const data = await apiRequest<{ players: PlayerScore[] }>(`/rooms/${code}/players`);
      return data.players;
    } catch {
      return stateRef.current.players;
    }
  }, []);

  // ─── Handle incoming broadcast events ────────────────────────────────────

  const handleBroadcastEvent = useCallback(
    async (event: BroadcastEvent) => {
      const s = stateRef.current;

      switch (event.type) {
        case "QUESTION_START": {
          clearHostTimer();
          dispatch({
            type: "QUESTION_START",
            payload: { questionIndex: event.questionIndex, startTime: event.startTime },
          });

          // Host: auto-advance to SHOW_ANSWER after 10s + small buffer
          if (s.isHost) {
            const elapsed = Date.now() - event.startTime;
            const remaining = Math.max(10000 - elapsed, 500);
            hostTimerRef.current = setTimeout(() => {
              broadcast({ type: "SHOW_ANSWER" });
            }, remaining);
          }
          break;
        }

        case "PLAYER_ANSWERED": {
          dispatch({ type: "PLAYER_ANSWERED", payload: { count: event.answeredCount } });

          // Host: if ALL players answered, advance early
          if (s.isHost) {
            const totalPlayers = stateRef.current.players.length;
            if (totalPlayers > 0 && event.answeredCount >= totalPlayers) {
              clearHostTimer();
              setTimeout(() => broadcast({ type: "SHOW_ANSWER" }), 800);
            }
          }
          break;
        }

        case "SHOW_ANSWER": {
          clearHostTimer();
          dispatch({ type: "SET_STATUS", payload: "answer" });

          // Host: auto-advance to SHOW_RANKING after 6s
          if (s.isHost) {
            hostTimerRef.current = setTimeout(async () => {
              const players = await fetchPlayers(stateRef.current.roomCode);
              broadcast({ type: "SHOW_RANKING", players });
            }, 6000);
          }
          break;
        }

        case "SHOW_RANKING": {
          clearHostTimer();
          dispatch({ type: "UPDATE_PLAYERS", payload: event.players });
          dispatch({ type: "SET_STATUS", payload: "ranking" });

          // Host: advance to next question or game end after 5s
          if (s.isHost) {
            hostTimerRef.current = setTimeout(async () => {
              const nextIndex = stateRef.current.currentQuestionIndex + 1;
              if (nextIndex >= TOTAL_QUESTIONS) {
                const players = await fetchPlayers(stateRef.current.roomCode);
                broadcast({ type: "GAME_END", players });
              } else {
                broadcast({
                  type: "QUESTION_START",
                  questionIndex: nextIndex,
                  startTime: Date.now(),
                });
              }
            }, 5000);
          }
          break;
        }

        case "GAME_END": {
          clearHostTimer();
          dispatch({ type: "UPDATE_PLAYERS", payload: event.players });
          dispatch({ type: "SET_STATUS", payload: "finished" });
          break;
        }
      }
    },
    [broadcast, fetchPlayers]
  );

  // ─── Setup Realtime channel ───────────────────────────────────────────────

  const setupChannel = useCallback(
    (roomCode: string, playerId: string, playerName: string, isHost: boolean) => {
      // Cleanup previous channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase.channel(`nq:game:${roomCode}`, {
        config: {
          broadcast: { self: true },
          presence: { key: playerId },
        },
      });

      channel.on("broadcast", { event: "GAME_EVENT" }, ({ payload }) => {
        handleBroadcastEvent(payload as BroadcastEvent);
      });

      channel.on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<{ name: string; isHost: boolean }>();
        const onlinePlayers = Object.values(presenceState)
          .flat()
          .map((p) => ({
            id: Object.keys(presenceState).find(
              (k) => presenceState[k].some((pp) => pp.name === p.name)
            ) || "",
            name: p.name,
            isHost: p.isHost,
            score: stateRef.current.players.find((pl) => pl.name === p.name)?.score ?? 0,
          }));

        dispatch({ type: "UPDATE_PLAYERS", payload: onlinePlayers });
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: playerName, isHost });
        }
      });

      channelRef.current = channel;
    },
    [handleBroadcastEvent]
  );

  // ─── Actions ──────────────────────────────────────────────────────────────

  const createRoom = useCallback(
    async (name: string): Promise<string> => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      try {
        const playerId = crypto.randomUUID();
        const data = await apiRequest<{ code: string; player: PlayerScore }>("/rooms", {
          method: "POST",
          body: JSON.stringify({ hostName: name, hostId: playerId }),
        });

        dispatch({
          type: "SET_IDENTITY",
          payload: { id: playerId, name, isHost: true, roomCode: data.code },
        });
        dispatch({ type: "UPDATE_PLAYERS", payload: [data.player] });
        dispatch({ type: "SET_STATUS", payload: "lobby" });

        setupChannel(data.code, playerId, name, true);
        return data.code;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao criar sala";
        dispatch({ type: "SET_ERROR", payload: msg });
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [setupChannel]
  );

  const joinRoom = useCallback(
    async (name: string, code: string): Promise<void> => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      try {
        const playerId = crypto.randomUUID();
        const data = await apiRequest<{ player: PlayerScore; players: PlayerScore[] }>(
          `/rooms/${code.toUpperCase()}/join`,
          {
            method: "POST",
            body: JSON.stringify({ playerName: name, playerId }),
          }
        );

        dispatch({
          type: "SET_IDENTITY",
          payload: { id: playerId, name, isHost: false, roomCode: code.toUpperCase() },
        });
        dispatch({ type: "UPDATE_PLAYERS", payload: data.players });
        dispatch({ type: "SET_STATUS", payload: "lobby" });

        setupChannel(code.toUpperCase(), playerId, name, false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao entrar na sala";
        dispatch({ type: "SET_ERROR", payload: msg });
        throw err;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [setupChannel]
  );

  const startGame = useCallback(() => {
    if (!stateRef.current.isHost) return;
    broadcast({
      type: "QUESTION_START",
      questionIndex: 0,
      startTime: Date.now(),
    });
  }, [broadcast]);

  const submitAnswer = useCallback(
    async (answerIndex: number): Promise<void> => {
      const s = stateRef.current;
      if (s.hasAnswered) return;

      const question = questions[s.currentQuestionIndex];
      const isCorrect = answerIndex === question.correct;

      // Optimistic local update
      dispatch({
        type: "ANSWER_SUBMITTED",
        payload: { isCorrect, pointsEarned: 0, selectedAnswer: answerIndex },
      });

      try {
        const data = await apiRequest<{
          isCorrect: boolean;
          pointsEarned: number;
          answeredCount: number;
        }>(`/rooms/${s.roomCode}/answer`, {
          method: "POST",
          body: JSON.stringify({
            playerId: s.playerId,
            playerName: s.playerName,
            questionIndex: s.currentQuestionIndex,
            answerIndex,
          }),
        });

        // Correct points from server
        dispatch({
          type: "ANSWER_SUBMITTED",
          payload: {
            isCorrect: data.isCorrect,
            pointsEarned: data.pointsEarned,
            selectedAnswer: answerIndex,
          },
        });

        // Broadcast to host that someone answered
        broadcast({
          type: "PLAYER_ANSWERED",
          playerId: s.playerId,
          answeredCount: data.answeredCount,
        });
      } catch (err) {
        console.log("Error submitting answer:", err);
      }
    },
    [broadcast]
  );

  const leaveGame = useCallback(() => {
    clearHostTimer();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    dispatch({ type: "RESET" });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHostTimer();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <GameContext.Provider value={{ state, createRoom, joinRoom, startGame, submitAnswer, leaveGame }}>
      {children}
    </GameContext.Provider>
  );
}
