export const registerRoomHandlers = (io, socket) => {
  const user = socket.user;

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`[Leave Room] User ${user.username} left room ${roomId}`);
    // Additional logic like auto-resigning could go here
  });
  
  socket.on("room-chat", ({ roomId, message }) => {
    // Basic room chat placeholder
    socket.to(roomId).emit("room-chat", {
      sender: user.username,
      message,
      timestamp: new Date()
    });
  });
};
