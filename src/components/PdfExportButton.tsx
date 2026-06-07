'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { EvaluationResult } from '@/types';
import { Printer } from 'lucide-react';
import PdfReport from './PdfReport';

// Dynamically import the PDFDownloadLink to prevent Next.js SSR hydration errors
// since @react-pdf/renderer relies heavily on browser APIs (like Blob)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface PdfExportButtonProps {
  result: EvaluationResult;
}

export default function PdfExportButton({ result }: PdfExportButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a disabled skeleton button while waiting for client-side hydration
    return (
      <button className="btn btn-secondary print-hide" disabled>
        <Printer size={16} />
        Loading PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<PdfReport result={result} />}
      fileName={`Base100_Evaluation_${new Date().toISOString().split('T')[0]}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {/* 
        PDFDownloadLink passes an object to its children: 
        { blob, url, loading, error }
        We use an inline function to determine the button state
      */}
      {({ loading, error }) => (
        <button
          className="btn btn-secondary print-hide"
          disabled={loading}
          style={error ? { borderColor: 'red' } : {}}
        >
          <Printer size={16} />
          {loading ? 'Generating PDF...' : error ? 'Export Failed' : 'Export PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
