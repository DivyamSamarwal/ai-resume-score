import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Base100 - AI Resume Evaluator',
  description:
    'Run your resume through a calibrated 100-point AI evaluation rubric powered by Gemini or DeepSeek, cross-referenced with your GitHub activity. Get brutally honest feedback before a recruiter does.',
  keywords: [
    'Base100',
    'resume evaluator',
    'AI resume scorer',
    'resume reality check',
    'GitHub resume analysis',
    'developer resume',
    'ATS scorer',
    'resume feedback',
  ],
  openGraph: {
    title: 'Base100 - AI Resume Evaluator',
    description:
      'Score your resume with a 100-point AI rubric. Powered by Gemini/DeepSeek + GitHub analysis.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#f8f9fa" />
      </head>
      <body>{children}</body>
    </html>
  );
}
