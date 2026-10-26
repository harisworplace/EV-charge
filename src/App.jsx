import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsBanner from './components/MetricsBanner';
import StationGridMonitor from './components/StationGridMonitor';
import AIPredictor from './components/AIPredictor';
import SimulationSandbox from './components/SimulationSandbox';
import AnalyticsExplorer from './components/AnalyticsExplorer';
import ModelBenchmarking from './components/ModelBenchmarking';
import ScenarioDecisionSupport from './components/ScenarioDecisionSupport';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [backendStatus, setBackendStatus] = useState(false);
  const [summary, setSummary] = useState(null);
  const [chargers, setChargers] = useState([]);

  // Fetch summary and chargers status
  const fetchStationData = async () => {
    try {
      const summaryRes = await fetch('/api/summary');
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
        setBackendStatus(true);
      } else {
        setBackendStatus(false);
      }

      const chargersRes = await fetch('/api/congestion');
      if (chargersRes.ok) {
        const charData = await chargersRes.json();
        setChargers(charData);
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
      setBackendStatus(false);
    }
  };

  useEffect(() => {
    fetchStationData();
    const interval = setInterval(fetchStationData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      {/* Metrics Banner */}
      <MetricsBanner summary={summary} />

      {/* Main Active Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'monitor' && (
          <StationGridMonitor chargers={chargers} onRefresh={fetchStationData} />
        )}
        {activeTab === 'predictor' && <AIPredictor />}
        {activeTab === 'simulation' && <SimulationSandbox />}
        {activeTab === 'analytics' && <AnalyticsExplorer />}
        {activeTab === 'benchmark' && <ModelBenchmarking />}
        {activeTab === 'scenarios' && <ScenarioDecisionSupport />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          EV ChargePulse Digital Control Room &bull; Caltech ACN-Data Modeling &amp; Discrete-Event Simulation &bull; Powered by FastAPI &amp; React
        </p>
      </footer>
    </div>
  );
}
