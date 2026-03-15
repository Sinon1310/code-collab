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

// Store room state (code content for each room)
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: '// Start coding...\n// Open this in multiple tabs to see real-time collaboration!',
        users: new Set()
      });
    }
    
    // Add user to room
    const room = rooms.get(roomId);
    room.users.add(socket.id);
    
    // Send current code to the newly joined user
    socket.emit('code-update', room.code);
    
    // Notify room about user count
    io.to(roomId).emit('user-count', room.users.size);
    
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        io.to(roomId).emit('user-count', room.users.size);
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