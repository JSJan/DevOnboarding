import { Server, Socket } from 'socket.io';

let io: Server;

export function setupSocketHandlers(socketServer: Server) {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Client joins an installation room to receive progress updates
    socket.on('join-installation', (installationId: string) => {
      socket.join(installationId);
      console.log(`Client ${socket.id} joined installation ${installationId}`);
    });

    socket.on('leave-installation', (installationId: string) => {
      socket.leave(installationId);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
