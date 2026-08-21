import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendService } from "../../services/api.js";
import { UserPlus, Check, Swords, UserCheck, X } from "lucide-react";

export default function UserSearchResult({ user, relationship: initialRelationship, onChallenge, onRelationshipChange }) {
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(initialRelationship || "NONE");
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleSendRequest = async (e) => {
    e.stopPropagation();
    setLoadingAction("send");
    setErrorMessage("");
    try {
      const res = await friendService.sendFriendRequest(user.id);
      const newRel = res.relationship || "PENDING_SENT";
      setRelationship(newRel);
      onRelationshipChange?.(newRel);
    } catch (err) {
      setErrorMessage(err.message || "Failed to send request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptRequest = async (e) => {
    e.stopPropagation();
    setLoadingAction("accept");
    setErrorMessage("");
    try {
      const res = await friendService.acceptFriendRequest(user.id);
      const newRel = res.relationship || "FRIENDS";
      setRelationship(newRel);
      onRelationshipChange?.(newRel);
    } catch (err) {
      setErrorMessage(err.message || "Failed to accept request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectRequest = async (e) => {
    e.stopPropagation();
    setLoadingAction("reject");
    setErrorMessage("");
    try {
      const res = await friendService.rejectFriendRequest(user.id);
      const newRel = res.relationship || "NONE";
      setRelationship(newRel);
      onRelationshipChange?.(newRel);
    } catch (err) {
      setErrorMessage(err.message || "Failed to reject request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveFriend = async (e) => {
    e.stopPropagation();
    setLoadingAction("remove");
    setErrorMessage("");
    try {
      const res = await friendService.removeFriend(user.id);
      const newRel = res.relationship || "NONE";
      setRelationship(newRel);
      onRelationshipChange?.(newRel);
    } catch (err) {
      setErrorMessage(err.message || "Failed to remove friend");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChallengeClick = (e) => {
    e.stopPropagation();
    if (onChallenge) {
      onChallenge(user);
    }
  };

  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
  const isSelf = relationship === "SELF";

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-accent/60 bg-white p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={user.username}
            className="h-14 w-14 rounded-full border-2 border-accent/40 bg-accent/10 object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-ink group-hover:text-primary transition-colors">
              {user.username}
            </h3>
            {isSelf && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-ink/50 font-mono mt-0.5">
            Rating: <span className="font-semibold text-primary">{user.rating ?? 200}</span>
          </p>
          {errorMessage && (
            <p className="text-xs text-red-500 font-medium mt-1">{errorMessage}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 border-accent/30 pt-3 sm:pt-0">
        {isSelf ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${user.username}`);
            }}
            className="rounded-xl border border-accent px-4 py-2 text-sm font-medium text-ink hover:bg-accent/10 transition"
          >
            View Profile
          </button>
        ) : (
          <>
            {relationship === "NONE" && (
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={Boolean(loadingAction)}
                className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 shadow-sm shadow-green-600/20"
              >
                <UserPlus size={16} />
                {loadingAction === "send" ? "Sending..." : "Add Friend"}
              </button>
            )}

            {relationship === "PENDING_SENT" && (
              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 cursor-not-allowed"
              >
                <Check size={16} />
                Request Sent
              </button>
            )}

            {relationship === "PENDING_RECEIVED" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptRequest}
                  disabled={Boolean(loadingAction)}
                  className="flex items-center gap-1 rounded-xl bg-green-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 shadow-sm"
                >
                  <Check size={14} />
                  {loadingAction === "accept" ? "Accepting..." : "Accept"}
                </button>
                <button
                  type="button"
                  onClick={handleRejectRequest}
                  disabled={Boolean(loadingAction)}
                  className="flex items-center gap-1 rounded-xl border border-accent/60 px-3.5 py-2 text-xs font-semibold text-ink/70 hover:bg-accent/10 disabled:opacity-50"
                >
                  <X size={14} />
                  {loadingAction === "reject" ? "Rejecting..." : "Reject"}
                </button>
              </div>
            )}

            {relationship === "FRIENDS" && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-xl border border-green-300 bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-700">
                  <UserCheck size={14} />
                  Friends
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFriend}
                  disabled={Boolean(loadingAction)}
                  className="rounded-xl border border-red-200 px-2.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                  title="Remove Friend"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleChallengeClick}
              className="flex items-center gap-1.5 rounded-xl border border-ink/20 bg-ink text-white px-4 py-2 text-sm font-semibold transition hover:bg-ink/80 shadow-sm"
            >
              <Swords size={16} />
              Challenge
            </button>
          </>
        )}
      </div>
    </div>
  );
}
