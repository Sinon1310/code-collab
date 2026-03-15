import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Users } from 'lucide-react';
import socket from './socket';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import UserPanel from './components/UserPanel';

const ROOM_ID = 'room-1'; // hardcoded for now

function App() {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [theme, setTheme] = useState('vs-dark');
  const [language, setLanguage] = useState('javascript');
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [users, setUsers] = useState([
    { id: '1', name: 'You' },
  ]);

  useEffect(() => {
    // Connection status handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      socket.emit('join-room', ROOM_ID);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Handle incoming code updates from other users
    socket.on('code-update', (newCode) => {
      console.log('Received remote code update');
      if (editorRef.current) {
        isRemoteChange.current = true;
        
        // Get current cursor position to restore it after update
        const position = editorRef.current.getPosition();
        
        // Update the editor value
        editorRef.current.setValue(newCode);
        
        // Restore cursor position if it's still valid
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    });

    // Handle user count updates
    socket.on('user-count', (count) => {
      setUserCount(count);
    });

    // Initial join if already connected
    if (socket.connected) {
      socket.emit('join-room', ROOM_ID);
      setIsConnected(true);
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('code-update');
      socket.off('user-count');
    };
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    console.log('Monaco Editor mounted');
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleRunCode = () => {
    const code = editorRef.current?.getValue();
    console.log('Running code:', code);
    alert('Code execution coming in Phase 3! 🚀\n\nFor now, check the browser console.');
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark');
  };

  const handleChange = (value) => {
    // Skip emit if this change was triggered by a remote update
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    
    // Emit local changes to other users in the room
    if (socket.connected) {
      socket.emit('code-change', { roomId: ROOM_ID, code: value });
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#1e1e1e',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <Toolbar 
        userCount={userCount}
        roomId={ROOM_ID}
        onRun={handleRunCode}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Editor */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Editor
            height="100%"
            defaultLanguage={language}
            defaultValue={`// Welcome to CodeCollab! ⚡
// 
// This is a real-time collaborative code editor.
// Open this in multiple browser tabs to see the magic happen!
//
// Features:
// - Real-time synchronization across all users
// - Monaco Editor (same as VS Code)
// - Live user presence
// - More features coming soon!

function greet(name) {
  return \`Hello, \${name}! Welcome to collaborative coding.\`;
}

console.log(greet("World"));

// Try typing something and watch it appear in other tabs! ✨`}
            onChange={handleChange}
            onMount={handleEditorDidMount}
            theme={theme}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
              fontLigatures: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
            }}
          />

          {/* Floating User Button */}
          <button
            onClick={() => setShowUserPanel(!showUserPanel)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s',
              zIndex: 50
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <Users size={24} />
            {userCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #1e1e1e'
              }}>
                {userCount}
              </div>
            )}
          </button>
        </div>

        {/* User Panel */}
        <UserPanel 
          users={users}
          isOpen={showUserPanel}
          onClose={() => setShowUserPanel(false)}
        />
      </div>
      
      {/* Status Bar */}
      <StatusBar 
        isConnected={isConnected}
        language={language}
        cursorPosition={cursorPosition}
      />
    </div>
  );
}

export default App;