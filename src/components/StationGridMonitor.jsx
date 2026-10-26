import React, { useState } from 'react';
import { Server, BatteryCharging, CheckCircle2, AlertCircle, X, Search, Filter, RefreshCw } from 'lucide-react';

export default function StationGridMonitor({ chargers, onRefresh }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedCharger, setSelectedCharger] = useState(null);

  const filteredChargers = (chargers || []).filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch =
      c.charger_id.toLowerCase().includes(search.toLowerCase()) ||
      c.space_id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CHARGING':
        return <BatteryCharging size={16} style={{ color: 'var(--primary-emerald)' }} />;
      case 'AVAILABLE':
        return <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />;
      case 'IDLE':
        return <AlertCircle size={16} style={{ color: 'var(--accent-amber)' }} />;
      default:
        return <Server size={16} />;
    }
  };

  const statusCounts = {
    CHARGING: (chargers || []).filter(c => c.status === 'CHARGING').length,
    AVAILABLE: (chargers || []).filter(c => c.status === 'AVAILABLE').length,
    IDLE: (chargers || []).filter(c => c.status === 'IDLE').length,
  };

  return (
    <div className="tab-content">
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Server size={22} style={{ color: 'var(--primary-emerald)' }} />
              Level 2 Charging Station Fleet Grid (50 EVSE Chargers)
            </h2>
            <p className="section-desc">
              Real-time hardware status monitor and active session telemetry across Caltech ACN-Data charging infrastructure
            </p>
          </div>
          <button className="btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} />
            <span>Refresh Grid</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', margin: '1.25rem 0', flexWrap: 'wrap' }}>
          <div className="nav-tabs" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <button
              className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All (50)
            </button>
            <button
              className={`tab-btn ${filter === 'CHARGING' ? 'active' : ''}`}
              onClick={() => setFilter('CHARGING')}
            >
              Charging ({statusCounts.CHARGING})
            </button>
            <button
              className={`tab-btn ${filter === 'AVAILABLE' ? 'active' : ''}`}
              onClick={() => setFilter('AVAILABLE')}
            >
              Available ({statusCounts.AVAILABLE})
            </button>
            <button
              className={`tab-btn ${filter === 'IDLE' ? 'active' : ''}`}
              onClick={() => setFilter('IDLE')}
            >
              Idle / Dwell ({statusCounts.IDLE})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
            <Search size={16} style={{ color: 'var(--text-sub)' }} />
            <input
              type="text"
              placeholder="Search Charger ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Chargers Grid */}
        <div className="chargers-grid">
          {filteredChargers.map((c) => (
            <div
              key={c.charger_id}
              className="charger-card"
              onClick={() => setSelectedCharger(c)}
            >
              <div className="charger-header">
                <span className="charger-id">{c.charger_id}</span>
                <span className={`status-badge ${c.status}`}>{c.status}</span>
              </div>
              
              <div className="charger-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {getStatusIcon(c.status)}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>Space {c.space_id}</span>
                </div>
                {c.recent_session?.kwh_delivered ? (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Last: {c.recent_session.kwh_delivered} kWh
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ready for EV</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charger Details Modal Drawer */}
      {selectedCharger && (
        <div className="modal-overlay" onClick={() => setSelectedCharger(null)}>
          <div className="modal-content glass-card glass-card-glow" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCharger(null)}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Server size={28} style={{ color: 'var(--primary-emerald)' }} />
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Charger {selectedCharger.charger_id} Telemetry</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>EVSE Space ID: {selectedCharger.space_id}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span className={`status-badge ${selectedCharger.status}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                    {selectedCharger.status}
                  </span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Charger Output Protocol</span>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  Level 2 J1772 (6.6 kW)
                </div>
              </div>
            </div>

            {selectedCharger.recent_session?.session_id ? (
              <div style={{ background: 'rgba(0, 245, 155, 0.05)', border: '1px solid rgba(0, 245, 155, 0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-emerald)', marginBottom: '0.75rem' }}>
                  Latest EV Session Telemetry
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div><strong style={{ color: 'var(--text-sub)' }}>Session ID:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedCharger.recent_session.session_id.slice(-8)}</span></div>
                  <div><strong style={{ color: 'var(--text-sub)' }}>User ID:</strong> {selectedCharger.recent_session.user_id}</div>
                  <div><strong style={{ color: 'var(--text-sub)' }}>Energy Delivered:</strong> {selectedCharger.recent_session.kwh_delivered} kWh</div>
                  <div><strong style={{ color: 'var(--text-sub)' }}>Plugin Time:</strong> {selectedCharger.recent_session.plug_in}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: 'var(--text-sub)' }}>
                No active session registered for this charger space.
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setSelectedCharger(null)}>
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
