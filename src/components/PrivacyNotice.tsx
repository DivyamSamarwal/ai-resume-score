'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div className="privacy-notice">
      <ShieldCheck size={20} className="privacy-notice-icon" />
      <div className="privacy-notice-content">
        <div className="privacy-notice-title">Your keys stay private</div>
        <div className="privacy-notice-text">
          API keys are stored only in your browser&apos;s memory and are{' '}
          <strong style={{ color: 'var(--text-primary)' }}>never saved to any database</strong>.
          Keys are transmitted exclusively over HTTPS to their respective API endpoints
          and are discarded when you close this tab.
        </div>
      </div>
    </div>
  );
}
