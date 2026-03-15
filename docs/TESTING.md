# Phase 1 Complete - Testing Guide

## ✅ What We've Built

Phase 1 of the Real-Time Collaborative Code Editor is **COMPLETE**! Here's what's working:

### Core Features ✨
- **Real-time synchronization** between multiple browser tabs
- **Monaco Editor** with full syntax highlighting
- **Automatic state sync** for late joiners
- **Connection status** with live user count
- **Cursor preservation** during remote updates
- **Room persistence** on the server

## 🧪 How to Test

### Prerequisites
✅ Both server and client are running (you should see them in terminal)
- Server: `http://localhost:3001`
- Client: `http://localhost:5174` (or 5173)

### Test Case 1: Basic Two-User Sync
1. Open `http://localhost:5174` in **Chrome Tab 1**
2. Wait for green status bar "🟢 Connected to room: room-1"
3. Should show "👥 1 user online"
4. Open `http://localhost:5174` in **Chrome Tab 2**
5. Both tabs now show "👥 2 users online"
6. Type in Tab 1: `console.log("Hello from Tab 1");`
7. **Watch Tab 2** → text appears instantly! ✅
8. Type in Tab 2: `console.log("Hello from Tab 2");`
9. **Watch Tab 1** → text appears instantly! ✅

### Test Case 2: Late Joiner Gets Existing Code
1. In Tab 1, write some code:
   ```javascript
   function hello() {
     console.log("This was written before you joined!");
   }
   ```
2. Open **Tab 3** (new tab)
3. Tab 3 should immediately show the existing code ✅
4. User count increases to 3 ✅

### Test Case 3: Disconnection Handling
1. Close Tab 1 (or press Ctrl+W)
2. Other tabs show user count decrease (2 users) ✅
3. Close all tabs and reopen → code is reset (no persistence yet)

### Test Case 4: Multi-User Chaos 🎪
1. Open 4-5 tabs
2. Type rapidly in different tabs
3. All tabs should sync (may have some lag) ✅

### Test Case 5: Cursor Position
1. In Tab 1, type: `const a = 1;`
2. Place cursor after `const`
3. In Tab 2, add a new line at the top
4. Tab 1's cursor should stay roughly in the same position ✅

## 🎯 What You Should See

### When Everything Works:
- ✅ Green status bar: "🟢 Connected to room: room-1"
- ✅ User count updates when tabs open/close
- ✅ Typing in one tab appears in others **instantly**
- ✅ Console logs show "Received remote code update"
- ✅ No infinite loops or flickering

### Browser Console (F12):
```
Connected to server
Monaco Editor mounted
Received remote code update
Room room-1 now has 2 user(s)
```

### Server Terminal:
```
Server running on port 3001
User connected: abc123xyz
abc123xyz joined room room-1
Room room-1 now has 1 user(s)
User connected: def456uvw
def456uvw joined room room-1
Room room-1 now has 2 user(s)
```

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot find module '@monaco-editor/react'"
**Fix:**
```bash
cd client
npm install @monaco-editor/react socket.io-client
```

### Issue 2: Changes Not Syncing
**Symptoms:** Type in Tab 1, nothing happens in Tab 2

**Debug Steps:**
1. Check status bar is **green** (not red)
2. Open browser console (F12) → look for errors
3. Check server terminal for "User connected" logs
4. Try refreshing both tabs

**Fix:**
- Restart server: `Ctrl+C` in server terminal, then `node index.js`
- Restart client: `Ctrl+C` in client terminal, then `npm run dev`

### Issue 3: Port Already in Use
**Symptoms:** `Port 5173 is in use`

**Fix:** Vite automatically tries the next port (5174, 5175...). Just use the URL shown in terminal.

### Issue 4: Connection Keeps Dropping (Red Status Bar)
**Fix:**
1. Check server is running: `http://localhost:3001` should respond
2. Check firewall isn't blocking WebSocket connections
3. Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Issue 5: Cursor Jumps Around
**Expected behavior!** This is a known limitation without Operational Transform.
- If user A types at line 1 while user B is at line 10, cursor positions shift
- Will be fixed in future phases with proper OT

### Issue 6: Rapid Typing Causes Conflicts
**Expected behavior!** Without OT, simultaneous edits can race.
- Try taking turns typing to see clean sync
- This is why Google Docs uses OT (coming in Phase 3)

## 🔍 Advanced Debugging

### Enable Socket.io Debug Logs
**Client (`socket.js`):**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  debug: true
});

export default socket;
```

### Check Server Room State
Add to `server/index.js`:
```javascript
// After socket.on('disconnect', ...)
setInterval(() => {
  console.log('Active rooms:', Array.from(rooms.keys()));
  rooms.forEach((room, id) => {
    console.log(`  ${id}: ${room.users.size} users, ${room.code.length} chars`);
  });
}, 10000); // Every 10 seconds
```

### Monitor Network Tab
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Click the WebSocket connection
5. See all messages in real-time

## 📊 Performance Metrics

### Expected Latency:
- **Local network**: <50ms
- **Localhost**: <10ms

### Message Size:
- Average: ~100-500 bytes per keystroke
- With full file: ~1-10 KB

### Scalability (Current):
- ⚠️ **Not production-ready**
- Works well for 2-5 users per room
- No message throttling (sends on every keystroke)
- No compression

## 🎓 Understanding the Code Flow

### When User Types in Tab 1:
```
1. User presses key in Monaco Editor
2. onChange(value) fires
3. Check isRemoteChange ref → false
4. socket.emit('code-change', { roomId, code })
5. Server receives → updates room.code
6. Server: socket.to(roomId).emit('code-update', code)
7. Tab 2 receives 'code-update' event
8. Set isRemoteChange = true
9. editor.setValue(newCode)
10. onChange fires again (from setValue)
11. Check isRemoteChange → true → SKIP emit (breaks loop)
12. Reset isRemoteChange = false
```

### The Echo Prevention Pattern:
```javascript
// Without this, infinite loop occurs:
// Tab 1 emit → Tab 2 receives → Tab 2 emits → Tab 1 receives → repeat forever

const isRemoteChange = useRef(false);

const handleChange = (value) => {
  if (isRemoteChange.current) {
    isRemoteChange.current = false;
    return; // DON'T emit back to server
  }
  socket.emit('code-change', { roomId: ROOM_ID, code: value });
};

socket.on('code-update', (newCode) => {
  isRemoteChange.current = true; // Mark as remote
  editor.setValue(newCode); // This triggers onChange
  // onChange sees isRemoteChange=true and skips emit
});
```

## ✅ Success Criteria

You've successfully completed Phase 1 if:
- [x] Can see changes sync between 2+ tabs instantly
- [x] User count updates correctly
- [x] Connection status shows green when connected
- [x] Late joiners receive existing code
- [x] No console errors
- [x] Server logs show room activity

## 🚀 Next Steps (Phase 2)

Now that basic sync works, we can add:
1. **Live Cursors** - See where others are typing
2. **User Names** - Assign colors and labels
3. **Chat Sidebar** - Communicate while coding
4. **Presence Indicators** - Who's active/idle

Would you like to proceed with Phase 2? 🎯

---

**Need help?** Check the main README.md for architecture details.
