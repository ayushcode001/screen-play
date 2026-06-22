import React, { useState } from 'react';
import { useDocument } from '../context/DocumentContext';
import { Plus, Palette } from 'lucide-react';
import ColorPicker from './ColorPicker';
import CustomBlockModal from './Modals/CustomBlockModal';

export default function Toolbar() {
  const { mode, customTypes } = useDocument();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const blockButtons = {
    screenplay: [
      { type: 'scene-heading', label: '🎬 Scene' },
      { type: 'action',        label: '📝 Action' },
      { type: 'character',     label: '🎭 Character' },
      { type: 'dialogue',      label: '💬 Dialogue' },
      { type: 'parenthetical', label: '( ) Parenthetical' },
      { type: 'transition',    label: '⟶ Transition' },
      { type: 'song-cue',      label: '🎵 Song Cue' },
    ],
    natak: [
      { type: 'anka',    label: '📖 Act (Anka)' },
      { type: 'drishya', label: '🎭 Scene (Drishya)' },
      { type: 'nirdesh', label: '🎬 Stage Direction' },
      { type: 'patra',   label: '👤 Character (Patra)' },
      { type: 'swagat',  label: '💭 Aside (Swagat)' },
      { type: 'samvaad', label: '💬 Dialogue (Samvaad)' },
      { type: 'geet',    label: '🎵 Song (Geet)' },
      { type: 'viraam',  label: '⏸ Pause (Viraam)' },
      { type: 'parda',   label: '🎪 Curtain (Parda)' },
    ],
    story: [
      { type: 'chapter',       label: '📖 Chapter' },
      { type: 'paragraph',     label: '¶ Paragraph' },
      { type: 'section-break', label: '— Section Break' },
    ],
  };


  const handleAdd = (type) => {
    window.dispatchEvent(new CustomEvent('add-block', { detail: { type } }));
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px',
      backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', flexWrap: 'wrap'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginRight: '8px' }}>
        Insert
      </div>
      
      {blockButtons[mode]?.map(btn => (
        <button 
          key={btn.type}
          onClick={() => handleAdd(btn.type)}
          style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #eee', background: '#fafafa', color: '#333' }}
        >
          {btn.label}
        </button>
      ))}

      {customTypes.map(btn => (
        <button 
          key={btn.id}
          onClick={() => handleAdd(btn.id)}
          style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px dashed #ccc', background: '#fafafa', color: '#333' }}
        >
          {btn.name}
        </button>
      ))}

      <button 
        onClick={() => setShowCustomModal(true)}
        style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', border: '1px dashed #ccc', background: 'transparent', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <Plus size={14} /> Custom
      </button>

      <div style={{ width: 1, height: 16, background: '#eaeaea', margin: '0 8px' }} />

      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #eee', background: '#fafafa', color: '#333', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Palette size={14} /> Color
        </button>
        {showColorPicker && <ColorPicker onClose={() => setShowColorPicker(false)} />}
      </div>

      {showCustomModal && <CustomBlockModal onClose={() => setShowCustomModal(false)} />}
    </div>
  );
}
