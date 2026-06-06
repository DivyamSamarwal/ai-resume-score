'use client';

import React, { useEffect, useRef } from 'react';
import type { TerminalLog } from '@/types';
import { CheckCircle2, XCircle, Circle, Loader2 } from 'lucide-react';

interface TerminalLoggerProps {
  logs: TerminalLog[];
  onBack?: () => void;
}

function StatusIcon({ status }: { status: TerminalLog['status'] }) {
  switch (status) {
    case 'pending':
      return <Circle size={16} className="terminal-status-icon terminal-status-pending" />;
    case 'running':
      return <Loader2 size={16} className="terminal-status-icon terminal-status-running" style={{ animation: 'spin 1s linear infinite' }} />;
    case 'success':
      return <CheckCircle2 size={16} className="terminal-status-icon terminal-status-success" />;
    case 'error':
      return <XCircle size={16} className="terminal-status-icon terminal-status-error" />;
  }
}

export default function TerminalLogger({ logs, onBack }: TerminalLoggerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const isComplete = logs.length > 0 && logs.every((l) => l.status === 'success' || l.status === 'error');
  const hasError = logs.some((l) => l.status === 'error');

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 className="section-title">Evaluating Resume</h2>
      <p className="section-description">
        Running your resume through our calibrated 100-point rubric...
      </p>

      <div className="terminal">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
          <div className="terminal-title">evaluation-pipeline</div>
        </div>
        <div className="terminal-body" ref={bodyRef}>
          {logs.map((log) => (
            <div key={log.id}>
              <div className="terminal-line">
                <StatusIcon status={log.status} />
                <span
                  className={`terminal-message ${
                    log.status === 'running' ? 'terminal-message-running' : ''
                  } ${log.status === 'success' ? 'terminal-message-success' : ''}`}
                >
                  {log.message}
                </span>
              </div>
              {log.detail && log.status === 'success' && (
                <div className="terminal-detail">↳ {log.detail}</div>
              )}
              {log.detail && log.status === 'error' && (
                <div className="terminal-detail" style={{ color: 'var(--danger)' }}>
                  ✗ {log.detail}
                </div>
              )}
            </div>
          ))}
          {!isComplete && (
            <div className="terminal-line">
              <span className="terminal-cursor" />
            </div>
          )}
        </div>
      </div>

      {hasError && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-lg)' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Configuration
          </button>
        </div>
      )}
    </div>
  );
}
