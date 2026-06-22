import React from 'react';
import { useDocument } from '../context/DocumentContext';

export default function Sidebar() {
  const { mode, bookmarks, blocks } = useDocument();

  return (
    <div style={{
      width: 200,
      minWidth: 200,
      maxWidth: 200,
      backgroundColor: '#fafafa',
      borderRight: '1px solid #eaeaea',
      overflowY: 'auto',
      padding: '14px 12px',
      flexShrink: 0,
    }}>
      <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
        Bookmarks
      </h3>
      {bookmarks.size === 0 ? (
        <div style={{ fontSize: '0.75rem', color: '#bbb', fontStyle: 'italic' }}>No bookmarks yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from(bookmarks).map(id => {
            const block = blocks.find(b => b.id === id);
            if (!block) return null;
            return (
              <div
                key={id}
                style={{ fontSize: '0.78rem', padding: '6px 8px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => {
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div style={{ color: '#aaa', fontSize: '0.6rem', textTransform: 'uppercase', marginBottom: '2px' }}>{block.type.replace(/-/g, ' ')}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {block.html.replace(/<[^>]*>?/gm, '') || 'Empty block'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Quick Tips
        </h3>

        {mode === 'screenplay' && (
          <>
            <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '8px', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
              <strong style={{ display: 'block', color: '#333', marginBottom: '2px', fontSize: '0.75rem' }}>Scene Heading</strong>
              INT./EXT. — Location — Time
            </div>
            <div style={{ fontSize: '0.72rem', color: '#666', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
              <strong style={{ display: 'block', color: '#333', marginBottom: '2px', fontSize: '0.75rem' }}>Dialogue Flow</strong>
              Character → Parenth. → Dialogue
            </div>
          </>
        )}
        {mode === 'natak' && (
          <div style={{ fontSize: '0.72rem', color: '#666', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
            <strong style={{ display: 'block', color: '#333', marginBottom: '2px', fontSize: '0.75rem' }}>Acts & Scenes</strong>
            Anka (Act) → Drishya (Scene) → Samvaad
          </div>
        )}
        {mode === 'story' && (
          <div style={{ fontSize: '0.72rem', color: '#666', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
            <strong style={{ display: 'block', color: '#333', marginBottom: '2px', fontSize: '0.75rem' }}>Story Mode</strong>
            Chapter → Paragraph → Section Break
          </div>
        )}
      </div>
    </div>
  );
}
