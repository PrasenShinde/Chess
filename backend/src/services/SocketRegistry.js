class SocketRegistry {
  constructor() {
    if (!SocketRegistry.instance) {
      this.sockets = new Map();
      SocketRegistry.instance = this;
    }
    return SocketRegistry.instance;
  }

  register(userId, socket) {
    this.sockets.set(userId, socket);
  }

  unregister(userId) {
    this.sockets.delete(userId);
  }

  get(userId) {
    return this.sockets.get(userId) || null;
  }
}

const socketRegistry = new SocketRegistry();
export default socketRegistry;
