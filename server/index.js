const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Store room state (code content + users for each room)
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userName, userId, userColor }) => {
    socket.join(roomId);
    console.log(`${userName} (${socket.id}) joined room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: '// Start coding...\n// Open this in multiple tabs to see real-time collaboration!',
        users: new Map() // Map of userId -> user data
      });
    }
    
    // Add user to room
    const room = rooms.get(roomId);
    room.users.set(socket.id, { 
      userName, 
      userId: socket.id, 
      userColor,
      socketId: socket.id 
    });
    
    // Send current code to the newly joined user
    socket.emit('code-update', room.code);
    
    // Send updated users list to all users in the room
    const usersList = Array.from(room.users.values()).map(u => ({
      id: u.userId,
      name: u.userName,
      color: u.userColor
    }));
    io.to(roomId).emit('users-update', usersList);
    
    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', { userName, userId: socket.id });
    
    console.log(`Room ${roomId} now has ${room.users.size} user(s)`);
  });

  socket.on('code-change', ({ roomId, code }) => {
    // Update room's code state
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
    }
    
    // Broadcast to all other users in the room
    socket.to(roomId).emit('code-update', code);
  });

  // Handle cursor movements
  socket.on('cursor-move', ({ roomId, position, userName, userId, color }) => {
    // Broadcast cursor position to other users in the room
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      position,
      userName,
      color
    });
  });

  // Handle chat messages
  socket.on('chat-message', ({ roomId, message }) => {
    // Broadcast message to all other users in the room
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        
        // Send updated users list
        const usersList = Array.from(room.users.values()).map(u => ({
          id: u.userId,
          name: u.userName,
          color: u.userColor
        }));
        io.to(roomId).emit('users-update', usersList);
        
        // Notify others that user left
        socket.to(roomId).emit('user-left', { 
          userName: user.userName, 
          userId: socket.id 
        });
        
        console.log(`Room ${roomId} now has ${room.users.size} user(s)`);
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  });
});

server.listen(3001, () => console.log('Server running on port 3001'));