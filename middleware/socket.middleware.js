const errorMiddleware = (error, socket, next) => {
    if (error.name === 'UnauthorizedError') {
      socket.emit('error', 'Unauthorized access');
    } else {
      socket.emit('error', 'An error occurred');
    }
    next();
  };

module.exports = errorMiddleware