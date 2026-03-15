import { Play, Download, Copy, Users, Settings, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

function Toolbar({ userCount, roomId, onRun, onThemeToggle, theme }) {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Left side - Logo & Room */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          <span style={{ 
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>⚡</span>
          <span style={{ letterSpacing: '-0.5px' }}>CodeCollab</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          backdropFilter: 'blur(10px)'
        }}>
          <Users size={16} />
          <span style={{ fontWeight: '600' }}>{userCount}</span>
          <span style={{ opacity: 0.9 }}>online</span>
        </div>

        <div style={{
          padding: '0.375rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          letterSpacing: '0.5px'
        }}>
          Room: {roomId}
        </div>
      </div>

      {/* Right side - Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={copyRoomLink}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: copied ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            if (!copied) e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            if (!copied) e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Share Room'}
        </button>

        <button
          onClick={onRun}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(16, 185, 129, 0.9)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(5, 150, 105, 1)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.9)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Play size={16} />
          Run Code
        </button>

        <button
          onClick={onThemeToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          {theme === 'vs-dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
