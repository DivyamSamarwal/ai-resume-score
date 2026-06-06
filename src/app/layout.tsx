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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body>{children}</body>
    </html>
  );
}
