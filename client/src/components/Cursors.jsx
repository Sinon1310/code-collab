import { useEffect, useState } from 'react';

// User color palette
const USER_COLORS = [
  '#667eea', // Purple
  '#f093fb', // Pink
  '#4facfe', // Blue
  '#43e97b', // Green
  '#fa709a', // Rose
  '#feca57', // Yellow
  '#ee5a6f', // Red
  '#00d2ff', // Cyan
  '#a8edea', // Mint
  '#fed6e3', // Light Pink
];

function Cursors({ cursors, editorRef }) {
  const [decorations, setDecorations] = useState([]);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const newDecorations = [];

    Object.entries(cursors).forEach(([userId, cursor]) => {
      if (!cursor.position) return;

      const { lineNumber, column } = cursor.position;
      const color = cursor.color || USER_COLORS[0];
      const name = cursor.name || 'Anonymous';

      // Create cursor decoration
      newDecorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        },
        options: {
          className: 'remote-cursor',
          stickiness: 1,
          hoverMessage: { value: `**${name}**` },
          beforeContentClassName: 'remote-cursor-line',
          afterContentClassName: 'remote-cursor-label',
          after: {
            content: name,
            inlineClassName: 'remote-cursor-label-text',
            inlineClassNameAffectsLetterSpacing: true,
          },
          zIndex: 10,
        },
      });

      // Inject custom styles for this user's cursor
      injectCursorStyles(userId, color);
    });

    // Update decorations
    const oldDecorations = decorations;
    const newDecorationsIds = editor.deltaDecorations(oldDecorations, newDecorations);
    setDecorations(newDecorationsIds);

    return () => {
      if (editor) {
        editor.deltaDecorations(decorations, []);
      }
    };
  }, [cursors, editorRef]);

  return null; // This is a logical component, no UI
}

// Helper to inject cursor styles
function injectCursorStyles(userId, color) {
  const styleId = `cursor-style-${userId}`;
  
  // Remove existing style if any
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Inject new style
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .remote-cursor-${userId} {
      background-color: ${color} !important;
      width: 2px !important;
      position: relative;
    }
    
    .remote-cursor-${userId}::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      height: 100%;
      background-color: ${color};
      animation: cursor-blink-${userId} 1s infinite;
    }
    
    .remote-cursor-label-${userId} {
      position: absolute;
      top: -20px;
      left: 0;
      background-color: ${color};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes cursor-blink-${userId} {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0.3; }
    }
  `;
  document.head.appendChild(style);
}

// Get a consistent color for a user ID
export function getUserColor(userId, userCount) {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export default Cursors;
