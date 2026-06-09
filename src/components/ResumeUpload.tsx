'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, X, AlertTriangle, Type } from 'lucide-react';
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/utils';

interface ResumeUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  rawText: string | null;
  onTextSelect: (text: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  onToast: (message: string, type: 'error' | 'warning' | 'info') => void;
}

export default function ResumeUpload({
  file,
  onFileSelect,
  onFileRemove,
  rawText,
  onTextSelect,
  onNext,
  onBack,
  onToast,
}: ResumeUploadProps) {
  const [mode, setMode] = useState<'file' | 'text'>(rawText ? 'text' : 'file');
  const [localText, setLocalText] = useState(rawText || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    setLocalText(rawText || '');
  }, [rawText]);

  const validateAndSetFile = useCallback(
    (f: File) => {
      const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      const isDOCX = f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || f.name.toLowerCase().endsWith('.docx');
      const isImage = f.type.startsWith('image/');
      
      if (!isPDF && !isDOCX && !isImage) {
        onToast('Only PDF, DOCX, and Image files are accepted.', 'error');
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        onToast(`File size (${formatFileSize(f.size)}) exceeds the 2MB limit.`, 'error');
        return;
      }
      if (f.size === 0) {
        onToast('The uploaded file appears to be empty.', 'error');
        return;
      }
      onTextSelect(null); // Clear text if they select a file
      onFileSelect(f);
    },
    [onFileSelect, onTextSelect, onToast]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (mode !== 'file') return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, [mode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (mode !== 'file') return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, [mode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (mode !== 'file') return;
    e.preventDefault();
    e.stopPropagation();
  }, [mode]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (mode !== 'file') return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSetFile(files[0]);
      }
    },
    [mode, validateAndSetFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSetFile(files[0]);
      }
      e.target.value = '';
    },
    [validateAndSetFile]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    onFileRemove(); // Clear file if they start typing text
    onTextSelect(e.target.value);
  };

  const wordCount = localText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isTextValid = wordCount >= 100 && wordCount <= 3000;

  return (
    <div 
      style={{ animation: 'fadeIn 0.4s ease-out' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Upload Resume</h2>
          <p className="section-description" style={{ margin: 0 }}>
            {mode === 'file' ? 'Drop your PDF, DOCX, or Image resume below.' : 'Paste your raw text or LinkedIn profile.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#000', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setMode('file')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: mode === 'file' ? 'var(--primary-color)' : 'transparent',
              color: mode === 'file' ? '#000' : '#fff',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Upload size={16} /> File
          </button>
          <button
            onClick={() => setMode('text')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: mode === 'text' ? 'var(--primary-color)' : 'transparent',
              color: mode === 'text' ? '#000' : '#fff',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Type size={16} /> Text
          </button>
        </div>
      </div>

      {mode === 'file' && (
        <>
          {!file ? (
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <label
                htmlFor="file-upload"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  padding: '32px 24px',
                  fontSize: '20px',
                  border: '4px solid #000',
                  background: isDragging ? '#eab308' : 'var(--primary-color)',
                  color: '#000',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '6px 6px 0 0 #000',
                  transform: isDragging ? 'scale(1.02)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Upload size={32} style={{ margin: '0 auto' }} />
                <span>Select PDF, DOCX, or Image Resume</span>
                <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                  Max 2MB
                </span>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className="card" style={{ marginTop: 'var(--space-lg)', border: '4px solid #000', padding: '24px' }}>
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

          {file && file.size > 1.5 * 1024 * 1024 && (
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
        </>
      )}

      {mode === 'text' && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <textarea
            value={localText}
            onChange={handleTextChange}
            placeholder="Paste your raw resume text or LinkedIn profile here..."
            style={{
              width: '100%',
              height: '300px',
              padding: '16px',
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
              border: '4px solid #000',
              borderRadius: '4px',
              resize: 'vertical',
              boxShadow: 'inset 4px 4px 0 0 rgba(0,0,0,0.05)',
              background: '#fff'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '14px',
            fontFamily: 'var(--font-mono)',
            color: isTextValid ? 'var(--success)' : 'var(--text-secondary)'
          }}>
            <span>Words: {wordCount}</span>
            {wordCount < 100 && <span>Min 100 words required</span>}
            {wordCount > 3000 && <span style={{ color: 'var(--danger)' }}>Max 3000 words allowed</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onNext} 
          disabled={mode === 'file' ? !file : !isTextValid}
        >
          Start Evaluation →
        </button>
      </div>
    </div>
  );
}
