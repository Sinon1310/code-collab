import { Wifi, WifiOff, Circle } from 'lucide-react';

function StatusBar({ isConnected, language, cursorPosition }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1.25rem',
      background: '#1e1e1e',
      borderTop: '1px solid #333',
      color: '#858585',
      fontSize: '0.75rem',
      fontFamily: 'monospace'
    }}>
      {/* Left side - Connection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          color: isConnected ? '#10b981' : '#ef4444'
        }}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span style={{ fontWeight: '600' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem'
        }}>
          <Circle size={8} fill="#10b981" color="#10b981" />
          <span>Synced</span>
        </div>
      </div>

      {/* Right side - Editor info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          Language: <span style={{ color: '#d4d4d4' }}>{language}</span>
        </div>
        
        {cursorPosition && (
          <div>
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </div>
        )}

        <div>
          UTF-8
        </div>

        <div style={{ color: '#d4d4d4' }}>
          Spaces: 2
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
