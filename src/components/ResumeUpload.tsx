'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, AlertTriangle } from 'lucide-react';
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/utils';

interface ResumeUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onNext: () => void;
  onBack: () => void;
  onToast: (message: string, type: 'error' | 'warning' | 'info') => void;
}

export default function ResumeUpload({
  file,
  onFileSelect,
  onFileRemove,
  onNext,
  onBack,
  onToast,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateAndSetFile = useCallback(
    (f: File) => {
      if (f.type !== 'application/pdf') {
        onToast('Only PDF files are accepted. Please upload a .pdf resume.', 'error');
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        onToast(
          `File size (${formatFileSize(f.size)}) exceeds the 4MB limit. Please compress your PDF and try again.`,
          'error'
        );
        return;
      }
      if (f.size === 0) {
        onToast('The uploaded file appears to be empty.', 'error');
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect, onToast]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSetFile(files[0]);
      }
    },
    [validateAndSetFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSetFile(files[0]);
      }
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [validateAndSetFile]
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 className="section-title">Upload Resume</h2>
      <p className="section-description">
        Drop your PDF resume below. Maximum file size: 4MB.
      </p>

      {!file ? (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <label
            htmlFor="file-upload"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              padding: '32px 24px',
              fontSize: '20px',
              border: '4px solid #000',
              background: 'var(--primary-color)',
              color: '#000',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '6px 6px 0 0 #000',
            }}
          >
            <Upload size={32} style={{ margin: '0 auto' }} />
            <span>Select PDF Resume</span>
            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              Max 4MB
            </span>
          </label>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="card" style={{ marginTop: 'var(--space-xl)', border: '4px solid #000', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', height: '48px', 
              background: '#000', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px'
            }}>
              <FileText size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {formatFileSize(file.size)}
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={onFileRemove}
              aria-label="Remove uploaded file"
              style={{ padding: '8px 12px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Size warning for files near the limit */}
      {file && file.size > 3 * 1024 * 1024 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            marginTop: 'var(--space-md)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--warning-dim)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: 'var(--warning)',
          }}
        >
          <AlertTriangle size={14} />
          Large file — processing may be slower on the free tier.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!file}>
          Start Evaluation →
        </button>
      </div>
    </div>
  );
}
