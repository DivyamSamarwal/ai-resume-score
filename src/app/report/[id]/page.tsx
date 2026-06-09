import { notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="app-container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Database Not Configured</h2>
        <p>Supabase is not configured on this environment.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from('evaluations')
    .select('result_data, created_at')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !data) {
    return notFound();
  }

  return (
    <div className="app-container">
      <Header />
      <div style={{ animation: 'slideUp 0.5s ease-out' }}>
        <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
          <div className="header-badge" style={{ display: 'inline-block', marginBottom: '8px', background: 'var(--accent-blue)', color: 'white' }}>
            Public Report
          </div>
          <h2 className="section-title">Evaluation Results</h2>
          <p className="section-description">
            Generated on {new Date(data.created_at).toLocaleDateString()}
          </p>
        </div>
        <Dashboard result={data.result_data} />
        <div style={{ height: 'var(--space-3xl)' }} />
      </div>
    </div>
  );
}
