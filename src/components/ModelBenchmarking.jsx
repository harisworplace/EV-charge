import React, { useState, useEffect } from 'react';
import { Layers, Award, BarChart, CheckCircle2, Star } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelBenchmarking() {
  const [modelPerf, setModelPerf] = useState(null);
  const [featImportance, setFeatImportance] = useState(null);

  useEffect(() => {
    fetch('/api/model-performance')
      .then((res) => res.json())
      .then((data) => setModelPerf(data))
      .catch((err) => console.error(err));

    fetch('/api/feature-importance')
      .then((res) => res.json())
      .then((data) => setFeatImportance(data))
      .catch((err) => console.error(err));
  }, []);

  const featureEntries = featImportance?.feature_importance
    ? Object.entries(featImportance.feature_importance)
    : Array.isArray(featImportance?.top_features)
      ? featImportance.top_features.map((item) => [item.feature, item.importance_mean ?? item.importance ?? 0])
      : [];

  const featureChartData = featureEntries
    .map(([name, imp]) => ({
      name: String(name).replace(/_/g, ' '),
      importance: Number((Number(imp) * 100).toFixed(2))
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 8);

  return (
    <div className="tab-content">
      <div className="grid-2col">
        {/* Machine Learning Model Performance Metrics Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <Award size={22} style={{ color: 'var(--accent-amber)' }} />
                Supervised Model Performance Benchmark
              </h3>
              <p className="section-desc">
                Comparison of classifier algorithms trained on hourly EV station time-series dataset
              </p>
            </div>
          </div>

          {modelPerf?.model_comparison ? (
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1 Score</th>
                    <th>ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(modelPerf.model_comparison).map(([mName, metrics]) => {
                    const isBest = mName === modelPerf.best_model_name;
                    return (
                      <tr key={mName} style={{ background: isBest ? 'rgba(0, 245, 155, 0.08)' : 'transparent' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isBest && <Star size={14} style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />}
                            <strong style={{ color: isBest ? 'var(--primary-emerald)' : 'var(--text-main)' }}>
                              {mName}
                            </strong>
                          </div>
                        </td>
                        <td>{(metrics.accuracy * 100).toFixed(1)}%</td>
                        <td>{(metrics.precision * 100).toFixed(1)}%</td>
                        <td>{(metrics.recall * 100).toFixed(1)}%</td>
                        <td>{(metrics.f1_score * 100).toFixed(1)}%</td>
                        <td>{(metrics.roc_auc * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: 'rgba(0, 245, 155, 0.05)', border: '1px solid rgba(0, 245, 155, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--primary-emerald)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                  <strong>{modelPerf.best_model_name}</strong> selected for production inference due to superior F1 Score ({(modelPerf.model_comparison[modelPerf.best_model_name]?.f1_score * 100).toFixed(1)}%) and ROC-AUC curve.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading model report...</div>
          )}
        </div>

        {/* Feature Importance Ranking */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <BarChart size={20} style={{ color: 'var(--accent-cyan)' }} />
                Permutation Feature Importance
              </h3>
              <p className="section-desc">
                Top predictive features impacting charging station congestion probabilities
              </p>
            </div>
          </div>

          {featureChartData.length > 0 ? (
            <div style={{ height: '320px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={featureChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={130} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="importance" fill="var(--accent-cyan)" radius={[0, 6, 6, 0]} name="Importance %" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No feature importance data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
