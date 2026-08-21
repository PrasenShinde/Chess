import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { userService, friendService } from "../services/api";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import {
  UserCircle2,
  Trophy,
  Swords,
  UserPlus,
  Check,
  UserCheck,
  X,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  const [profileData, setProfileData] = useState(null);
  const [relationship, setRelationship] = useState("NONE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const targetUsername = paramUsername || currentUser?.username;

  useEffect(() => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getPublicProfile(targetUsername);
        setProfileData(data.user);
        setRelationship(data.relationship || "NONE");
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUsername]);

  if (authLoading) {
    return (
      <div className="min-h-svh bg-cream text-ink flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // If user hits /profile directly without a parameter, redirect to their own username URL
  if (!paramUsername) {
    if (currentUser?.username) {
      return <Navigate to={`/profile/${currentUser.username}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const isOwnProfile =
    currentUser &&
    profileData &&
    (profileData.id === currentUser.id ||
      profileData.username?.toLowerCase() === currentUser.username?.toLowerCase());

  const handleSendFriendRequest = async () => {
    setActionLoading("send");
    try {
      const res = await friendService.sendFriendRequest(profileData.id);
      setRelationship(res.relationship || "PENDING_SENT");
      setToastMessage("Friend request sent!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(err.message || "Failed to send friend request");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async () => {
    setActionLoading("accept");
    try {
      const res = await friendService.acceptFriendRequest(profileData.id);
      setRelationship(res.relationship || "FRIENDS");
      setToastMessage("Friend request accepted!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(err.message || "Failed to accept request");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async () => {
    setActionLoading("reject");
    try {
      const res = await friendService.rejectFriendRequest(profileData.id);
      setRelationship(res.relationship || "NONE");
      setToastMessage("Friend request rejected.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(err.message || "Failed to reject request");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async () => {
    setActionLoading("remove");
    try {
      const res = await friendService.removeFriend(profileData.id);
      setRelationship(res.relationship || "NONE");
      setToastMessage("Friend removed.");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(err.message || "Failed to remove friend");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChallenge = () => {
    if (!socket || !isConnected) {
      setToastMessage("Socket disconnected. Please check connection.");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }
    socket.emit("send-challenge", { targetUserId: profileData.id, timeControl: "rapid" });
    setToastMessage(`Challenge sent to ${profileData.username}!`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const avatarUrl =
    profileData?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData?.username || targetUsername}`;

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col font-sans">
      <SiteHeader />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {toastMessage && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold text-center animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-accent/40 bg-white p-12 text-center shadow-sm">
            <Loader2 className="animate-spin mx-auto text-primary mb-3" size={36} />
            <p className="text-ink/60 font-medium">Loading profile...</p>
          </div>
        ) : error || !profileData ? (
          <div className="rounded-3xl border border-accent bg-white p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={44} />
            <h2 className="text-2xl font-bold text-ink mb-1">User Not Found</h2>
            <p className="text-ink/60 text-sm mb-6">
              The profile <span className="font-semibold text-ink">@{targetUsername}</span> doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/friends")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-cream transition hover:opacity-90 shadow-md shadow-primary/20"
            >
              <ArrowLeft size={16} /> Back to Friends
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="rounded-3xl border border-accent/60 bg-white p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src={avatarUrl}
                  alt={profileData.username}
                  className="w-24 h-24 rounded-full border-4 border-accent/30 bg-accent/10 object-cover shadow-inner shrink-0"
                />

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-ink flex items-center justify-center sm:justify-start gap-2">
                        {profileData.username}
                        {isOwnProfile && (
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                            You
                          </span>
                        )}
                      </h1>
                      <p className="text-sm text-ink/50 font-mono mt-1">
                        @{profileData.username}
                      </p>
                    </div>

                    {/* Social Actions Header */}
                    {!isOwnProfile && (
                      <div className="flex items-center gap-2.5 justify-center sm:justify-end">
                        {relationship === "NONE" && (
                          <button
                            type="button"
                            onClick={handleSendFriendRequest}
                            disabled={Boolean(actionLoading)}
                            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-600/20"
                          >
                            <UserPlus size={16} />
                            {actionLoading === "send" ? "Sending..." : "Add Friend"}
                          </button>
                        )}

                        {relationship === "PENDING_SENT" && (
                          <button
                            type="button"
                            disabled
                            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 cursor-not-allowed"
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
                              disabled={Boolean(actionLoading)}
                              className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-600/20"
                            >
                              <Check size={16} />
                              {actionLoading === "accept" ? "Accepting..." : "Accept"}
                            </button>
                            <button
                              type="button"
                              onClick={handleRejectRequest}
                              disabled={Boolean(actionLoading)}
                              className="flex items-center gap-1 rounded-xl border border-accent/60 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:bg-accent/10 disabled:opacity-50"
                            >
                              <X size={16} />
                              {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                            </button>
                          </div>
                        )}

                        {relationship === "FRIENDS" && (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700">
                              <UserCheck size={16} />
                              Friends
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFriend}
                              disabled={Boolean(actionLoading)}
                              className="rounded-xl border border-red-200 p-2.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                              title="Remove Friend"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleChallenge}
                          className="flex items-center gap-1.5 rounded-xl border border-ink/20 bg-ink text-white px-5 py-2.5 text-sm font-bold transition hover:bg-ink/80 shadow-md shadow-ink/10"
                        >
                          <Swords size={16} />
                          Challenge
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-ink/65">
                    <div className="flex items-center gap-1.5">
                      <Trophy size={16} className="text-primary" />
                      <span>Rating: <strong className="text-ink">{profileData.rating ?? 200}</strong></span>
                    </div>
                    {profileData.createdAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-ink/40" />
                        <span>Joined {new Date(profileData.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="mt-8 pt-6 border-t border-accent/40 flex items-center justify-between">
                  <div className="text-sm text-ink/60">
                    Logged in as <strong className="text-ink">{currentUser.email}</strong>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 shadow-md shadow-red-600/20"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>

            {/* Stats Breakdown */}
            <div className="rounded-3xl border border-accent/60 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-ink mb-6">Game Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-cream/60 p-5 border border-accent/30 text-center">
                  <p className="text-xs text-ink/50 font-bold uppercase tracking-wider">Total Games</p>
                  <p className="text-3xl font-extrabold text-ink mt-1">
                    {profileData.stats?.gamesPlayed ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-green-50/60 p-5 border border-green-200/60 text-center">
                  <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Wins</p>
                  <p className="text-3xl font-extrabold text-green-600 mt-1">
                    {profileData.stats?.wins ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Draws</p>
                  <p className="text-3xl font-extrabold text-gray-600 mt-1">
                    {profileData.stats?.draws ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50/60 p-5 border border-red-200/60 text-center">
                  <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Losses</p>
                  <p className="text-3xl font-extrabold text-red-500 mt-1">
                    {profileData.stats?.losses ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
