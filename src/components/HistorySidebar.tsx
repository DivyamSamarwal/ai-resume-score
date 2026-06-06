import React from 'react';
import type { HistoryItem } from '@/lib/storage';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistorySidebar({ history, onSelect, onClear }: HistorySidebarProps) {
  if (history.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Recent Evaluations
        </h3>
        <button 
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-primary)',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px #000',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '0px 0px 0px #000';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px #000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px #000';
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {new Date(item.timestamp).toLocaleDateString()} • Score: {item.result.overallScore}
              </div>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
