import React, { useState, useRef, useEffect } from 'react';
import { useDocument } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import { PanelLeft, Undo2, Redo2, FileText, Drama, BookOpen, LogOut, ChevronDown, WifiOff } from 'lucide-react';
import DocumentActions from './Modals/DocumentActions';

export default function Header({ sidebarOpen, toggleSidebar }) {
  const { mode, switchMode, canUndo, canRedo, undo, redo, lastSaved, isSaving, isOffline } = useDocument();
  const { user, signOut } = useAuth();

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const modeBtn = (id, icon, label) => (
    <button
      onClick={() => switchMode(id)}
      style={{
        padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem',
        fontWeight: mode === id ? 600 : 400,
        background: mode === id ? '#fff' : 'transparent',
        boxShadow: mode === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        display: 'flex', alignItems: 'center', gap: '5px',
        color: mode === id ? '#111' : '#555',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea',
        zIndex: 10, flexShrink: 0,
      }}>
        {/* Left: toggle + logo + mode switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleSidebar}
            style={{ padding: '6px', borderRadius: '4px', background: sidebarOpen ? '#f0f0f0' : 'transparent', color: '#555' }}
            title="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </button>

          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.03em', color: '#111' }}>
            लेखन मंच
          </span>

          <div style={{ width: 1, height: 20, background: '#e0e0e0' }} />

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: '#f4f4f4', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {modeBtn('screenplay', <FileText size={13} />, 'Screenplay')}
            {modeBtn('natak',      <Drama    size={13} />, 'Drama')}
            {modeBtn('story',      <BookOpen size={13} />, 'Story')}
          </div>
        </div>

        {/* Right: save indicator, undo/redo, document menu, save draft, avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Save status */}
          {isSaving ? (
            <div style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15', animation: 'pulse 1s infinite' }} />
              Saving…
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          ) : lastSaved ? (
            <div style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              Saved
            </div>
          ) : null}

          <div style={{ width: 1, height: 22, background: '#eaeaea' }} />

          <button onClick={undo} disabled={!canUndo} style={{ padding: '6px', color: canUndo ? '#333' : '#ccc', borderRadius: '4px' }} title="Undo (Ctrl+Z)">
            <Undo2 size={17} />
          </button>
          <button onClick={redo} disabled={!canRedo} style={{ padding: '6px', color: canRedo ? '#333' : '#ccc', borderRadius: '4px' }} title="Redo (Ctrl+Y)">
            <Redo2 size={17} />
          </button>

          <div style={{ width: 1, height: 22, background: '#eaeaea' }} />

          <DocumentActions />

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-drafts'))}
            style={{
              padding: '6px 12px', background: '#111', color: '#fff',
              borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
            title="Manage Drafts (Ctrl+S)"
          >
            Save Draft
          </button>

          {/* User Avatar + Dropdown */}
          {user && (
            <div ref={avatarMenuRef} style={{ position: 'relative', marginLeft: '4px' }}>
              <button
                onClick={() => setAvatarMenuOpen(v => !v)}
                style={{ padding: 0, background: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '20px' }}
                title={user.displayName}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #eaeaea', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <ChevronDown size={12} style={{ color: '#888', transition: 'transform 0.15s', transform: avatarMenuOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {avatarMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 180,
                  backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px', zIndex: 100,
                }}>
                  {/* User info */}
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                      {user.displayName || 'User'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                      {user.email}
                    </div>
                  </div>
                  {/* Sign out */}
                  <button
                    onClick={() => { setAvatarMenuOpen(false); signOut(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                      padding: '7px 12px', background: 'none', fontSize: '0.82rem',
                      color: '#dc2626', borderRadius: '4px', textAlign: 'left', cursor: 'pointer',
                      marginTop: '4px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Offline banner */}
      {isOffline && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          backgroundColor: '#fef3c7', borderBottom: '1px solid #fde68a',
          padding: '6px 20px', fontSize: '0.78rem', color: '#92400e',
        }}>
          <WifiOff size={13} />
          Offline — changes are saved locally and will sync when reconnected.
        </div>
      )}
    </>
  );
}
