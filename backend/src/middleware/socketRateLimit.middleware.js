const buckets = new Map();

export const checkSocketRateLimit = (
  userId,
  event,
  { windowMs = 60_000, max = 60 } = {},
) => {
  const key = `${userId}:${event}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count += 1;
  return true;
};

export const socketRateLimit = (event, limits = {}) => {
  return (socket, handler) => {
    return async (...args) => {
      const userId = socket.user?.id;
      if (!userId) {
        return;
      }

      if (!checkSocketRateLimit(userId, event, limits)) {
        socket.emit("move-error", { message: "Too many requests. Slow down." });
        return;
      }

      return handler(...args);
    };
  };
};
