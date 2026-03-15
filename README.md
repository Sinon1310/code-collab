# ⚡ CodeCollab

> Real-time collaborative code editor — built from scratch.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Multiple users can edit the same file simultaneously in real time — like a lightweight VS Code Live Share, built entirely from scratch using WebSockets and Operational Transform.

---

## ✨ Features

- **Real-time sync** — Code changes broadcast instantly to all users in the same room
- **Monaco Editor** — The same editor that powers VS Code
- **Live cursors** — See other users' cursor positions with color-coded labels
- **Integrated chat** — Talk without leaving the editor
- **Code execution** — Run code in isolated Docker containers and see output inline
- **Language selection** — Switch between JavaScript, Python, and more
- **Room system** — Share a URL to instantly invite collaborators

---

## 🏗️ Architecture

```
client (React + Monaco)  ←── WebSocket ──→  server (Node.js + Socket.io)
                                                       │
                                               ┌───────┴───────┐
                                          OT Engine       Docker Runner
                                       (conflict res)    (code execution)
```

**Operational Transform (OT)** handles conflicting edits when two users type at the same time — no lost keystrokes, no cursor jumps.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Monaco Editor, Socket.io-client |
| Backend | Node.js, Express, Socket.io |
| Sync | Operational Transform |
| Code Execution | Docker (isolated containers) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional, for code execution)

### Run Locally

```bash
# Clone
git clone https://github.com/Sinon1310/codecollab.git
cd codecollab

# Start server
cd server
npm install
node index.js

# Start client (new terminal)
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in two browser tabs and start typing — changes sync instantly.

---

## 📁 Project Structure

```
collab-editor/
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Editor.jsx      # Monaco Editor + sync logic
│       │   ├── Cursors.jsx     # Live cursor overlays
│       │   ├── Chat.jsx        # Real-time chat panel
│       │   └── Toolbar.jsx     # Language selector, run button
│       ├── socket.js           # Socket.io client setup
│       └── App.jsx
└── server/               # Node.js backend
    ├── index.js          # Express + Socket.io entry
    ├── roomManager.js    # Room state management
    ├── ot.js             # Operational Transform engine
    └── runner.js         # Docker code execution
```

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Join a room by ID |
| `code-change` | Client → Server | Broadcast a code delta |
| `code-update` | Server → Client | Receive others' changes |
| `cursor-move` | Client → Server | Broadcast cursor position |
| `chat-message` | Client ↔ Server | Send/receive chat |
| `run-code` | Client → Server | Execute code in Docker |
| `run-output` | Server → Client | Stream execution output |

---

## 🗺️ Roadmap

- [x] Real-time code sync via WebSockets
- [x] Monaco Editor integration
- [x] OT conflict resolution
- [x] Live cursors
- [x] Chat panel
- [x] Code execution (Docker)
- [ ] Dynamic room IDs via URL
- [ ] Language-aware execution (Python, Go)
- [ ] Interview mode (interviewer/candidate roles)
- [ ] Persistent rooms with saved code

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built as a portfolio project to explore real-time systems, WebSocket architecture, and collaborative editing algorithms.*