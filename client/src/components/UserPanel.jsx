import { Users, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import Chat from './Chat';

function UserPanel({ users, isOpen, onClose, socket, roomId, userName }) {
  const [activeTab, setActiveTab] = useState('users');

  if (!isOpen) return null;

  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '320px',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.3)',
      zIndex: 100,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid #333'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              background: activeTab === 'users' ? '#667eea' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeTab === 'users' ? 'white' : '#858585',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            Users
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              background: activeTab === 'chat' ? '#667eea' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeTab === 'chat' ? 'white' : '#858585',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={16} />
            Chat
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.375rem',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#858585',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#333';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#858585';
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#858585',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Active Users ({users.length})
          </div>

          {users.map((user, index) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: '#252526',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: colors[index % colors.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#d4d4d4',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {user.name}
                </div>
                <div style={{
                  color: '#858585',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginTop: '0.125rem'
                }}>
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981'
                    }}
                  />
                  Online
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}>
          <Chat socket={socket} roomId={roomId} userName={userName} />
        </div>
      )}
    </div>
  );
}

export default UserPanel;
