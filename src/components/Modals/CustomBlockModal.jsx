import React, { useState } from 'react';
import { useDocument } from '../../context/DocumentContext';

export default function CustomBlockModal({ onClose }) {
  const { setCustomTypes } = useDocument();
  const [name, setName] = useState('');
  const [font, setFont] = useState('inherit');
  const [weight, setWeight] = useState('400');
  const [align, setAlign] = useState('left');
  const [color, setColor] = useState('#111111');
  const [margin, setMargin] = useState('0');
  const [uppercase, setUppercase] = useState(false);
  const [italic, setItalic] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const newType = {
      id: 'custom_' + Date.now(),
      name,
      styles: {
        fontFamily: font,
        fontWeight: weight,
        textAlign: align,
        color,
        marginLeft: margin + '%',
        textTransform: uppercase ? 'uppercase' : 'none',
        fontStyle: italic ? 'italic' : 'normal',
      }
    };
    setCustomTypes(prev => [...prev, newType]);
    
    // Auto-inject CSS for this block so it renders correctly
    const styleId = 'style_' + newType.id;
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .${newType.id} {
        font-family: ${newType.styles.fontFamily};
        font-weight: ${newType.styles.fontWeight};
        text-align: ${newType.styles.textAlign};
        color: ${newType.styles.color};
        margin-left: ${newType.styles.marginLeft};
        text-transform: ${newType.styles.textTransform};
        font-style: ${newType.styles.fontStyle};
      }
    `;
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Create Custom Block</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Name (e.g. Dream Sequence)</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} placeholder="Enter name..." autoFocus />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Font Family</label>
              <select value={font} onChange={e => setFont(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}>
                <option value="inherit">Inherit</option>
                <option value="var(--font-screenplay)">Typewriter</option>
                <option value="var(--font-natak)">Serif (Natak)</option>
                <option value="var(--font-story)">Serif (Story)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Weight</label>
              <select value={weight} onChange={e => setWeight(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}>
                <option value="400">Normal</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Alignment</label>
              <select value={align} onChange={e => setAlign(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '34px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
            </div>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Left Margin (%)</label>
             <input type="range" min="0" max="50" value={margin} onChange={e => setMargin(e.target.value)} style={{ width: '100%' }} />
             <div style={{ fontSize: '0.75rem', textAlign: 'center', color: '#888' }}>{margin}%</div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} />
              Uppercase
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={italic} onChange={e => setItalic(e.target.checked)} />
              Italic
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', color: '#666', borderRadius: '4px' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#222', color: '#fff', borderRadius: '4px' }}>Save Block Type</button>
        </div>
      </div>
    </div>
  );
}
