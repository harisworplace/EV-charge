import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, HelpCircle, Activity, Sparkles, Send } from 'lucide-react';

export default function AIPredictor() {
  const [formData, setFormData] = useState({
    hour: 14,
    day_of_week: 2,
    active_evs: 18,
    rolling_3h_kwh: 75.5,
    lag_1h_active_evs: 16
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(val) }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="grid-2col">
        {/* Input Controls Panel */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">
                <Sparkles size={20} style={{ color: 'var(--accent-cyan)' }} />
                AI Congestion Forecasting Portal
              </h3>
              <p className="section-desc">
Input real-time operational parameters to generate Gradient Boosting congestion probability forecasts              </p>
            </div>
          </div>

          <form onSubmit={handlePredict} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hour of Day (0 - 23 hrs): {formData.hour}:00</label>
              <input
                type="range"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) => handleChange('hour', e.target.value)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', e.target.value)}
              >
                {daysOfWeek.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Active EVs at Station: {formData.active_evs} EVs</label>
              <input
                type="range"
                min="0"
                max="50"
                value={formData.active_evs}
                onChange={(e) => handleChange('active_evs', e.target.value)}
                style={{ accentColor: 'var(--primary-emerald)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rolling 3-Hour Energy Demand (kWh)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="300"
                step="0.5"
                value={formData.rolling_3h_kwh}
                onChange={(e) => handleChange('rolling_3h_kwh', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Previous Hour Active EVs: {formData.lag_1h_active_evs}</label>
              <input
                type="range"
                min="0"
                max="50"
                value={formData.lag_1h_active_evs}
                onChange={(e) => handleChange('lag_1h_active_evs', e.target.value)}
                style={{ accentColor: 'var(--accent-amber)' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              <Send size={18} />
              <span>{loading ? 'Evaluating Model...' : 'Run AI Congestion Forecast'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results Display */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
          <div className="section-header">
            <h3 className="section-title">
              <Activity size={20} style={{ color: 'var(--primary-emerald)' }} />
              Model Inference Output
            </h3>
          </div>

          {prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {/* Forecast Badge & Gauge */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Predicted Congestion State
                </span>
                
                <div style={{ margin: '0.75rem 0' }}>
                  <span
                    className={`status-badge ${prediction.predicted_congestion_level}`}
                    style={{ fontSize: '1.2rem', padding: '0.5rem 1.25rem', borderRadius: '8px' }}
                  >
                    {prediction.predicted_congestion_level} CONGESTION RISK
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '0.3rem' }}>
                  <span>Congestion Probability</span>
                  <strong style={{ color: 'var(--text-main)' }}>{(prediction.congestion_probability * 100).toFixed(1)}%</strong>
                </div>

                <div className="probability-bar-container">
                  <div
                    className={`probability-bar-fill fill-${prediction.predicted_congestion_level.toLowerCase()}`}
                    style={{ width: `${Math.max(5, prediction.congestion_probability * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Station Capacity Utilization Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Expected Active EVs</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {prediction.expected_active_evs} EVs
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>Expected Fleet Utilization</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-emerald)', marginTop: '0.2rem' }}>
                    {prediction.expected_utilization_pct}%
                  </div>
                </div>
              </div>

              {/* Influential Factors Breakdown */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                  Key Influential Prediction Factors
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {prediction.influential_explanation_factors?.map((factor, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--accent-violet)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      • {factor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action Alert Box */}
              <div className={`action-box ${prediction.predicted_congestion_level}`}>
                {prediction.predicted_congestion_level === 'HIGH' ? (
                  <AlertTriangle size={22} style={{ flexShrink: 0 }} />
                ) : (
                  <ShieldCheck size={22} style={{ flexShrink: 0 }} />
                )}
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>
                    AI Decision Support Recommendation
                  </strong>
                  <span style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {prediction.recommended_operator_action}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <Zap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>
                Adjust parameters on the left and click "Run AI Congestion Forecast" to evaluate real-time ML inference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
