'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { ApiConfig, AppStep, EvaluationResult, TerminalLog, ToastNotification } from '@/types';
import { generateId } from '@/lib/utils';
import { mockEvaluationResult, mockTerminalLogs } from '@/data/mockData';

import Header from '@/components/Header';
import ConfigPanel from '@/components/ConfigPanel';
import ResumeUpload from '@/components/ResumeUpload';
import TerminalLogger from '@/components/TerminalLogger';
import Dashboard from '@/components/Dashboard';
import Toast from '@/components/Toast';
import HistorySidebar from '@/components/HistorySidebar';
import { saveToHistory, getHistory, clearHistory, updateHistoryDbId, HistoryItem } from '@/lib/storage';

/** Step indicator with connector lines */
function StepIndicator({ currentStep }: { currentStep: AppStep }) {
  const steps: { key: AppStep; label: string; num: string }[] = [
    { key: 'configure', label: 'Configure', num: '1' },
    { key: 'upload', label: 'Upload', num: '2' },
    { key: 'evaluating', label: 'Evaluate', num: '3' },
    { key: 'results', label: 'Results', num: '4' },
  ];

  const stepOrder: AppStep[] = ['configure', 'upload', 'evaluating', 'results'];
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="steps">
      {steps.map((s, i) => {
        const isComplete = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <div
                className={`step-connector ${isComplete ? 'step-connector-complete' : ''}`}
              />
            )}
            <div
              className={`step ${isActive ? 'step-active' : ''} ${isComplete ? 'step-complete' : ''}`}
            >
              <span className="step-number">
                {isComplete ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  // ─── State ────────────────────────────────────────────────
  const [step, setStep] = useState<AppStep>('configure');
  const [config, setConfig] = useState<ApiConfig>({
    geminiKey: '',
    deepseekKey: '',
    groqKey: '',
    openrouterKey: '',
    githubToken: '',
    githubUsername: '',
    selectedModel: 'gemini',
  });
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  React.useEffect(() => {
    setHistory(getHistory());
  }, []);

  // ─── Toast Helper ─────────────────────────────────────────
  const addToast = useCallback(
    (message: string, type: ToastNotification['type'], duration?: number) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Log Helper ───────────────────────────────────────────
  const addLog = useCallback((id: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      { id, message, status: 'running', timestamp: new Date() },
    ]);
  }, []);

  const updateLog = useCallback(
    (id: string, status: TerminalLog['status'], detail?: string) => {
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status, detail } : l))
      );
    },
    []
  );

  // ─── Mock Demo Mode ──────────────────────────────────────
  const handleMockMode = useCallback(async () => {
    setStep('evaluating');
    setLogs([]);

    // Simulate terminal logs with realistic delays
    for (let i = 0; i < mockTerminalLogs.length; i++) {
      const mock = mockTerminalLogs[i];
      await new Promise((res) => setTimeout(res, 400 + Math.random() * 300));
      setLogs((prev) => [...prev, { ...mock, id: `mock-${i}`, status: 'success' }]);
    }

    await new Promise((res) => setTimeout(res, 500));
    setResult(mockEvaluationResult);
    setStep('results');
    addToast('Mock evaluation complete — scores are simulated', 'info');
  }, [addToast]);

  // ─── Live Evaluation Pipeline ─────────────────────────────
  const runEvaluation = useCallback(async () => {
    if (!file && !rawText) return;

    setStep('evaluating');
    setLogs([]);
    setResult(null);
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      let pdfData: { text: string; wordCount: number; pageCount: number; githubUsername?: string };

      if (rawText) {
        // 1. Text Paste Bypass
        const textLogId = 'text-parse';
        addLog(textLogId, 'Sanitizing pasted resume text...');
        await new Promise(r => setTimeout(r, 400));
        
        const sanitizedText = rawText.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\n{3,}/g, '\n\n');
        const wordCount = sanitizedText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
        const githubMatch = sanitizedText.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
        const githubUsername = githubMatch ? githubMatch[1].trim() : undefined;
        
        pdfData = { text: sanitizedText, wordCount, pageCount: 1, githubUsername };
        
        updateLog(textLogId, 'success', `Processed ${wordCount.toLocaleString()} words directly from pasted text`);
      } else if (file) {
        // 1. Parse Image / PDF / DOCX
        const isImage = file.type.startsWith('image/');
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
        const parseLogId = 'file-parse';

        if (isImage) {
          addLog(parseLogId, 'Downloading OCR Engine (~15MB, one-time) and parsing image...');
          try {
            const Tesseract = (await import('tesseract.js')).default;
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            
            const sanitizedText = text.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\n{3,}/g, '\n\n');
            const wordCount = sanitizedText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
            
            if (wordCount < 10) {
              updateLog(parseLogId, 'error', 'Failed to extract meaningful text from image');
              addToast('Could not extract enough text from the image. Please use a clearer screenshot or paste the text.', 'error');
              return;
            }

            const githubMatch = sanitizedText.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
            const githubUsername = githubMatch ? githubMatch[1].trim() : undefined;
            
            pdfData = { text: sanitizedText, wordCount, pageCount: 1, githubUsername };
            updateLog(parseLogId, 'success', `Extracted ${wordCount.toLocaleString()} words via OCR`);
          } catch (err) {
            updateLog(parseLogId, 'error', 'OCR processing failed');
            addToast('Image processing failed. Please try a different format.', 'error');
            return;
          }
        } else {
          addLog(parseLogId, `Extracting text from ${isDocx ? 'Word Document' : 'PDF'}...`);

          const formData = new FormData();
          formData.append('file', file);

          const endpoint = isDocx ? '/api/parse-docx' : '/api/parse-pdf';
          const fileRes = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            signal,
          });

          if (!fileRes.ok) {
            const err = await fileRes.json().catch(() => ({ error: 'File parsing failed' }));
            updateLog(parseLogId, 'error', err.error || 'Failed to parse file');
            addToast(err.error || 'Failed to parse file', 'error');
            return;
          }

          pdfData = await fileRes.json();
          updateLog(
            parseLogId,
            'success',
            `Extracted ${pdfData.wordCount.toLocaleString()} words from ${pdfData.pageCount} page(s)`
          );
        }
      } else {
        return;
      }

      // 2. Fetch GitHub Data
      const targetUsername = config.githubUsername.trim() || pdfData.githubUsername;
      const ghLogId = 'github-fetch';
      let githubDataStr: string | null = null;

      if (targetUsername) {
        if (!config.githubUsername.trim() && pdfData.githubUsername) {
          addLog('github-detect', `Auto-detected GitHub username from resume: @${targetUsername}`);
          updateLog('github-detect', 'success', 'Used for GitHub analysis');
        }
        addLog(ghLogId, `Querying GitHub REST API for @${targetUsername}...`);

        try {
          const ghHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (config.githubToken) {
            ghHeaders['x-github-token'] = config.githubToken;
          }

          const ghRes = await fetch('/api/github', {
            method: 'POST',
            headers: ghHeaders,
            body: JSON.stringify({ username: targetUsername }),
            signal,
          });

          if (ghRes.ok) {
            const ghData = await ghRes.json();
            githubDataStr = JSON.stringify(ghData.metrics);
            const repoCount = ghData.metrics.evaluatedRepos?.length || 0;
            updateLog(
              ghLogId,
              'success',
              `Fetched ${repoCount} repositories (sorted by updated, public only)`
            );
          } else {
            const ghErr = await ghRes.json().catch(() => ({ error: 'GitHub API error' }));
            updateLog(ghLogId, 'error', ghErr.error || 'Failed to fetch GitHub data');
            addToast(
              `GitHub: ${ghErr.error || 'Failed to fetch'}. Continuing without GitHub data.`,
              'warning'
            );
          }
        } catch (ghError) {
          if (signal.aborted) return;
          updateLog(ghLogId, 'error', 'GitHub request failed — continuing without');
          addToast('GitHub fetch failed. Evaluation will proceed without GitHub data.', 'warning');
        }
      } else {
        addLog(ghLogId, 'No GitHub username provided or detected in resume.');
        updateLog(ghLogId, 'success', 'Skipping GitHub analysis.');
      }

      // 3. Fetch repo languages (logged as sub-step)
      if (githubDataStr) {
        const langLogId = 'lang-fetch';
        addLog(langLogId, 'Analyzing repository languages and commit history...');
        await new Promise((res) => setTimeout(res, 300));
        const parsed = JSON.parse(githubDataStr);
        const repoNames = parsed.evaluatedRepos?.map((r: { name: string }) => r.name).join(', ') || 'none';
        updateLog(langLogId, 'success', `Analyzed: ${repoNames}`);
      }

      // 4. LLM Evaluation
      const evalLogId = 'llm-eval';
      addLog(evalLogId, 'Evaluating against 100-point calibration rubric...');

      const apiKey = 
        config.selectedModel === 'gemini' ? config.geminiKey : 
        config.selectedModel === 'deepseek' ? config.deepseekKey :
        config.selectedModel === 'groq' ? config.groqKey :
        config.openrouterKey;
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          resumeText: pdfData.text,
          githubData: githubDataStr,
          jobDescription: config.jobDescription,
          model: config.selectedModel,
        }),
        signal,
      });

      if (!evalRes.ok) {
        const evalErr = await evalRes.json().catch(() => ({ error: 'Evaluation failed' }));
        updateLog(evalLogId, 'error', evalErr.error || 'LLM evaluation failed');
        addToast(evalErr.error || 'Evaluation failed. Check your API key.', 'error');
        return;
      }

      const evalData = await evalRes.json();
      
      const modelName = 
        config.selectedModel === 'gemini' ? 'Gemini 2.0 Flash' : 
        config.selectedModel === 'deepseek' ? 'DeepSeek Chat' :
        config.selectedModel === 'groq' ? 'Groq LLaMA-3 70B' :
        'OpenRouter (Claude 3.5)';

      updateLog(
        evalLogId,
        'success',
        `Model: ${modelName} | Rubric: 4-pillar weighted scoring`
      );

      // 5. Parse result
      const parseLogId = 'parse-result';
      addLog(parseLogId, 'Parsing structured evaluation response...');
      await new Promise((res) => setTimeout(res, 200));

      // Attach GitHub metrics from our own fetch if available
      if (githubDataStr && !evalData.githubMetrics) {
        evalData.githubMetrics = JSON.parse(githubDataStr);
      }

      updateLog(
        parseLogId,
        'success',
        `Score: ${evalData.overallScore}/100 — Evaluation complete`
      );

      setResult(evalData);

      const historyLabel = targetUsername ? `@${targetUsername}` : `Evaluation on ${new Date().toLocaleDateString()}`;
      const localId = saveToHistory(historyLabel, evalData);
      setHistory(getHistory());

      // Attempt to save to Supabase in the background
      fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: historyLabel, result: evalData }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setDbId(data.id);
            if (localId) updateHistoryDbId(localId, data.id);
            setHistory(getHistory());
          }
        })
        .catch(console.error);

      await new Promise((res) => setTimeout(res, 600));
      setStep('results');
      addToast(`Evaluation complete: ${evalData.overallScore}/100`, 'success');
    } catch (err: unknown) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      addToast(message, 'error');
    }
  }, [file, rawText, config, addLog, updateLog, addToast]);

  // ─── Navigation ───────────────────────────────────────────
  const goToUpload = useCallback(() => setStep('upload'), []);
  const goToConfigure = useCallback(() => {
    abortRef.current?.abort();
    setStep('configure');
  }, []);
  const startEvaluation = useCallback(() => {
    runEvaluation();
  }, [runEvaluation]);
  const resetAll = useCallback(() => {
    abortRef.current?.abort();
    setStep('configure');
    setFile(null);
    setRawText(null);
    setLogs([]);
    setResult(null);
    setDbId(null);
  }, []);

  return (
    <div className="app-container">
      <Header />
      <StepIndicator currentStep={step} />

      {step === 'configure' && (
        <>
          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
            onNext={goToUpload}
            onMockMode={handleMockMode}
          />
          <HistorySidebar 
            history={history} 
            onSelect={(item) => {
              setResult(item.result);
              if (item.dbId) {
                setDbId(item.dbId);
              } else {
                setDbId(null);
                // Auto-upload old/unsynced evaluations when viewed so they can be shared
                fetch('/api/evaluations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ label: item.label, result: item.result }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.id) {
                      setDbId(data.id);
                      updateHistoryDbId(item.id, data.id);
                      setHistory(getHistory());
                    }
                  })
                  .catch(console.error);
              }
              setStep('results');
            }} 
            onClear={() => {
              clearHistory();
              setHistory([]);
            }} 
          />
        </>
      )}

      {step === 'upload' && (
        <ResumeUpload
          file={file}
          onFileSelect={setFile}
          onFileRemove={() => setFile(null)}
          rawText={rawText}
          onTextSelect={setRawText}
          onNext={startEvaluation}
          onBack={goToConfigure}
          onToast={(msg, type) => addToast(msg, type)}
        />
      )}

      {step === 'evaluating' && (
        <TerminalLogger logs={logs} onBack={goToConfigure} onCancel={goToConfigure} />
      )}

      {step === 'results' && result && (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-lg)',
            }}
          >
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Evaluation Results
            </h2>
            <button className="btn btn-secondary btn-sm" onClick={resetAll}>
              ← Start Over
            </button>
          </div>
          <Dashboard result={result} dbId={dbId} />
          <div style={{ height: 'var(--space-3xl)' }} />
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
