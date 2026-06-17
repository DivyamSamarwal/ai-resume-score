'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <Sparkles size={18} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="header-title" style={{ marginBottom: 0 }}>Base100</div>
          <div style={{ height: '24px', width: '2px', backgroundColor: 'var(--text-tertiary)', opacity: 0.3 }} />
          <a 
            href="https://github.com/DivyamSamarwal/ai-resume-score" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Source Code
          </a>
        </div>
      </div>
      <div className="header-badge">
        <Shield size={12} />
        Privacy-First
      </div>
    </header>
  );
}
