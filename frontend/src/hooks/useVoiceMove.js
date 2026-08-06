/**
 * useVoiceMove.js
 * React hook to integrate Voice Move feature into the multiplayer chess UI.
 * Exposes listening states, controls, transcript, and error handlers.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import SpeechRecognizer from "../voice/SpeechRecognizer.js";
import VoiceController from "../voice/VoiceController.js";
import speechFeedback from "../voice/SpeechFeedback.js";

/**
 * Custom React hook for Voice Move control.
 *
 * @param {Object} params
 * @param {string} params.boardFen Current position FEN string
 * @param {string} params.turn Current turn ('w' | 'b')
 * @param {string} params.playerColor Assigned player color ('white' | 'black')
 * @param {string} params.status Game status ('playing' | 'game_over' | ...)
 * @param {Function} params.makeMove Move callback function `(from, to, promotion)`
 * @returns {Object} { startListening, stopListening, isListening, isProcessing, error, transcript, lastMove, isSupported }
 */
export function useVoiceMove({ boardFen, turn, playerColor, status, makeMove }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [lastMove, setLastMove] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognizerRef = useRef(null);

  const turnColor = turn === "w" ? "white" : "black";
  const isMyTurn = playerColor === turnColor;
  const isGameActive = status === "playing";
  const canSpeakMove = isMyTurn && isGameActive;

  useEffect(() => {
    const supported = SpeechRecognizer.checkSupport();
    setIsSupported(supported);

    if (supported) {
      recognizerRef.current = new SpeechRecognizer({ lang: "en-US", continuous: false });
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopListening();
      }
      speechFeedback.cancel();
    };
  }, []);

  const handleResult = useCallback(
    (rawTranscript) => {
      setIsListening(false);
      setIsProcessing(true);
      setError(null);
      setTranscript(rawTranscript);

      try {
        // Instantiate chess.js with current board FEN
        const chess = new Chess(boardFen || undefined);

        // Process command via VoiceController
        const result = VoiceController.processCommand(rawTranscript, chess, makeMove);

        if (result.success) {
          setLastMove(result.move);
        } else {
          setError(result.error || "Could not process move.");
        }
      } catch (err) {
        const errMsg = "Error processing voice command.";
        setError(errMsg);
        speechFeedback.speak(errMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [boardFen, makeMove]
  );

  const handleError = useCallback((errorMessage) => {
    setIsListening(false);
    setIsProcessing(false);
    setError(errorMessage);
    speechFeedback.speak(errorMessage);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = "Speech recognition is not supported in this browser.";
      setError(msg);
      speechFeedback.speak(msg);
      return;
    }

    if (!canSpeakMove) {
      const msg = !isGameActive
        ? "Game is not active."
        : "Wait for your turn to speak a move.";
      setError(msg);
      speechFeedback.speak(msg);
      return;
    }

    setError(null);
    setTranscript("");

    if (recognizerRef.current) {
      speechFeedback.speak("Listening.");
      recognizerRef.current.startListening({
        onStart: () => setIsListening(true),
        onResult: handleResult,
        onError: handleError,
        onEnd: () => setIsListening(false),
      });
    }
  }, [isSupported, canSpeakMove, isGameActive, handleResult, handleError]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopListening();
    }
    setIsListening(false);
    speechFeedback.cancel();
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    error,
    transcript,
    lastMove,
    isSupported,
    canSpeakMove,
  };
}

export default useVoiceMove;
