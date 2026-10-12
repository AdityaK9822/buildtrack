let io;

class SocketService {
  init(socketServer) {
    io = socketServer;
    console.log('Socket.io service initialized');
  }

  getIO() {
    return io;
  }

  joinProject(socketId, projectId) {
    if (io) {
      io.to(socketId).emit('joined-project', { projectId });
    }
  }

  broadcastProgress(projectId, update) {
    if (io) {
      io.to(`project-${projectId}`).emit('progress-update', {
        projectId,
        ...update,
        timestamp: new Date(),
      });
    }
  }

  broadcastMilestoneApproval(milestoneId, status, projectId) {
    if (io) {
      io.to(`project-${projectId}`).emit('milestone-update', {
        milestoneId,
        status,
        timestamp: new Date(),
      });
    }
  }

  broadcastPhoto(projectId, photo) {
    if (io) {
      io.to(`project-${projectId}`).emit('photo-uploaded', {
        projectId,
        photo,
        timestamp: new Date(),
      });
    }
  }

  broadcastMaterialDelivery(projectId, material) {
    if (io) {
      io.to(`project-${projectId}`).emit('material-delivered', {
        projectId,
        material,
        timestamp: new Date(),
      });
    }
  }

  notifyUser(userId, notification) {
    if (io) {
      io.emit(`notification-${userId}`, {
        ...notification,
        timestamp: new Date(),
      });
    }
  }
}

module.exports = new SocketService();
