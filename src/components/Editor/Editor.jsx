import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useDocument } from '../../context/DocumentContext';
import Block from './Block';

function PageGap({ pageNum }) {
  return (
    <div style={{
      height: '60px', backgroundColor: 'var(--bg-app)',
      width: '100%',
      boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.02), inset 0 -4px 6px rgba(0,0,0,0.02)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '32px', marginTop: '32px',
      position: 'relative', userSelect: 'none'
    }}>
      <div style={{ fontSize: '0.7rem', color: '#aaa', fontFamily: 'var(--font-mono)' }}>Page {pageNum}</div>
    </div>
  );
}

export default function Editor() {
  const { title, setTitle, subtitle, setSubtitle, blocks, mode, addBlock } = useDocument();
  const blockHeights = useRef({});
  const [pageBreaks, setPageBreaks] = useState([]);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useLayoutEffect(() => {
    if (titleRef.current && document.activeElement !== titleRef.current && titleRef.current.innerHTML !== title) {
      titleRef.current.innerHTML = title || '';
    }
  }, [title]);

  useLayoutEffect(() => {
    if (subtitleRef.current && document.activeElement !== subtitleRef.current && subtitleRef.current.innerHTML !== subtitle) {
      subtitleRef.current.innerHTML = subtitle || '';
    }
  }, [subtitle]);

  // ── Track which newly-added block should receive focus ──
  const [pendingFocusId, setPendingFocusId] = useState(null);

  // Wrapped addBlock that records the new id for focus
  const addBlockAndFocus = useCallback((type, afterId, html = '') => {
    const newId = addBlock(type, afterId, html);
    setPendingFocusId(newId);
    return newId;
  }, [addBlock]);

  // Toolbar "add block" event
  useEffect(() => {
    const handleAdd = (e) => {
      const sel = window.getSelection();
      let afterId = null;
      if (sel && sel.rangeCount > 0) {
        const node = sel.getRangeAt(0).startContainer;
        const blockEl = node.nodeType === Node.TEXT_NODE
          ? node.parentElement?.closest('.block-element')
          : node.closest?.('.block-element');
        if (blockEl) afterId = blockEl.id;
      }
      addBlockAndFocus(e.detail.type, afterId);
    };
    window.addEventListener('add-block', handleAdd);
    return () => window.removeEventListener('add-block', handleAdd);
  }, [addBlockAndFocus]);

  // ── Pagination measurement ──
  useLayoutEffect(() => {
    let heightsChanged = false;
    const elements = document.querySelectorAll('.block-element');
    elements.forEach(el => {
      const h = el.offsetHeight;
      if (blockHeights.current[el.id] !== h) {
        blockHeights.current[el.id] = h;
        heightsChanged = true;
      }
    });

    const titleEl = document.getElementById('title-block');
    const titleHeight = titleEl ? titleEl.offsetHeight : 150;

    if (heightsChanged || blocks.length !== Object.keys(blockHeights.current).length) {
      const PAGE_HEIGHT = 1056 - 144;
      let currentHeight = titleHeight;
      const newBreaks = [];

      blocks.forEach((block, index) => {
        const h = blockHeights.current[block.id] || 40;
        if (currentHeight + h > PAGE_HEIGHT) {
          newBreaks.push(index);
          currentHeight = h;
        } else {
          currentHeight += h;
        }
      });

      if (JSON.stringify(newBreaks) !== JSON.stringify(pageBreaks)) {
        setPageBreaks(newBreaks);
      }
    }
  });

  return (
    <div
      style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-app)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      className={`mode-${mode}`}
    >
      <div
        ref={containerRef}
        className="script-page"
        style={{
          width: '816px', maxWidth: '100%', backgroundColor: '#fff',
          boxShadow: 'var(--paper-shadow)', position: 'relative',
          minHeight: '1056px', paddingBottom: '72px'
        }}
      >
        {/* Decorative binding */}
        {mode === 'screenplay' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#111' }} />}
        {mode === 'natak' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#c62828' }} />}
        {mode === 'story' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#e0e0e0' }} />}

        {/* Title / Subtitle */}
        <div id="title-block" style={{ padding: '72px 80px 24px 96px', textAlign: 'center', borderBottom: '1px solid #eaeaea', marginBottom: '32px' }}>
          <h1
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setTitle(e.target.innerHTML)}
            style={{ fontSize: '1.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px', outline: 'none' }}
            placeholder={mode === 'story' ? 'STORY TITLE' : mode === 'natak' ? 'NATAK TITLE' : 'SCRIPT TITLE'}
          />
          <p
            ref={subtitleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setSubtitle(e.target.innerHTML)}
            style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', outline: 'none' }}
            placeholder="Written by"
          />
        </div>

        {/* Blocks with page gap markers */}
        {blocks.map((block, index) => {
          const isPageBreak = pageBreaks.includes(index);
          return (
            <React.Fragment key={block.id}>
              {isPageBreak && <PageGap pageNum={pageBreaks.indexOf(index) + 2} />}
              <div style={{ padding: '0 80px 0 96px' }}>
                <Block
                  block={block}
                  pendingFocusId={pendingFocusId}
                  onFocusHandled={() => setPendingFocusId(null)}
                  addBlock={addBlockAndFocus}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
