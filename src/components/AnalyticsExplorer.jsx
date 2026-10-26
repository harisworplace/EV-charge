import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsExplorer() {
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [activeTab, setActiveTab] = useState('hourly');

  const figureFiles = [
    { title: 'Hourly EV Arrivals', file: '02_ev_arrivals_by_hour.png' },
    { title: 'Weekly Arrival Distribution', file: '03_ev_arrivals_by_day_of_week.png' },
    { title: 'Charging Duration Histogram', file: '04_charging_duration_distribution.png' },
    { title: 'Energy Delivered (kWh)', file: '05_energy_delivered_distribution.png' },
    { title: 'Station Utilization Heatmap', file: '11_station_utilization.png' },
    { title: 'Simultaneous Active EVs', file: '12_simultaneous_charging_sessions.png' },
    { title: 'Permutation Feature Importance', file: '16_feature_importance.png' },
    { title: 'Scenario Queue Comparison', file: '17_scenario_waiting_time_queue_comparison.png' },
  ];

  useEffect(() => {
    fetch('/api/analytics/hourly')
      .then((res) => res.json())
      .then((data) => setHourlyData(data))
      .catch((err) => console.error(err));

    fetch('/api/analytics/daily')
      .then((res) => res.json())
      .then((data) => setDailyData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="tab-content">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <BarChart2 size={22} style={{ color: 'var(--accent-cyan)' }} />
              Historical Demand Analytics & Profiling
            </h2>
            <p className="section-desc">
              Exploratory Data Analysis (EDA) profiles for 26,886 charging sessions across 50 Level 2 EV Chargers
            </p>
          </div>

          <div className="nav-tabs">
            <button
              className={`tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
              onClick={() => setActiveTab('hourly')}
            >
              <Clock size={16} />
              Hourly Demand
            </button>
            <button
              className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              <Calendar size={16} />
              Daily Demand Timeline
            </button>
            <button
              className={`tab-btn ${activeTab === 'figures' ? 'active' : ''}`}
              onClick={() => setActiveTab('figures')}
            >
              <ImageIcon size={16} />
              Matplotlib Figures Gallery
            </button>
          </div>
        </div>

        {activeTab === 'hourly' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ height: '300px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                EV Arrival Session Volume by Hour of Day (00:00 - 23:00)
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="arrival_hour" stroke="var(--text-muted)" fontSize={12} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="session_count" fill="var(--primary-emerald)" radius={[6, 6, 0, 0]} name="Total EV Arrivals" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ height: '300px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
                Average Energy Delivered per Session (kWh) by Hour of Day
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="arrival_hour" stroke="var(--text-muted)" fontSize={12} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="avg_kwh" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4 }} name="Avg kWh Delivered" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div style={{ marginTop: '1.5rem', height: '400px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>
              Daily Station Energy Demand Timeline (kWh)
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData.slice(0, 180)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="total_kwh" stroke="var(--accent-violet)" strokeWidth={2} dot={false} name="Daily Energy (kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'figures' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {figureFiles.map((fig, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {fig.title}
                </h4>
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                  <img
                    src={`/static/figures/${fig.file}`}
                    alt={fig.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
