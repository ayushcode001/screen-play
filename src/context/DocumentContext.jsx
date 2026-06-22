import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { saveDraft } from '../firebase/draftsService';

const DocumentContext = createContext();

// ── Offline pending localStorage key (per user) ───────────────────────────────
const offlineKey = (uid) => `filmi_offline_pending_${uid}`;

// ── Default blocks per mode (for fresh sessions) ────────────────────────────
const defaultBlocks = {
  screenplay: [
    { id: 'b1', type: 'scene-heading', html: 'INT. MUMBAI FLAT - MORNING' },
    { id: 'b2', type: 'action',        html: 'A small, cluttered flat. Rahul wakes up to a knock.' },
    { id: 'b3', type: 'character',     html: 'LANDLORD' },
    { id: 'b4', type: 'dialogue',      html: 'Rahul! Teen mahine ho gaye! Kiraya kab doge?!' },
  ],
  natak: [
    { id: 'b1', type: 'anka',    html: 'अंक — १  (ACT ONE)' },
    { id: 'b2', type: 'drishya', html: 'दृश्य १ — एक छोटा सा घर, शाम का समय' },
    { id: 'b3', type: 'nirdesh', html: '(मंच पर सावित्री बैठी कुछ सिल रही है।)' },
    { id: 'b4', type: 'patra',   html: 'MOHAN' },
    { id: 'b5', type: 'samvaad', html: 'आज बहुत देर हो गई, सावित्री। माफ़ करना।' },
  ],
  story: [
    { id: 'b1', type: 'chapter',   html: 'Chapter 1: The Beginning' },
    { id: 'b2', type: 'paragraph', html: 'It was a dark and stormy night.' },
  ],
};

export function DocumentProvider({ children, uid }) {
  const [mode,        setMode]        = useState('screenplay');
  const [title,       setTitle]       = useState('');
  const [subtitle,    setSubtitle]    = useState('');
  const [blocks,      setBlocks]      = useState([]);
  const [customTypes, setCustomTypes] = useState([]);
  const [bookmarks,   setBookmarks]   = useState(new Set());
  const [lastSaved,   setLastSaved]   = useState(null);
  const [isOffline,   setIsOffline]   = useState(!navigator.onLine);
  const [isSaving,    setIsSaving]    = useState(false);

  // Active draft id — null means "new unsaved session"
  const [activeDraftId, setActiveDraftId] = useState(null);

  // History for undo/redo (kept in-memory only, per mode)
  const [history,      setHistory]      = useState({ screenplay: [], natak: [], story: [] });
  const [historyIndex, setHistoryIndex] = useState({ screenplay: -1, natak: -1, story: -1 });

  const isRestoring = useRef(false);
  const saveTimerRef = useRef(null);

  // ── Online / Offline detection ─────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => {
      setIsOffline(false);
      // Flush any pending offline state to Firestore
      if (uid) flushOfflinePending();
    };
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [uid]);

  // ── Initial load: try offline pending, then start blank ──────────────────
  useEffect(() => {
    if (!uid) return;
    const pending = localStorage.getItem(offlineKey(uid));
    if (pending) {
      try {
        const state = JSON.parse(pending);
        setMode(state.mode || 'screenplay');
        setTitle(state.title || '');
        setSubtitle(state.subtitle || '');
        setBlocks(state.blocks || []);
        setCustomTypes(state.customTypes || []);
        setBookmarks(new Set(state.bookmarks || []));
        setActiveDraftId(state.activeDraftId || null);
      } catch { /* ignore corrupt data */ }
    }
  }, [uid]);

  // ── Save state to localStorage (offline fallback) ──────────────────────────
  const saveToLocalStorage = useCallback(() => {
    if (!uid) return;
    const state = {
      mode, title, subtitle, blocks, customTypes,
      bookmarks: Array.from(bookmarks),
      activeDraftId,
      timestamp: Date.now(),
    };
    localStorage.setItem(offlineKey(uid), JSON.stringify(state));
  }, [uid, mode, title, subtitle, blocks, customTypes, bookmarks, activeDraftId]);

  // ── Flush offline pending to Firestore ─────────────────────────────────────
  const flushOfflinePending = useCallback(async () => {
    if (!uid) return;
    const pending = localStorage.getItem(offlineKey(uid));
    if (!pending) return;
    try {
      const state = JSON.parse(pending);
      await saveDraft(uid, {
        id:          state.activeDraftId || undefined,
        title:       state.title || 'Untitled',
        mode:        state.mode || 'screenplay',
        blocks:      state.blocks || [],
        customTypes: state.customTypes || [],
        bookmarks:   state.bookmarks || [],
        subtitle:    state.subtitle || '',
      });
      localStorage.removeItem(offlineKey(uid));
    } catch (err) {
      console.error('[DocumentContext] flushOfflinePending failed:', err);
    }
  }, [uid]);

  // ── Autosave (debounced 2s) ────────────────────────────────────────────────
  const triggerAutosave = useCallback(() => {
    if (isRestoring.current) return;
    saveToLocalStorage();

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!uid) return;
      setIsSaving(true);
      try {
        const id = await saveDraft(uid, {
          id:          activeDraftId || undefined,
          title:       title || 'Untitled',
          mode,
          blocks,
          customTypes,
          bookmarks:   Array.from(bookmarks),
          subtitle,
        });
        if (!activeDraftId) setActiveDraftId(id);
        setLastSaved(new Date());
        // Clear offline pending on successful Firestore write
        localStorage.removeItem(offlineKey(uid));
      } catch (err) {
        console.error('[DocumentContext] Autosave to Firestore failed (offline?):', err);
        setIsOffline(true);
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, [uid, activeDraftId, title, mode, blocks, customTypes, bookmarks, subtitle, saveToLocalStorage]);

  useEffect(() => {
    triggerAutosave();
    return () => clearTimeout(saveTimerRef.current);
  }, [blocks, title, subtitle, customTypes, bookmarks]);

  // ── Push to history ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRestoring.current) return;
    setHistory(prev => {
      const list = prev[mode].slice(0, historyIndex[mode] + 1);
      const last = list[list.length - 1];
      if (last && JSON.stringify(last.blocks) === JSON.stringify(blocks) && last.title === title) return prev;
      const newState = { title, subtitle, blocks, bookmarks: Array.from(bookmarks) };
      const newList = [...list, newState].slice(-50);
      return { ...prev, [mode]: newList };
    });
    setHistoryIndex(prev => {
      const list = history[mode].slice(0, prev[mode] + 1);
      const last = list[list.length - 1];
      if (last && JSON.stringify(last.blocks) === JSON.stringify(blocks)) return prev;
      const newIdx = Math.min(prev[mode] + 1, 49);
      return { ...prev, [mode]: newIdx };
    });
  }, [blocks, title, subtitle]);

  // ── Mode switch ────────────────────────────────────────────────────────────
  const switchMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    // Start fresh in new mode (user can load a draft from DraftManager)
    setTitle('');
    setSubtitle('');
    setBlocks([]);
    setBookmarks(new Set());
    setActiveDraftId(null);
  };

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const undo = () => {
    const list = history[mode];
    const idx  = historyIndex[mode];
    if (idx > 0) {
      isRestoring.current = true;
      const prev = list[idx - 1];
      setTitle(prev.title);
      setSubtitle(prev.subtitle);
      setBlocks(prev.blocks);
      setBookmarks(new Set(prev.bookmarks));
      setHistoryIndex(p => ({ ...p, [mode]: idx - 1 }));
      setTimeout(() => { isRestoring.current = false; }, 50);
    }
  };

  const redo = () => {
    const list = history[mode];
    const idx  = historyIndex[mode];
    if (idx < list.length - 1) {
      isRestoring.current = true;
      const next = list[idx + 1];
      setTitle(next.title);
      setSubtitle(next.subtitle);
      setBlocks(next.blocks);
      setBookmarks(new Set(next.bookmarks));
      setHistoryIndex(p => ({ ...p, [mode]: idx + 1 }));
      setTimeout(() => { isRestoring.current = false; }, 50);
    }
  };

  // ── Block operations ───────────────────────────────────────────────────────
  const updateBlock = (id, newHtml) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, html: newHtml } : b));
  };

  const addBlock = (type, afterId = null, html = '') => {
    const newBlock = { id: `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`, type, html };
    setBlocks(prev => {
      if (!afterId) return [...prev, newBlock];
      const idx = prev.findIndex(b => b.id === afterId);
      if (idx === -1) return [...prev, newBlock];
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    return newBlock.id;
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (bookmarks.has(id)) toggleBookmark(id);
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── Clear document (also used on sign-out) ─────────────────────────────────
  const clearScript = () => {
    setTitle('');
    setSubtitle('');
    setBlocks([]);
    setBookmarks(new Set());
    setCustomTypes([]);
    setActiveDraftId(null);
    setMode('screenplay');
    setLastSaved(null);
    setHistory({ screenplay: [], natak: [], story: [] });
    setHistoryIndex({ screenplay: -1, natak: -1, story: -1 });
  };

  // ── Load a draft into the editor ───────────────────────────────────────────
  const loadDraftIntoEditor = (draft) => {
    setMode(draft.mode || 'screenplay');
    setTitle(draft.title || '');
    setSubtitle(draft.subtitle || '');
    setBlocks(draft.blocks || []);
    setCustomTypes(draft.customTypes || []);
    setBookmarks(new Set(draft.bookmarks || []));
    setActiveDraftId(draft.id || null);
  };

  // ── Explicit save (called by "Save Draft" button / DraftManager) ───────────
  const explicitSave = useCallback(async (draftName) => {
    if (!uid) return null;
    setIsSaving(true);
    try {
      const id = await saveDraft(uid, {
        id:          activeDraftId || undefined,
        title:       draftName || title || 'Untitled',
        mode,
        blocks,
        customTypes,
        bookmarks:   Array.from(bookmarks),
        subtitle,
      });
      setActiveDraftId(id);
      setLastSaved(new Date());
      localStorage.removeItem(offlineKey(uid));
      return id;
    } catch (err) {
      console.error('[DocumentContext] explicitSave failed:', err);
      saveToLocalStorage();
      setIsOffline(true);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [uid, activeDraftId, title, mode, blocks, customTypes, bookmarks, subtitle, saveToLocalStorage]);

  return (
    <DocumentContext.Provider value={{
      mode, switchMode,
      title, setTitle,
      subtitle, setSubtitle,
      blocks, setBlocks, updateBlock, addBlock, removeBlock,
      customTypes, setCustomTypes,
      bookmarks, setBookmarks, toggleBookmark,
      lastSaved, isSaving, isOffline,
      activeDraftId, setActiveDraftId,
      undo, redo,
      canUndo: historyIndex[mode] > 0,
      canRedo: historyIndex[mode] < history[mode].length - 1,
      clearScript,
      loadDraftIntoEditor,
      explicitSave,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocument = () => useContext(DocumentContext);
