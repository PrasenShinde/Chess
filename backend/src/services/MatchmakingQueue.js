class MatchmakingQueue {
  constructor() {
    if (!MatchmakingQueue.instance) {
      // Map prevents duplicate entries if a user clicks Play multiple times
      // Maps userId -> { user, socket }
      this.queue = new Map();
      MatchmakingQueue.instance = this;
    }
    return MatchmakingQueue.instance;
  }

  /**
   * Add a user to the matchmaking queue
   * @param {Object} user - The user object from the database
   * @param {import("socket.io").Socket} socket - The socket instance
   */
  add(user, socket) {
    if (!this.queue.has(user.id)) {
      this.queue.set(user.id, { user, socket });
      console.log(`[Queue] Added user ${user.username} (Queue size: ${this.queue.size})`);
    }
  }

  /**
   * Remove a user from the matchmaking queue
   * @param {string} userId - The user's ID
   */
  remove(userId) {
    if (this.queue.has(userId)) {
      this.queue.delete(userId);
      console.log(`[Queue] Removed user ${userId} (Queue size: ${this.queue.size})`);
    }
  }

  /**
   * Get the current size of the queue
   * @returns {number}
   */
  get size() {
    return this.queue.size;
  }

  /**
   * Extract the first two players from the queue
   * @returns {Array<{user: Object, socket: Object}>} Array containing two player objects
   */
  extractTwoPlayers() {
    if (this.queue.size < 2) return null;

    const iterator = this.queue.entries();
    
    // Get first player
    const firstEntry = iterator.next().value;
    const player1 = firstEntry[1];
    
    // Get second player
    const secondEntry = iterator.next().value;
    const player2 = secondEntry[1];

    // Remove them from the queue
    this.remove(player1.user.id);
    this.remove(player2.user.id);

    return [player1, player2];
  }
}

// Export a singleton instance
const queue = new MatchmakingQueue();
export default queue;
