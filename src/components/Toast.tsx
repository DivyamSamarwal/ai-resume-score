'use client';

import React, { useEffect, useState } from 'react';
import type { ToastNotification, ToastType } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />,
  error: <XCircle size={20} style={{ color: 'var(--danger)' }} />,
  warning: <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />,
  info: <Info size={20} style={{ color: 'var(--accent-blue)' }} />,
};

function SingleToast({ toast, onDismiss }: { toast: ToastNotification; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let exitTimer: NodeJS.Timeout;
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setExiting(true);
      exitTimer = setTimeout(() => onDismiss(toast.id), 200);
    }, duration);
    return () => {
      clearTimeout(timer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className={`toast toast-${toast.type} ${exiting ? 'toast-exit' : ''}`}>
      <div className="toast-icon">{iconMap[toast.type]}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert" aria-live="assertive">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
