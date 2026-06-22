import React from 'react';

export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', backgroundColor: '#fafafa',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Animated ring */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid #e5e5e5',
        borderTopColor: '#111',
        animation: 'spin 0.75s linear infinite',
        marginBottom: 20,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.03em', color: '#111' }}>
        लेखन मंच
      </span>
      <span style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
        Loading your workspace…
      </span>
    </div>
  );
}
