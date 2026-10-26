import React from 'react';
import { Zap, Activity, Cpu, BarChart2, ShieldAlert, Layers } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, backendStatus }) {
  const navItems = [
    { id: 'monitor', label: 'Control Room Grid', icon: Activity },
    { id: 'predictor', label: 'AI Forecaster', icon: Zap },
    { id: 'simulation', label: 'SimPy Sandbox', icon: Cpu },
    { id: 'analytics', label: 'Demand Analytics', icon: BarChart2 },
    { id: 'benchmark', label: 'ML Benchmarks', icon: Layers },
    { id: 'scenarios', label: 'Scenario Matrix', icon: ShieldAlert },
  ];

  return (
    <header className="app-header glass-card">
      <div className="brand-container">
        <div className="brand-logo">
          <Zap size={26} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="brand-title">EV ChargePulse</span>
            <span className="brand-badge">Digital Control Room</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '0.1rem' }}>
            Predictive Analytics & Discrete-Event Simulation Engine
          </p>
        </div>
      </div>

      <nav className="nav-tabs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="live-status">
        <span className="pulse-dot" style={{ background: backendStatus ? 'var(--primary-emerald)' : 'var(--accent-rose)', boxShadow: backendStatus ? '0 0 10px var(--primary-emerald)' : '0 0 10px var(--accent-rose)' }}></span>
        <span>{backendStatus ? 'Backend Connected' : 'Connecting to API...'}</span>
      </div>
    </header>
  );
}
