/**
 * VoiceMoveButton.jsx
 * UI Component for the Speak-To-Move feature.
 * Renders an interactive microphone button with states: Idle, Listening, Processing, Move Played, Error.
 */

import React from "react";
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from "lucide-react";
import { useVoiceMove } from "../hooks/useVoiceMove";

export default function VoiceMoveButton({
  boardFen,
  turn,
  playerColor,
  status,
  makeMove,
}) {
  const {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    error,
    transcript,
    isSupported,
    canSpeakMove,
  } = useVoiceMove({
    boardFen,
    turn,
    playerColor,
    status,
    makeMove,
  });

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-xl text-xs text-ink/50" title="Web Speech API not supported in this browser">
        <MicOff size={14} className="text-ink/40" />
        <span>Voice Move Unsupported</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canSpeakMove || isProcessing}
        className={`relative flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-red-500/30 shadow-lg scale-105"
            : isProcessing
            ? "bg-amber-500 text-white cursor-wait"
            : !canSpeakMove
            ? "bg-gray-200 text-ink/40 cursor-not-allowed border border-gray-300"
            : "bg-primary text-cream hover:bg-primary/90 active:scale-95 hover:shadow-md"
        }`}
        title={
          !canSpeakMove
            ? status !== "playing"
              ? "Game is not active"
              : "Wait for your turn"
            : isListening
            ? "Click to stop listening"
            : "Click to speak a move (e.g. 'Knight f3', 'Pawn e4', 'Castle')"
        }
      >
        {isProcessing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isListening ? (
          <Mic size={18} className="animate-bounce" />
        ) : (
          <Mic size={18} />
        )}

        <span>
          {isProcessing
            ? "Processing..."
            : isListening
            ? "Listening..."
            : "Speak Move"}
        </span>
      </button>

      {/* Spoken Transcript or Error feedback display */}
      {isListening && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium animate-pulse">
          <Volume2 size={12} />
          <span>Say a move like "Pawn e4", "Knight f3", "Castle"</span>
        </div>
      )}

      {transcript && !error && (
        <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg font-mono">
          "{transcript}"
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
          <AlertCircle size={12} className="shrink-0" />
          <span className="truncate max-w-[200px]">{error}</span>
        </div>
      )}
    </div>
  );
}
