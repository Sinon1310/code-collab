# Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER TAB 1                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React App (App.jsx)                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │        Monaco Editor Instance                     │   │   │
│  │  │  • Renders code                                   │   │   │
│  │  │  • Captures onChange events                       │   │   │
│  │  │  • Preserves cursor position                      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │    Socket.io Client (socket.js)                  │   │   │
│  │  │  • Connects to ws://localhost:3001               │   │   │
│  │  │  • Emits: join-room, code-change                 │   │   │
│  │  │  • Listens: code-update, user-count              │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ WebSocket (Socket.io)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                              │
│                    Port 3001                                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Express + Socket.io Server                       │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │         Room Manager (Map)                       │   │   │
│  │  │                                                   │   │   │
│  │  │  room-1: {                                       │   │   │
│  │  │    code: "console.log('hello')",                │   │   │
│  │  │    users: Set(['abc123', 'def456'])             │   │   │
│  │  │  }                                               │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  Event Handlers:                                         │   │
│  │  • join-room    → Add user, send current code           │   │
│  │  • code-change  → Broadcast to other users              │   │
│  │  • disconnect   → Remove user, clean up rooms           │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ WebSocket (Socket.io)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER TAB 2                            │
│                    (Same structure as Tab 1)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Event Flow: User Types "Hello"

```
┌─────────────┐
│   TAB 1     │  User types "H"
│   Monaco    │
└──────┬──────┘
       │
       │ onChange(value="Hello")
       ▼
┌─────────────────────────────┐
│   App.jsx                   │
│   handleChange()            │
│                             │
│   if (isRemoteChange)       │──── false ✓
│     return;                 │
│                             │
│   socket.emit('code-change',│
│     { roomId, code })       │
└──────┬──────────────────────┘
       │
       │ WebSocket ──────────────────────────┐
       ▼                                     │
┌──────────────────────────┐                │
│   SERVER (Node.js)       │                │
│   index.js               │                │
│                          │                │
│   on('code-change')      │                │
│   • Update room.code     │                │
│   • socket.to(roomId)    │                │
│     .emit('code-update') │                │
└──────┬───────────────────┘                │
       │                                     │
       │ WebSocket (broadcast to others)    │
       ▼                                     │
┌─────────────────────────────┐             │
│   TAB 2                     │             │
│   App.jsx                   │             │
│                             │             │
│   socket.on('code-update')  │             │
│   • isRemoteChange = true   │             │
│   • editor.setValue(code)   │             │
│   • Cursor preserved        │             │
└──────┬──────────────────────┘             │
       │                                     │
       │ onChange(value="Hello")             │
       │ triggered by setValue()             │
       ▼                                     │
┌─────────────────────────────┐             │
│   App.jsx                   │             │
│   handleChange()            │             │
│                             │             │
│   if (isRemoteChange)       │──── true ✓  │
│     return; ◄───────────────────────────┘ │
│                             │   STOPS HERE │
│   ❌ No emit to server      │   (No loop!) │
└─────────────────────────────┘              │
       │                                     │
       │ Reset flag                          │
       ▼                                     │
   isRemoteChange = false                    │
```

## State Management

### Client State
```javascript
// App.jsx
const editorRef = useRef(null);           // Monaco editor instance
const isRemoteChange = useRef(false);     // Echo prevention flag
const [isConnected, setIsConnected] = useState(false);  // Socket status
const [userCount, setUserCount] = useState(0);          // Active users
```

### Server State
```javascript
// index.js
const rooms = new Map();  // Key: roomId, Value: { code, users }

// Example:
Map {
  "room-1" => {
    code: "console.log('hello');",
    users: Set(['abc123', 'def456', 'xyz789'])
  }
}
```

## Socket.io Events Reference

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `"room-1"` | Join a collaboration room |
| `code-change` | `{ roomId: "room-1", code: "..." }` | Send code update |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `code-update` | `"console.log('hi');"` | Receive code from others |
| `user-count` | `3` | Number of users in room |
| `connect` | (automatic) | Socket connection established |
| `disconnect` | (automatic) | Socket connection lost |

## Code Synchronization Strategy

### Scenario 1: Sequential Editing (No Conflicts)
```
Tab 1 types:  "Hello"
Tab 2 types:  (waits)
Tab 3 types:  (waits)

Result: ✅ Perfect sync
Server code: "Hello"
```

### Scenario 2: Simultaneous Editing (Race Condition)
```
Tab 1 types:  "Hello" (line 1)
Tab 2 types:  "World" (line 1) ← at the same time

Server receives:
  1. "Hello" from Tab 1
  2. "World" from Tab 2

Result: ⚠️ Last write wins
Server code: "World"
Tab 1 sees: "World" (overwrites local "Hello")
```

**Why This Happens:**
- No Operational Transform (OT) yet
- Server doesn't merge edits intelligently
- Simple "last write wins" strategy

**Fix in Phase 3:**
- Implement OT algorithm
- Track operation timestamps
- Transform conflicting operations

## Performance Characteristics

### Message Frequency
```
User types:     "H" → "He" → "Hel" → "Hell" → "Hello"
Events sent:    5 (one per keystroke)
Broadcasts:     5 (one per event)
```

### Optimization Opportunities (Future)
```javascript
// Debounce code-change events
const debouncedEmit = debounce((code) => {
  socket.emit('code-change', { roomId, code });
}, 100); // Wait 100ms after last keystroke
```

### Scalability Limits (Current)
- **Users per room:** ~5-10 (beyond that, lag increases)
- **Message rate:** Unlimited (no throttling)
- **Memory:** O(n) per room (n = code length)
- **Network:** O(m) broadcasts per change (m = users)

## Security Considerations (Not Implemented)

⚠️ **Production-Ready Checklist:**
- [ ] Authentication (who can join rooms?)
- [ ] Authorization (room ownership/permissions)
- [ ] Input validation (sanitize code)
- [ ] Rate limiting (prevent spam)
- [ ] Room ID obfuscation (UUIDs instead of "room-1")
- [ ] Code size limits (prevent memory exhaustion)
- [ ] WebSocket CSRF protection

## Comparison with Production Tools

| Feature | Our Editor | Google Docs | VSCode Live Share |
|---------|------------|-------------|-------------------|
| Real-time sync | ✅ Basic | ✅ OT | ✅ OT |
| Live cursors | ❌ Phase 2 | ✅ | ✅ |
| Conflict resolution | ❌ Phase 3 | ✅ | ✅ |
| Code execution | ❌ Phase 3 | N/A | ✅ |
| Persistence | ❌ Phase 4 | ✅ | ❌ |
| Authentication | ❌ Phase 4 | ✅ | ✅ |
| Scalability | Low | High | Medium |

## Technical Decisions

### Why Socket.io (not raw WebSockets)?
- ✅ Auto-reconnection
- ✅ Room/namespace support
- ✅ Fallback to HTTP long-polling
- ✅ Built-in heartbeat/ping-pong

### Why Monaco (not CodeMirror)?
- ✅ Used by VSCode (battle-tested)
- ✅ Rich API (decorations for cursors)
- ✅ IntelliSense support
- ✅ Multi-language syntax

### Why useRef for isRemoteChange?
- ✅ Doesn't trigger re-renders
- ✅ Persists across renders
- ✅ Mutable without setState

### Why Map for rooms (not plain object)?
- ✅ Better performance for frequent additions/deletions
- ✅ Can use non-string keys (if needed)
- ✅ Built-in size property
- ✅ Iterable

## Next Phase Architecture Changes

### Phase 2: Live Cursors
```javascript
// Server broadcasts cursor positions
socket.on('cursor-move', ({ roomId, userId, position }) => {
  socket.to(roomId).emit('cursor-update', { userId, position });
});

// Client renders decorations
editor.deltaDecorations([], [
  {
    range: new monaco.Range(line, col, line, col),
    options: {
      className: 'remote-cursor',
      hoverMessage: { value: 'User 2' }
    }
  }
]);
```

### Phase 3: Operational Transform
```javascript
// Transform operations to resolve conflicts
function transform(op1, op2) {
  if (op1.position < op2.position) return [op1, op2];
  if (op1.position > op2.position) {
    op1.position += op2.length;
    return [op1, op2];
  }
  // Handle conflicts...
}
```

---

**Key Insight:** The `isRemoteChange` ref is the heart of echo prevention. Without it, we'd have infinite loops! 🔄🚫
