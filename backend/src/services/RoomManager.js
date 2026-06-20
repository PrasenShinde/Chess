class RoomManager {
  constructor() {
    if (!RoomManager.instance) {
      // Maps roomId -> roomObject
      this.rooms = new Map();
      RoomManager.instance = this;
    }
    return RoomManager.instance;
  }

  /**
   * Create and store a new active room
   * @param {string} roomId - The unique room ID
   * @param {Object} whitePlayer - The user playing white
   * @param {Object} blackPlayer - The user playing black
   * @returns {Object} The created room object
   */
  createRoom(roomId, whitePlayer, blackPlayer) {
    const room = {
      roomId,
      whitePlayer: { id: whitePlayer.id, username: whitePlayer.username },
      blackPlayer: { id: blackPlayer.id, username: blackPlayer.username },
      status: "playing",
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    console.log(`[RoomManager] Room created: ${roomId}`);
    return room;
  }

  /**
   * Get an active room by ID
   * @param {string} roomId 
   * @returns {Object|undefined}
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Remove a room (e.g., when a game finishes)
   * @param {string} roomId 
   */
  removeRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room removed: ${roomId}`);
    }
  }

  findRoomByUserId(userId) {
    for (const room of this.rooms.values()) {
      if (room.whitePlayer.id === userId || room.blackPlayer.id === userId) {
        return room;
      }
    }
    return null;
  }
}

// Export singleton instance
const roomManager = new RoomManager();
export default roomManager;
