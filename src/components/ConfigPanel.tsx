'use client';

import React, { useState, useCallback } from 'react';
import type { ApiConfig } from '@/types';
import { validateApiKey } from '@/lib/utils';
import { Eye, EyeOff, GitBranch, Key, Sparkles, CheckCircle2, User } from 'lucide-react';
import PrivacyNotice from './PrivacyNotice';

interface ConfigPanelProps {
  config: ApiConfig;
  onConfigChange: (config: ApiConfig) => void;
  onNext: () => void;
  onMockMode: () => void;
}

export default function ConfigPanel({ config, onConfigChange, onNext, onMockMode }: ConfigPanelProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShow = useCallback((field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const updateField = useCallback(
    (field: keyof ApiConfig, value: string) => {
      onConfigChange({ ...config, [field]: value });
    },
    [config, onConfigChange]
  );


  const isKeyValid = 
    config.selectedModel === 'gemini' ? validateApiKey(config.geminiKey, 'gemini') :
    config.selectedModel === 'deepseek' ? validateApiKey(config.deepseekKey, 'deepseek') :
    config.selectedModel === 'groq' ? validateApiKey(config.groqKey, 'groq') :
    validateApiKey(config.openrouterKey, 'openrouter');
    
  const isGithubValid = !config.githubToken || validateApiKey(config.githubToken, 'github');
  const canProceed = isKeyValid;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }} suppressHydrationWarning>
      <h2 className="section-title">Configuration</h2>
      <p className="section-description">
        Enter your API credentials to get started. Your keys are used only for this session.
      </p>

      {/* Mock Demo Button */}
      <button
        className="btn btn-mock btn-lg"
        onClick={onMockMode}
        style={{ width: '100%', marginBottom: 'var(--space-lg)' }}
      >
        <Sparkles size={18} />
        Toggle Mock Demo Mode — Preview Dashboard Instantly
      </button>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Model Selector */}
        <div className="input-group">
          <label className="input-label">AI Model</label>
          <div className="model-toggle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRight: 'none', borderBottom: 'none' }}>
            <button
              className={`model-toggle-option ${config.selectedModel === 'gemini' ? 'active' : ''}`}
              style={{ borderBottom: '3px solid #000' }}
              onClick={() => updateField('selectedModel', 'gemini')}
            >
              Gemini
            </button>
            <button
              className={`model-toggle-option ${config.selectedModel === 'deepseek' ? 'active' : ''}`}
              style={{ borderBottom: '3px solid #000' }}
              onClick={() => updateField('selectedModel', 'deepseek')}
            >
              DeepSeek
            </button>
            <button
              className={`model-toggle-option ${config.selectedModel === 'groq' ? 'active' : ''}`}
              onClick={() => updateField('selectedModel', 'groq')}
            >
              Groq LLaMA-3
            </button>
            <button
              className={`model-toggle-option ${config.selectedModel === 'openrouter' ? 'active' : ''}`}
              onClick={() => updateField('selectedModel', 'openrouter')}
            >
              OpenRouter
            </button>
          </div>
        </div>

        {/* Gemini Key */}
        {config.selectedModel === 'gemini' && (
          <div className="input-group">
            <label className="input-label">
              <Key size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Gemini API Key
            </label>
            <div className="input-wrapper">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                className={`input-field ${validateApiKey(config.geminiKey, 'gemini') ? 'input-field-valid' : ''}`}
                placeholder="AIzaSy..."
                value={config.geminiKey}
                onChange={(e) => updateField('geminiKey', e.target.value)}
                autoComplete="off"
              />
              <button
                className="input-icon"
                onClick={() => toggleShow('gemini')}
                aria-label="Toggle key visibility"
                type="button"
                style={{ background: 'none', border: 'none' }}
              >
                {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validateApiKey(config.geminiKey, 'gemini') && (
              <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> Key format looks valid
              </span>
            )}
          </div>
        )}

        {/* DeepSeek Key */}
        {config.selectedModel === 'deepseek' && (
          <div className="input-group">
            <label className="input-label">
              <Key size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              DeepSeek API Key
            </label>
            <div className="input-wrapper">
              <input
                type={showKeys.deepseek ? 'text' : 'password'}
                className={`input-field ${validateApiKey(config.deepseekKey, 'deepseek') ? 'input-field-valid' : ''}`}
                placeholder="sk-..."
                value={config.deepseekKey}
                onChange={(e) => updateField('deepseekKey', e.target.value)}
                autoComplete="off"
              />
              <button
                className="input-icon"
                onClick={() => toggleShow('deepseek')}
                aria-label="Toggle key visibility"
                type="button"
                style={{ background: 'none', border: 'none' }}
              >
                {showKeys.deepseek ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validateApiKey(config.deepseekKey, 'deepseek') && (
              <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> Key format looks valid
              </span>
            )}
          </div>
        )}

        {/* Groq Key */}
        {config.selectedModel === 'groq' && (
          <div className="input-group">
            <label className="input-label">
              <Key size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Groq API Key
            </label>
            <div className="input-wrapper">
              <input
                type={showKeys.groq ? 'text' : 'password'}
                className={`input-field ${validateApiKey(config.groqKey, 'groq') ? 'input-field-valid' : ''}`}
                placeholder="gsk_..."
                value={config.groqKey}
                onChange={(e) => updateField('groqKey', e.target.value)}
                autoComplete="off"
              />
              <button
                className="input-icon"
                onClick={() => toggleShow('groq')}
                aria-label="Toggle key visibility"
                type="button"
                style={{ background: 'none', border: 'none' }}
              >
                {showKeys.groq ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* OpenRouter Key */}
        {config.selectedModel === 'openrouter' && (
          <div className="input-group">
            <label className="input-label">
              <Key size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              OpenRouter API Key
            </label>
            <div className="input-wrapper">
              <input
                type={showKeys.openrouter ? 'text' : 'password'}
                className={`input-field ${validateApiKey(config.openrouterKey, 'openrouter') ? 'input-field-valid' : ''}`}
                placeholder="sk-or-v1-..."
                value={config.openrouterKey}
                onChange={(e) => updateField('openrouterKey', e.target.value)}
                autoComplete="off"
              />
              <button
                className="input-icon"
                onClick={() => toggleShow('openrouter')}
                aria-label="Toggle key visibility"
                type="button"
                style={{ background: 'none', border: 'none' }}
              >
                {showKeys.openrouter ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* GitHub Username */}
        <div className="input-group">
          <label className="input-label">
            <User size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            GitHub Username <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — auto-detected from resume)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="octocat"
            value={config.githubUsername}
            onChange={(e) => updateField('githubUsername', e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* GitHub Token (Optional) */}
        <div className="input-group">
          <label className="input-label">
            <GitBranch size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            GitHub Personal Access Token{' '}
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — increases rate limit)</span>
          </label>
          <div className="input-wrapper">
            <input
              type={showKeys.github ? 'text' : 'password'}
              className={`input-field ${config.githubToken && validateApiKey(config.githubToken, 'github') ? 'input-field-valid' : ''}`}
              placeholder="ghp_xxxx or github_pat_xxxx"
              value={config.githubToken}
              onChange={(e) => updateField('githubToken', e.target.value)}
              autoComplete="off"
            />
            <button
              className="input-icon"
              onClick={() => toggleShow('github')}
              aria-label="Toggle key visibility"
              type="button"
              style={{ background: 'none', border: 'none' }}
            >
              {showKeys.github ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Job Description (Optional) */}
        <div className="input-group">
          <label className="input-label">
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Job Description <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — tailors the evaluation score)</span>
          </label>
          <textarea
            className="input-field"
            placeholder="Paste the job description here..."
            value={config.jobDescription || ''}
            onChange={(e) => updateField('jobDescription', e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
          <button className="btn btn-primary btn-lg" onClick={onNext} disabled={!canProceed}>
            Continue to Upload
          </button>
        </div>
      </div>

      <PrivacyNotice />
    </div>
  );
}
