import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Bookmark, X } from 'lucide-react';
import { useDocument } from '../../context/DocumentContext';

export default function Block({ block, pendingFocusId, onFocusHandled, addBlock: addBlockProp }) {
  const { updateBlock, removeBlock, toggleBookmark, bookmarks, addBlock: addBlockCtx, customTypes } = useDocument();
  // Prefer prop version (which wires up focus), fall back to context version
  const addBlock = addBlockProp ?? addBlockCtx;
  const contentRef = useRef(null);
  const isBookmarked = bookmarks.has(block.id);

  // ── On first mount: seed the DOM with whatever html is in state ──────────
  // This is intentionally empty-deps so it only runs once. Subsequent state
  // changes are NOT synced back into a focused element (that would reset the
  // caret), but ARE synced when the element is blurred (e.g. undo/redo).
  useLayoutEffect(() => {
    if (contentRef.current && block.html) {
      contentRef.current.innerHTML = block.html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← run ONLY on mount

  // ── Sync from state when something external changes block.html ───────────
  //    (undo/redo, mode switch, import, etc.) but NEVER while focused.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // If this element has focus, the user is actively typing — don't touch innerHTML
    if (document.activeElement === el) return;
    // Only write if the DOM is actually stale (avoids needless reflows)
    if (el.innerHTML !== block.html) {
      el.innerHTML = block.html;
    }
  }, [block.html]);

  // ── Focus management: parent Editor tells us when to focus this block ────
  useEffect(() => {
    if (pendingFocusId === block.id && contentRef.current) {
      requestAnimationFrame(() => {
        const el = contentRef.current;
        if (!el) return;
        el.focus();
        // Place caret at very start of the new block
        try {
          const sel = window.getSelection();
          const range = document.createRange();
          // If the element has children, set before first child; else set at 0
          if (el.childNodes.length > 0) {
            range.setStart(el.childNodes[0], 0);
          } else {
            range.setStart(el, 0);
          }
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (_) { /* ignore range errors on edge cases */ }
        onFocusHandled?.();
      });
    }
  }, [pendingFocusId, block.id, onFocusHandled]);

  // ── Input: read from DOM → push to state. Never the other way while focused.
  const handleInput = () => {
    if (!contentRef.current) return;
    updateBlock(block.id, contentRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount || !contentRef.current) return;

      const range = sel.getRangeAt(0);

      // ── Capture "before cursor" HTML ──
      const preRange = document.createRange();
      preRange.selectNodeContents(contentRef.current);
      preRange.setEnd(range.startContainer, range.startOffset);
      const preDiv = document.createElement('div');
      preDiv.appendChild(preRange.cloneContents());
      let htmlPre = preDiv.innerHTML;
      if (htmlPre === '<br>') htmlPre = '';

      // ── Capture "after cursor" HTML ──
      const postRange = document.createRange();
      postRange.selectNodeContents(contentRef.current);
      postRange.setStart(range.endContainer, range.endOffset);
      const postDiv = document.createElement('div');
      postDiv.appendChild(postRange.cloneContents());
      let htmlPost = postDiv.innerHTML;
      if (htmlPost === '<br>') htmlPost = '';

      // ── Update current block DOM directly (no React re-render on this el) ──
      contentRef.current.innerHTML = htmlPre;
      updateBlock(block.id, htmlPre);

      // ── Determine next block type ──
      let nextType = block.type;
      if (block.type === 'character')     nextType = 'dialogue';
      else if (block.type === 'scene-heading') nextType = 'action';
      else if (block.type === 'chapter')  nextType = 'paragraph';
      else if (block.type === 'patra')    nextType = 'samvaad';
      else if (block.type === 'anka')     nextType = 'drishya';
      else if (block.type === 'transition') nextType = 'action';
      else if (block.type === 'parenthetical') nextType = 'dialogue';

      // ── Add new block after the current one; Editor will focus it ──
      addBlock(nextType, block.id, htmlPost);

    } else if (e.key === 'Backspace') {
      if (!contentRef.current) return;
      const text = contentRef.current.textContent;
      const innerHtml = contentRef.current.innerHTML.replace(/<br\s*\/?>/gi, '').trim();
      if (text.trim() === '' && innerHtml === '') {
        e.preventDefault();

        const allBlockEls = Array.from(document.querySelectorAll('.block-element'));
        const myIdx = allBlockEls.findIndex(el => el.id === block.id);
        const prevBlockEl = myIdx > 0 ? allBlockEls[myIdx - 1] : null;

        removeBlock(block.id);

        if (prevBlockEl) {
          requestAnimationFrame(() => {
            const el = prevBlockEl.querySelector('[contenteditable="true"]');
            if (!el) return;
            el.focus();
            try {
              const sel = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(false); // end of previous block
              sel.removeAllRanges();
              sel.addRange(range);
            } catch (_) { /* ignore */ }
          });
        }
      }
    }
  };

  const custom = customTypes.find(c => c.id === block.type);
  const className = `block-content ${block.type}`;

  const placeholders = {
    'scene-heading': 'INT./EXT. LOCATION — DAY/NIGHT',
    'action': 'Describe what we see and hear...',
    'character': 'CHARACTER NAME',
    'dialogue': 'What the character says...',
    'parenthetical': '(acting direction)',
    'transition': 'CUT TO:',
    'song-cue': '🎵 SONG: TITLE',
    'anka': 'ACT (अंक)',
    'drishya': 'SCENE — Place & Time (दृश्य)',
    'nirdesh': '(Stage direction / मंच निर्देश)',
    'patra': 'CHARACTER (पात्र)',
    'swagat': '(Aside / स्वगत)',
    'samvaad': 'Dialogue / संवाद...',
    'geet': 'Song lyrics / गीत...',
    'viraam': '— Pause / विराम —',
    'parda': 'CURTAIN / पर्दा',
    'chapter': 'Chapter Title',
    'paragraph': 'Start writing...',
    'section-break': '— ✦ —',
  };

  const placeholder = placeholders[block.type] || 'Type here...';

  return (
    <div className="block-element" id={block.id} style={{ position: 'relative' }}>
      <style>{`
        #${block.id}:hover .block-bookmark-btn,
        #${block.id}:focus-within .block-bookmark-btn { opacity: 1; }
        #${block.id}:hover .block-delete-btn,
        #${block.id}:focus-within .block-delete-btn { opacity: 1; }
        ${isBookmarked ? `#${block.id} { border-left: 2px solid #e8a838; padding-left: 10px; margin-left: -12px; }` : ''}
      `}</style>

      <span className="block-label">{custom ? custom.name : block.type.replace(/-/g, ' ')}</span>

      <button
        onClick={() => toggleBookmark(block.id)}
        style={{
          position: 'absolute', right: -30, top: 2, padding: 4, background: 'none',
          color: isBookmarked ? '#e8a838' : '#ccc', opacity: isBookmarked ? 1 : 0, transition: '0.2s', cursor: 'pointer'
        }}
        className="block-bookmark-btn"
        title="Bookmark"
      >
        <Bookmark size={14} fill={isBookmarked ? '#e8a838' : 'none'} />
      </button>

      <button
        onClick={() => removeBlock(block.id)}
        style={{
          position: 'absolute', right: -30, bottom: 2, padding: 4,
          background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: '50%',
          color: '#d32f2f', opacity: 0, transition: '0.2s', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        className="block-delete-btn"
        title="Delete block"
      >
        <X size={10} />
      </button>

      {/* NOTE: No dangerouslySetInnerHTML — content is seeded via useLayoutEffect on mount */}
      <div
        ref={contentRef}
        className={className}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
