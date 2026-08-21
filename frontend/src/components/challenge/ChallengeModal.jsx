import { useState, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { Swords, X, Check, AlertCircle } from "lucide-react";

export default function ChallengeModal() {
  const { socket } = useSocket();
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleChallengeReceived = (challenge) => {
      setIncomingChallenge(challenge);
    };

    const handleChallengeDeclined = ({ declinedBy }) => {
      setIncomingChallenge(null);
      setToastMessage(`${declinedBy || "Opponent"} declined your challenge.`);
      setTimeout(() => setToastMessage(null), 4000);
    };

    const handleChallengeCancelled = () => {
      setIncomingChallenge(null);
      setToastMessage("Challenge was cancelled.");
      setTimeout(() => setToastMessage(null), 3000);
    };

    const handleChallengeError = ({ message }) => {
      setToastMessage(message || "Challenge error");
      setTimeout(() => setToastMessage(null), 4000);
    };

    socket.on("challenge-received", handleChallengeReceived);
    socket.on("challenge-declined", handleChallengeDeclined);
    socket.on("challenge-cancelled", handleChallengeCancelled);
    socket.on("challenge-error", handleChallengeError);

    return () => {
      socket.off("challenge-received", handleChallengeReceived);
      socket.off("challenge-declined", handleChallengeDeclined);
      socket.off("challenge-cancelled", handleChallengeCancelled);
      socket.off("challenge-error", handleChallengeError);
    };
  }, [socket]);

  const handleAccept = () => {
    if (!incomingChallenge) return;
    socket.emit("accept-challenge", { challengeId: incomingChallenge.challengeId });
    setIncomingChallenge(null);
  };

  const handleDecline = () => {
    if (!incomingChallenge) return;
    socket.emit("decline-challenge", { challengeId: incomingChallenge.challengeId });
    setIncomingChallenge(null);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink text-cream px-5 py-3.5 shadow-2xl border border-accent/20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <AlertCircle className="text-amber-400 shrink-0" size={20} />
          <p className="text-sm font-medium">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {incomingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 shadow-2xl border border-accent/20 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 animate-bounce">
              <Swords size={32} />
            </div>

            <h3 className="text-2xl font-bold text-ink mb-1">Game Challenge!</h3>
            <p className="text-sm text-ink/60 mb-4">
              <span className="font-bold text-primary">{incomingChallenge.challenger?.username}</span> challenged you to a{" "}
              <span className="font-semibold text-ink uppercase">{incomingChallenge.timeControl}</span> match!
            </p>

            <div className="flex items-center justify-center gap-3 bg-cream/60 p-3 rounded-xl border border-accent/40 mb-6">
              <img
                src={
                  incomingChallenge.challenger?.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${incomingChallenge.challenger?.username}`
                }
                alt="challenger avatar"
                className="w-10 h-10 rounded-full border border-accent/40 bg-white"
              />
              <div className="text-left">
                <p className="font-bold text-sm text-ink">{incomingChallenge.challenger?.username}</p>
                <p className="text-xs text-ink/50 font-mono">Rating: {incomingChallenge.challenger?.rating ?? 200}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 rounded-xl border border-accent/60 px-4 py-3 text-sm font-semibold text-ink/70 hover:bg-accent/10 transition"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 shadow-md shadow-green-600/20 transition"
              >
                <Check size={18} />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
