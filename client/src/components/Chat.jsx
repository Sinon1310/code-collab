import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

function Chat({ socket, roomId, userName }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave notifications
    socket.on('user-joined', ({ userName, userId }) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${userName} joined the room`,
        timestamp: Date.now(),
      }]);
    });

    socket.on('user-left', ({ userName, userId }) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${userName} left the room`,
        timestamp: Date.now(),
      }]);
    });

    return () => {
      socket.off('chat-message');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const message = {
      userName,
      content: inputValue,
      timestamp: Date.now(),
      type: 'user',
    };

    socket.emit('chat-message', { roomId, message });
    setMessages(prev => [...prev, { ...message, isOwn: true }]);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#252526',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#858585',
            fontSize: '0.875rem',
            textAlign: 'center',
            padding: '2rem',
          }}>
            <div>
              <Smile size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>No messages yet.</div>
              <div>Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#d4d4d4',
            fontSize: '0.875rem',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#333'}
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim()}
          style={{
            padding: '0.75rem',
            background: inputValue.trim() ? '#667eea' : '#333',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (inputValue.trim()) e.target.style.background = '#5568d3';
          }}
          onMouseLeave={(e) => {
            if (inputValue.trim()) e.target.style.background = '#667eea';
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function Message({ message }) {
  if (message.type === 'system') {
    return (
      <div style={{
        textAlign: 'center',
        color: '#858585',
        fontSize: '0.75rem',
        padding: '0.5rem',
      }}>
        {message.content}
      </div>
    );
  }

  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: message.isOwn ? 'flex-end' : 'flex-start',
    }}>
      {!message.isOwn && (
        <div style={{
          fontSize: '0.75rem',
          color: '#858585',
          marginBottom: '0.25rem',
          paddingLeft: '0.5rem',
        }}>
          {message.userName}
        </div>
      )}
      <div style={{
        maxWidth: '70%',
        padding: '0.75rem 1rem',
        background: message.isOwn ? '#667eea' : '#333',
        borderRadius: message.isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        color: 'white',
        fontSize: '0.875rem',
        wordBreak: 'break-word',
      }}>
        {message.content}
      </div>
      <div style={{
        fontSize: '0.625rem',
        color: '#858585',
        marginTop: '0.25rem',
        paddingLeft: message.isOwn ? 0 : '0.5rem',
        paddingRight: message.isOwn ? '0.5rem' : 0,
      }}>
        {time}
      </div>
    </div>
  );
}

export default Chat;
