import React, { useEffect, useRef } from 'react';

const COLORS = [
  '#000000', // Black
  '#434343', // Charcoal
  '#c62828', // Crimson
  '#1565c0', // Blue
  '#2e7d32', // Green
  '#6a1b9a', // Purple
  '#e65100', // Orange
  '#4e342e', // Brown
  '#c2185b', // Pink
  '#00695c', // Teal
  '#0d47a1', // Navy
  '#ff8f00'  // Amber
];

export default function ColorPicker({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const applyColor = (color) => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
    onClose();
  };

  const applyReset = () => {
    document.execCommand('removeFormat', false, null);
    // fallback for some browsers
    document.execCommand('foreColor', false, '#111111');
    onClose();
  };

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', zIndex: 100,
      backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {COLORS.map(c => (
          <button 
            key={c}
            onClick={() => applyColor(c)}
            style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: c, border: '1px solid rgba(0,0,0,0.1)' }}
          />
        ))}
      </div>
      <button 
        onClick={applyReset}
        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', background: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee' }}
      >
        Reset to Default
      </button>
    </div>
  );
}
