import React from 'react';
import { BatteryCharging, Zap, Gauge, Clock, Server } from 'lucide-react';

export default function MetricsBanner({ summary }) {
  if (!summary || Object.keys(summary).length === 0) {
    return (
      <div className="metrics-banner">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card stat-card" style={{ opacity: 0.6 }}>
            <div className="stat-info">
              <div className="stat-label">Loading Metric...</div>
              <div className="stat-value">--</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Sessions Processed',
      value: summary.total_sessions?.toLocaleString() || '26,886',
      sub: `${summary.date_range_start || '2018-04-25'} to ${summary.date_range_end || '2021-09-13'}`,
      icon: BatteryCharging,
      accent: 'var(--primary-emerald)'
    },
    {
      label: 'Total Energy Delivered',
      value: `${(summary.total_energy_delivered_kwh / 1000)?.toFixed(1)} MWh`,
      sub: `Avg ${summary.mean_energy_per_session_kwh || '10.85'} kWh / session`,
      icon: Zap,
      accent: 'var(--accent-cyan)'
    },
    {
      label: 'Peak Simultaneous EVs',
      value: `${summary.peak_simultaneous_active_evs || 33} EVs`,
      sub: `${summary.peak_utilization_pct || 66.0}% Max Station Utilization`,
      icon: Gauge,
      accent: 'var(--accent-amber)'
    },
    {
      label: 'Level 2 Station Fleet',
      value: `${summary.total_chargers || 50} Chargers`,
      sub: `Avg Session: ${summary.mean_charging_duration_hrs || '2.84'} Hours`,
      icon: Server,
      accent: 'var(--accent-violet)'
    }
  ];

  return (
    <div className="metrics-banner">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="glass-card stat-card"
            style={{ '--accent-color': m.accent }}
          >
            <div className="stat-info">
              <div className="stat-label">{m.label}</div>
              <div className="stat-value">{m.value}</div>
              <div className="stat-sub">{m.sub}</div>
            </div>
            <div className="stat-icon" style={{ '--accent-color': m.accent }}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
