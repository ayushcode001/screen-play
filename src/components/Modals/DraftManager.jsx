import React, { useState, useEffect, useRef } from 'react';
import { useDocument } from '../../context/DocumentContext';
import { subscribeToDrafts, deleteDraft } from '../../firebase/draftsService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, History, FolderOpen } from 'lucide-react';

export default function DraftManager() {
  const { user } = useAuth();
  const { mode, title, subtitle, blocks, customTypes, bookmarks, explicitSave, loadDraftIntoEditor } = useDocument();
  const [isOpen,     setIsOpen]     = useState(false);
  const [drafts,     setDrafts]     = useState([]);
  const [draftName,  setDraftName]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const unsubRef = useRef(null);

  // ── Open/close via event & Ctrl+S ─────────────────────────────────────────
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleKey  = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('open-drafts', handleOpen);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('open-drafts', handleOpen);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  // ── Real-time Firestore subscription while modal is open ───────────────────
  useEffect(() => {
    if (!isOpen || !user) return;
    unsubRef.current = subscribeToDrafts(user.uid, (data, err) => {
      if (!err) setDrafts(data);
    });
    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [isOpen, user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Save draft ─────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    setSaving(true);
    const name = draftName.trim() || title || `Draft — ${new Date().toLocaleString()}`;
    try {
      await explicitSave(name);
      setDraftName('');
      showToast('✓ Draft saved to cloud');
    } catch {
      showToast('⚠ Save failed — check connection');
    } finally {
      setSaving(false);
    }
  };

  // ── Restore draft ──────────────────────────────────────────────────────────
  const handleRestore = (draft) => {
    if (window.confirm(`Open draft "${draft.title}"? Unsaved changes in the current session will be lost.`)) {
      loadDraftIntoEditor(draft);
      setIsOpen(false);
    }
  };

  // ── Delete draft ───────────────────────────────────────────────────────────
  const handleDelete = async (draftId) => {
    if (!window.confirm('Delete this draft permanently?')) return;
    try {
      await deleteDraft(user.uid, draftId);
      showToast('Draft deleted');
    } catch {
      showToast('⚠ Delete failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', width: '520px', maxWidth: '92vw', maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <h3 style={{ marginBottom: '18px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} /> Draft Manager
        </h3>

        {/* Save new draft */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveDraft()}
            placeholder={`Name this draft (default: "${title || 'Untitled'}")`}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', fontSize: '0.85rem' }}
            autoFocus
          />
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ padding: '8px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.82rem', color: '#166534', marginBottom: '12px' }}>
            {toast}
          </div>
        )}

        {/* Draft list */}
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {drafts.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '32px 0', fontSize: '0.85rem' }}>
              No saved drafts yet. Save your first draft above.
            </div>
          ) : (
            drafts.map(draft => (
              <div key={draft.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{draft.title || 'Untitled'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '3px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ textTransform: 'capitalize' }}>{draft.mode}</span>
                    <span>•</span>
                    <span>{draft.blocks?.length ?? 0} blocks</span>
                    <span>•</span>
                    <span>{draft.updatedAt?.toDate ? draft.updatedAt.toDate().toLocaleString() : 'Just now'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleRestore(draft)}
                    style={{ padding: '5px 12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FolderOpen size={13} /> Open
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    style={{ padding: '5px 8px', color: '#dc2626', background: 'transparent', borderRadius: '5px', border: '1px solid transparent' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #eee' }}>
          <button onClick={() => setIsOpen(false)} style={{ padding: '7px 18px', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#333', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
