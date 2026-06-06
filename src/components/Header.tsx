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
        <div>
          <div className="header-title">Base100</div>
          <div className="header-subtitle">
            Inspired by <a href="https://github.com/interviewstreet/hiring-agent" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>interviewstreet/hiring-agent</a>
          </div>
        </div>
      </div>
      <div className="header-badge">
        <Shield size={12} />
        Privacy-First
      </div>
    </header>
  );
}
