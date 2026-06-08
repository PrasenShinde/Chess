class OnlineUsersService {
  constructor() {
    if (!OnlineUsersService.instance) {
      this.users = new Map(); // Maps userId -> socketId
      OnlineUsersService.instance = this;
    }
    return OnlineUsersService.instance;
  }

  /**
   * Add a user to the online users list
   * @param {string} userId - User's unique ID
   * @param {string} socketId - Socket connection ID
   */
  addUser(userId, socketId) {
    this.users.set(userId, socketId);
  }

  /**
   * Remove a user from the online users list
   * @param {string} userId - User's unique ID
   */
  removeUser(userId) {
    this.users.delete(userId);
  }

  /**
   * Get a user's socket ID by their user ID
   * @param {string} userId - User's unique ID
   * @returns {string|undefined} Socket ID or undefined if not found
   */
  getSocketId(userId) {
    return this.users.get(userId);
  }

  /**
   * Get an array of all currently online user IDs
   * @returns {string[]} Array of user IDs
   */
  getAllOnlineUsers() {
    return Array.from(this.users.keys());
  }
}

// Export a singleton instance
const onlineUsers = new OnlineUsersService();
export default onlineUsers;
