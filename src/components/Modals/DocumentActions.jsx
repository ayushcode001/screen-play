import React, { useState, useRef, useEffect } from 'react';
import { useDocument } from '../../context/DocumentContext';
import { ChevronDown, Trash2, Upload, Download, FileText } from 'lucide-react';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, convertInchesToTwip,
} from 'docx';


// ─── HTML → plain text ────────────────────────────────────────────────────
function stripHtml(html = '') {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ─── Build docx Paragraph(s) from a block ────────────────────────────────
function blockToParagraphs(block) {
  const text = stripHtml(block.html);

  const baseRun = (t, opts = {}) =>
    new TextRun({ text: t, font: 'Courier New', size: 24, ...opts });

  const para = (text, opts = {}, runOpts = {}) =>
    new Paragraph({
      children: [baseRun(text, runOpts)],
      spacing: { before: 120, after: 120 },
      ...opts,
    });

  switch (block.type) {
    // ── Screenplay ──────────────────────────────────────────────────────
    case 'scene-heading':
      return [para(text.toUpperCase(), {
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 120 },
        border: { bottom: { color: 'CCCCCC', size: 6, space: 4, style: 'single' } },
      }, { bold: true })];

    case 'action':
      return [para(text, { spacing: { before: 120, after: 120 } })];

    case 'character':
      return [para(text.toUpperCase(), {
        indent: { left: convertInchesToTwip(2.5) },
        spacing: { before: 240, after: 0 },
      }, { bold: true })];

    case 'dialogue':
      return [para(text, {
        indent: { left: convertInchesToTwip(1.5), right: convertInchesToTwip(1.5) },
        spacing: { before: 0, after: 120 },
      })];

    case 'parenthetical':
      return [para(`(${text.replace(/^\(|\)$/g, '')})`, {
        indent: { left: convertInchesToTwip(2) },
        spacing: { before: 0, after: 0 },
      }, { italics: true })];

    case 'transition':
      return [para(text.toUpperCase(), {
        alignment: AlignmentType.RIGHT,
        spacing: { before: 240, after: 240 },
      }, { bold: true })];

    case 'song-cue':
      return [para(`♪ ${text} ♪`, {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
      }, { italics: true })];

    // ── Natak ───────────────────────────────────────────────────────────
    case 'anka':
      return [para(text, {
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 240 },
      }, { bold: true, size: 28 })];

    case 'drishya':
      return [para(text, {
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 360, after: 120 },
      }, { bold: true })];

    case 'nirdesh':
      return [para(`(${text})`, {
        indent: { left: convertInchesToTwip(0.5) },
        spacing: { before: 60, after: 60 },
        border: { left: { color: 'CCCCCC', size: 12, space: 6, style: 'single' } },
      }, { italics: true, color: '555555' })];

    case 'patra':
      return [para(text.toUpperCase(), {
        indent: { left: convertInchesToTwip(2.5) },
        spacing: { before: 240, after: 0 },
      }, { bold: true })];

    case 'swagat':
      return [para(text, {
        indent: { left: convertInchesToTwip(2.5) },
        spacing: { before: 0, after: 60 },
      }, { italics: true, color: '555555' })];

    case 'samvaad':
      return [para(text, {
        indent: { left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        spacing: { before: 0, after: 120 },
      })];

    case 'geet':
      return [para(`♪ ${text} ♪`, {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
      }, { italics: true, font: 'Noto Serif Devanagari' })];

    case 'viraam':
      return [para(text || '— Pause —', {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
      }, { italics: true, color: '666666' })];

    case 'parda':
      return [para(text || 'CURTAIN', {
        alignment: AlignmentType.RIGHT,
        spacing: { before: 360, after: 120 },
        border: { top: { color: 'CCCCCC', size: 6, space: 4, style: 'single' } },
      }, { bold: true })];

    // ── Story ───────────────────────────────────────────────────────────
    case 'chapter':
      return [para(text, {
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 360 },
        border: { bottom: { color: 'CCCCCC', size: 6, space: 6, style: 'single' } },
      }, { bold: true, size: 32, font: 'Georgia' })];

    case 'paragraph':
      return [new Paragraph({
        children: [new TextRun({ text, font: 'Georgia', size: 24 })],
        indent: { firstLine: convertInchesToTwip(0.5) },
        spacing: { before: 0, after: 120, line: 360 },
      })];

    case 'section-break':
      return [para(text || '— ✦ —', {
        alignment: AlignmentType.CENTER,
        spacing: { before: 360, after: 360 },
      }, { color: '999999' })];

    // ── Fallback ────────────────────────────────────────────────────────
    default:
      return [para(text)];
  }
}

// ─── Generate .docx Blob ─────────────────────────────────────────────────
async function buildDocx({ title, subtitle, blocks, mode }) {
  const titleText = stripHtml(title);
  const subtitleText = stripHtml(subtitle);

  const titleParagraphs = [];
  if (titleText) {
    titleParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: titleText.toUpperCase(), bold: true, size: 36, font: 'Courier New' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 120 },
      })
    );
  }
  if (subtitleText) {
    titleParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: subtitleText, italics: true, size: 24, font: 'Courier New', color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 720 },
      })
    );
  }
  // separator line
  titleParagraphs.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(40), color: 'CCCCCC', size: 18 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    })
  );

  const contentParagraphs = blocks.flatMap(blockToParagraphs);

  const doc = new Document({
    creator: 'लेखन मंच',
    title: titleText || 'Untitled',
    description: `${mode} document exported from लेखन मंच`,
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
            right: convertInchesToTwip(1),
          },
        },
      },
      children: [...titleParagraphs, ...contentParagraphs],
    }],
  });

  return Packer.toBlob(doc);
}

// ─── Parse imported .docx via mammoth ────────────────────────────────────
async function parseDocx(arrayBuffer, mode) {
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // Parse the html paragraphs into blocks
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const paras = Array.from(tmp.querySelectorAll('p, h1, h2, h3, h4'));

  const defaultType = mode === 'story' ? 'paragraph'
    : mode === 'natak' ? 'samvaad'
    : 'action';

  const blocks = paras
    .map((el, i) => {
      const text = el.textContent?.trim();
      if (!text) return null;
      const tag = el.tagName.toLowerCase();
      let type = defaultType;

      // Simple heuristic mapping
      if (tag === 'h1') type = mode === 'story' ? 'chapter' : mode === 'natak' ? 'anka' : 'scene-heading';
      else if (tag === 'h2') type = mode === 'natak' ? 'drishya' : 'scene-heading';
      else if (tag === 'h3') type = mode === 'natak' ? 'drishya' : 'scene-heading';

      return {
        id: `imported_${Date.now()}_${i}`,
        type,
        html: el.innerHTML || text,
      };
    })
    .filter(Boolean);

  return blocks;
}

// ─── Plain-text download helpers ─────────────────────────────────────────
const TXT_FORMATS = {
  'scene-heading': (t) => `\n${t.toUpperCase()}\n`,
  'action':        (t) => `\n${t}\n`,
  'character':     (t) => `\n${' '.repeat(22)}${t.toUpperCase()}`,
  'dialogue':      (t) => `${' '.repeat(12)}${t}\n`,
  'parenthetical': (t) => `${' '.repeat(16)}(${t.replace(/^\(|\)$/g, '')})\n`,
  'transition':    (t) => `\n${' '.repeat(44)}${t.toUpperCase()}\n`,
  'song-cue':      (t) => `\n[SONG: ${t}]\n`,
  'anka':          (t) => `\n\n=== ${t.toUpperCase()} ===\n`,
  'drishya':       (t) => `\n--- ${t} ---\n`,
  'nirdesh':       (t) => `(${t})\n`,
  'patra':         (t) => `\n${' '.repeat(10)}${t.toUpperCase()}`,
  'swagat':        (t) => `\n${' '.repeat(10)}[aside] ${t}\n`,
  'samvaad':       (t) => `${' '.repeat(6)}${t}\n`,
  'geet':          (t) => `\n♪ ${t} ♪\n`,
  'viraam':        (t) => `\n— ${t || 'PAUSE'} —\n`,
  'parda':         (t) => `\n${' '.repeat(40)}${t || 'CURTAIN'}\n`,
  'chapter':       (t) => `\n\n${'─'.repeat(60)}\n  ${t}\n${'─'.repeat(60)}\n\n`,
  'paragraph':     (t) => `    ${t}\n\n`,
  'section-break': (t) => `\n${t || '— ✦ —'}\n\n`,
};

function generatePlainText({ title, subtitle, blocks }) {
  const out = [];
  const t = stripHtml(title);
  if (t) { out.push(t.toUpperCase()); out.push('='.repeat(Math.min(t.length, 60))); }
  const s = stripHtml(subtitle);
  if (s) out.push(s);
  out.push('');
  blocks.forEach(b => {
    const text = stripHtml(b.html);
    const fmt = TXT_FORMATS[b.type];
    out.push(fmt ? fmt(text) : text);
  });
  return out.join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────
export default function DocumentActions() {
  const {
    mode, title, subtitle, blocks, customTypes, bookmarks,
    clearScript, setBlocks, setTitle, setSubtitle, setCustomTypes, switchMode
  } = useDocument();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const menuRef = useRef(null);
  const importRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const safeName = stripHtml(title).trim().replace(/\s+/g, '_') || 'script';

  // ── Clear ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    setOpen(false);
    if (window.confirm('Clear the entire document? This cannot be undone unless you saved a draft first.')) {
      clearScript();
    }
  };

  // ── Export .docx ──────────────────────────────────────────────────────
  const handleExportDocx = async () => {
    setOpen(false);
    setBusy('Generating .docx…');
    try {
      const blob = await buildDocx({ title, subtitle, blocks, mode });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate .docx file.');
    } finally {
      setBusy('');
    }
  };

  // ── Import .docx ──────────────────────────────────────────────────────
  const handleImportClick = () => {
    setOpen(false);
    importRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      alert('Please select a .docx file.');
      return;
    }
    if (!window.confirm(`Import "${file.name}"? This will replace your current document.`)) return;
    setBusy('Importing…');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const importedBlocks = await parseDocx(arrayBuffer, mode);
      if (importedBlocks.length === 0) {
        alert('No content found in the .docx file.');
        return;
      }
      setTitle('');
      setSubtitle('');
      setBlocks(importedBlocks);
    } catch (err) {
      console.error(err);
      alert('Could not import file. Make sure it is a valid .docx file.');
    } finally {
      setBusy('');
      e.target.value = '';
    }
  };

  // ── Download .txt ─────────────────────────────────────────────────────
  const handleDownloadTxt = () => {
    setOpen(false);
    const text = generatePlainText({ title, subtitle, blocks });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download PDF (print) ──────────────────────────────────────────────
  const handleDownloadPdf = () => {
    setOpen(false);
    const win = window.open('', '_blank');
    if (!win) return;

    const formattedBlocks = blocks.map(block => `
      <div class="block-element">
        <div class="block-content ${block.type}">${block.html || ''}</div>
      </div>
    `).join('');

    win.document.write(`
      <html>
        <head>
          <title>${stripHtml(title) || 'Script'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Vesper+Libre:wght@400;700;900&family=Yatra+One&display=swap');

            :root {
              --font-screenplay: 'Courier Prime', Courier, monospace;
              --font-natak: 'Noto Serif Devanagari', 'Vesper Libre', serif;
              --font-story: 'Crimson Pro', serif;
            }

            @page {
              size: letter;
              margin: 0mm;
            }

            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #111111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            /* Apply mode-specific fonts to body */
            body.mode-screenplay { font-family: var(--font-screenplay); font-size: 12pt; line-height: 1.25; }
            body.mode-natak { font-family: var(--font-natak); font-size: 12pt; line-height: 1.5; }
            body.mode-story { font-family: var(--font-story); font-size: 12pt; line-height: 1.6; }

            /* Title Block matching Editor.jsx styling */
            .title-block {
              padding: 0.25in 80px 24px 96px;
              text-align: center;
              border-bottom: 1px solid #eaeaea;
              margin-bottom: 32px;
            }
            
            .title-block h1 {
              font-size: 1.8rem;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 8px;
              letter-spacing: 2px;
              margin-top: 0;
            }

            .title-block p {
              font-size: 0.9rem;
              color: #666;
              font-style: italic;
              margin-bottom: 0;
              margin-top: 0;
            }

            /* Block spacing and formatting */
            .block-element {
              padding: 0 80px 0 96px;
              position: relative;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }

            .block-content {
              word-break: break-word;
              white-space: pre-wrap;
            }

            /* Screenplay Formatting */
            .scene-heading { font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 2px; }
            .action { font-weight: 400; }
            .character { font-weight: 700; text-transform: uppercase; margin-left: 25%; margin-bottom: 2px; }
            .dialogue { margin-left: 15%; margin-right: 15%; }
            .parenthetical { font-style: italic; margin-left: 20%; margin-right: 20%; }
            .transition { font-weight: 700; text-transform: uppercase; text-align: right; margin-top: 12px; }
            .song-cue { font-style: italic; text-align: center; margin: 12px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 4px 0; }

            /* Natak Formatting */
            .anka { font-family: 'Yatra One', cursive; font-size: 1.2rem; text-align: center; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 8px 0; margin-bottom: 12px; }
            .drishya { font-weight: 700; font-size: 1.05rem; border-bottom: 1px dashed #eee; padding-bottom: 2px; margin-bottom: 8px; }
            .nirdesh { font-style: italic; color: #555; padding-left: 12px; border-left: 2px solid #ddd; }
            .patra { font-weight: 700; margin-left: 25%; }
            .swagat { font-style: italic; margin-left: 25%; color: #555; }
            .samvaad { margin-left: 10%; margin-right: 10%; }
            .geet { font-family: 'Tiro Devanagari Hindi', serif; font-style: italic; text-align: center; background: #fafafa; padding: 12px; border: 1px solid #eee; }
            .viraam { font-style: italic; text-align: center; color: #666; letter-spacing: 2px; }
            .parda { font-family: 'Yatra One', cursive; text-align: right; border-top: 1px solid #eee; padding-top: 8px; margin-top: 12px; }

            /* Story Formatting */
            .chapter { font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .paragraph { text-indent: 2rem; margin-bottom: 8px; line-height: 1.6; }
            .section-break { text-align: center; letter-spacing: 4px; margin: 20px 0; }
          </style>
        </head>
        <body class="mode-${mode}">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <td style="height: 0.75in; padding: 0; margin: 0; border: none;"></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 0; margin: 0; border: none; vertical-align: top;">
                  <!-- Title Block -->
                  <div class="title-block">
                    <h1>${title || 'Untitled'}</h1>
                    <p>${subtitle || 'Written by'}</p>
                  </div>
                  <!-- Content Blocks -->
                  ${formattedBlocks}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style="height: 0.75in; padding: 0; margin: 0; border: none;"></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };


  // ── UI helpers ────────────────────────────────────────────────────────
  const sep = <div style={{ height: 1, background: '#eaeaea', margin: '4px 0' }} />;

  const menuItem = (icon, label, onClick, danger = false) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '7px 12px', background: 'none',
        fontSize: '0.82rem', color: danger ? '#dc2626' : '#222',
        borderRadius: '4px', textAlign: 'left', cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? '#fff5f5' : '#f5f5f5'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Hidden file input */}
      <input
        ref={importRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => setOpen(v => !v)}
        disabled={!!busy}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '6px 10px', borderRadius: '6px',
          border: '1px solid #e0e0e0', background: '#fff',
          fontSize: '0.82rem', color: '#333', cursor: busy ? 'wait' : 'pointer',
          fontWeight: 500, opacity: busy ? 0.6 : 1,
        }}
        title="Document actions"
      >
        {busy || 'Document'} <ChevronDown size={14} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px',
          minWidth: '190px', zIndex: 200,
        }}>
          {menuItem(<Upload size={14} />, 'Import .docx', handleImportClick)}
          {menuItem(<FileText size={14} />, 'Export .docx', handleExportDocx)}
          {sep}
          {menuItem(<Download size={14} />, 'Download .txt', handleDownloadTxt)}
          {menuItem(<Download size={14} />, 'Download PDF', handleDownloadPdf)}
          {sep}
          {menuItem(<Trash2 size={14} />, 'Clear document', handleClear, true)}
        </div>
      )}
    </div>
  );
}
