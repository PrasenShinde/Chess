import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { userService, friendService } from "../services/api";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import UserSearchResult from "../components/friends/UserSearchResult.jsx";
import { Search, UserCheck, UserPlus, AlertCircle, Loader2 } from "lucide-react";

export default function FriendsPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'friends' | 'pending'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchState, setSearchState] = useState({
    loading: false,
    error: "",
    result: null,
    relationship: null,
    searched: false,
  });

  const [friendsList, setFriendsList] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [challengeToast, setChallengeToast] = useState("");

  const abortControllerRef = useRef(null);

  // Load friends and requests
  const loadFriendsData = async () => {
    setLoadingFriends(true);
    try {
      const data = await friendService.getFriends();
      setFriendsList(data.friends || []);
      setIncomingRequests(data.incomingRequests || []);
      setOutgoingRequests(data.outgoingRequests || []);
    } catch (err) {
      console.error("Failed to load friends data", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setSearchState({
        loading: false,
        error: "Please enter a username.",
        result: null,
        relationship: null,
        searched: true,
      });
      return;
    }

    // Cancel previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSearchState({
      loading: true,
      error: "",
      result: null,
      relationship: null,
      searched: true,
    });

    try {
      const response = await userService.searchUser(query, abortControllerRef.current.signal);
      setSearchState({
        loading: false,
        error: "",
        result: response.user,
        relationship: response.relationship,
        searched: true,
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      setSearchState({
        loading: false,
        error: err.message || "Something went wrong. Please try again.",
        result: null,
        relationship: null,
        searched: true,
      });
    }
  };

  const handleChallenge = (targetUser) => {
    if (!socket || !isConnected) {
      setChallengeToast("Socket disconnected. Please check connection.");
      setTimeout(() => setChallengeToast(""), 3000);
      return;
    }

    socket.emit("send-challenge", { targetUserId: targetUser.id, timeControl: "rapid" });
    setChallengeToast(`Challenge sent to ${targetUser.username}!`);
    setTimeout(() => setChallengeToast(""), 4000);
  };

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col font-sans">
      <SiteHeader />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Friends</h1>
            <p className="text-ink/60 text-sm mt-1">
              Search for players by username, manage friend requests, and challenge opponents.
            </p>
          </div>

          <div className="flex bg-accent/20 p-1 rounded-xl border border-accent/40 text-sm font-medium">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
                activeTab === "search"
                  ? "bg-white text-ink shadow-sm font-semibold"
                  : "text-ink/65 hover:text-ink"
              }`}
            >
              <Search size={16} />
              Search
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
                activeTab === "friends"
                  ? "bg-white text-ink shadow-sm font-semibold"
                  : "text-ink/65 hover:text-ink"
              }`}
            >
              <UserCheck size={16} />
              Friends ({friendsList.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition relative ${
                activeTab === "pending"
                  ? "bg-white text-ink shadow-sm font-semibold"
                  : "text-ink/65 hover:text-ink"
              }`}
            >
              <UserPlus size={16} />
              Requests
              {incomingRequests.length > 0 && (
                <span className="ml-1 rounded-full bg-primary text-cream text-xs px-1.5 py-0.2 font-bold">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {challengeToast && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold text-center animate-in fade-in">
            {challengeToast}
          </div>
        )}

        {activeTab === "search" && (
          <div className="space-y-6">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username..."
                className="w-full rounded-2xl border border-accent bg-white py-3.5 pl-12 pr-28 text-base font-medium text-ink placeholder:text-ink/40 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Search className="absolute left-4 text-ink/40" size={20} />
              <button
                type="submit"
                disabled={searchState.loading}
                className="absolute right-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-cream transition hover:opacity-90 disabled:opacity-50"
              >
                {searchState.loading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </button>
            </form>

            <div className="mt-8">
              {searchState.loading && (
                <div className="rounded-2xl border border-accent/40 bg-white p-8 text-center shadow-sm">
                  <Loader2 className="animate-spin mx-auto text-primary mb-3" size={28} />
                  <p className="text-ink/60 font-medium">Searching for username...</p>
                </div>
              )}

              {!searchState.loading && searchState.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 shadow-sm">
                  <AlertCircle className="mx-auto mb-2 text-red-500" size={28} />
                  <p className="font-semibold text-base mb-1">{searchState.error}</p>
                  {searchState.error.includes("not found") && (
                    <p className="text-xs text-red-500/80">We couldn't find anyone with that username.</p>
                  )}
                </div>
              )}

              {!searchState.loading && searchState.searched && searchState.result && (
                <UserSearchResult
                  user={searchState.result}
                  relationship={searchState.relationship}
                  onChallenge={handleChallenge}
                  onRelationshipChange={(newRel) =>
                    setSearchState((prev) => ({ ...prev, relationship: newRel }))
                  }
                />
              )}

              {!searchState.searched && !searchState.loading && (
                <div className="rounded-2xl border border-accent/40 bg-white p-12 text-center shadow-sm">
                  <Search className="mx-auto text-accent mb-3" size={40} />
                  <h3 className="font-bold text-lg text-ink">Search for a friend by username</h3>
                  <p className="text-sm text-ink/50 mt-1 max-w-sm mx-auto">
                    Type an exact username above to find other chess players, view their profiles, send friend requests, or initiate challenges.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="space-y-4">
            {loadingFriends ? (
              <div className="p-8 text-center text-ink/60 font-medium">Loading friends list...</div>
            ) : friendsList.length === 0 ? (
              <div className="rounded-2xl border border-accent/40 bg-white p-12 text-center shadow-sm">
                <UserCheck className="mx-auto text-accent mb-3" size={40} />
                <h3 className="font-bold text-lg text-ink">No friends added yet</h3>
                <p className="text-sm text-ink/50 mt-1">
                  Use the Search tab above to find and add friends.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friendsList.map((friend) => (
                  <UserSearchResult
                    key={friend.id}
                    user={friend}
                    relationship="FRIENDS"
                    onChallenge={handleChallenge}
                    onRelationshipChange={() => loadFriendsData()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-bold text-lg text-ink mb-3 flex items-center gap-2">
                Incoming Requests
                {incomingRequests.length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5 font-bold">
                    {incomingRequests.length}
                  </span>
                )}
              </h2>

              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-accent/40 bg-white p-6 text-center text-sm text-ink/50">
                  No incoming friend requests.
                </div>
              ) : (
                <div className="grid gap-3">
                  {incomingRequests.map((req) => (
                    <UserSearchResult
                      key={req.requestId}
                      user={req.user}
                      relationship="PENDING_RECEIVED"
                      onChallenge={handleChallenge}
                      onRelationshipChange={() => loadFriendsData()}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-bold text-lg text-ink mb-3">Outgoing Requests</h2>

              {outgoingRequests.length === 0 ? (
                <div className="rounded-2xl border border-accent/40 bg-white p-6 text-center text-sm text-ink/50">
                  No pending outgoing requests.
                </div>
              ) : (
                <div className="grid gap-3">
                  {outgoingRequests.map((req) => (
                    <UserSearchResult
                      key={req.requestId}
                      user={req.user}
                      relationship="PENDING_SENT"
                      onChallenge={handleChallenge}
                      onRelationshipChange={() => loadFriendsData()}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
