import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, TrendingDown, ArrowRight, Zap, Lightbulb } from 'lucide-react';

export default function ScenarioDecisionSupport() {
  const [scenariosReport, setScenariosReport] = useState(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenariosReport(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="tab-content">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <ShieldAlert size={22} style={{ color: 'var(--accent-rose)' }} />
              Monte Carlo Scenario & Policy Decision Support Matrix
            </h2>
            <p className="section-desc">
              Comparative analysis of mitigation strategies across SimPy discrete-event simulation runs
            </p>
          </div>
        </div>

        {scenariosReport?.scenarios ? (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Scenario Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {Object.entries(scenariosReport.scenarios).map(([sKey, sData]) => {
                const isRecommended = sKey.toLowerCase().includes('recommend') || sKey.includes('Cap');
                return (
                  <div
                    key={sKey}
                    className={`glass-card ${isRecommended ? 'glass-card-glow' : ''}`}
                    style={{ padding: '1.25rem', position: 'relative' }}
                  >
                    {isRecommended && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0, 245, 155, 0.2)',
                          color: 'var(--primary-emerald)',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(0, 245, 155, 0.4)'
                        }}
                      >
                        RECOMMENDED
                      </span>
                    )}

                    <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem', paddingRight: '80px' }}>
                      {sKey.replace(/_/g, ' ')}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', fontSize: '0.82rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Avg Wait Time</span>
                        <strong style={{ fontSize: '1.1rem', color: sData.mean_wait_min > 10 ? 'var(--accent-rose)' : 'var(--primary-emerald)' }}>
                          {sData.mean_wait_min?.toFixed(1)} min
                        </strong>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Max Queue</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--accent-amber)' }}>
                          {sData.max_queue_length} EVs
                        </strong>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>EVs Served</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                          {sData.total_evs_served}
                        </strong>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block' }}>Utilization</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--accent-violet)' }}>
                          {sData.server_utilization_pct?.toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decision Support Guidance Card */}
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Lightbulb size={24} style={{ color: 'var(--accent-violet)' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Executive Decision Recommendation</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: '1.6' }}>
                {scenariosReport.executive_recommendation ||
                  "Implementing a 3-Hour Dynamic Dwell Cap Policy reduces average EV driver queue waiting times by up to 68% without incurring capital expenditure costs required for physical station hardware expansion."}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading scenarios report...</div>
        )}
      </div>
    </div>
  );
}
