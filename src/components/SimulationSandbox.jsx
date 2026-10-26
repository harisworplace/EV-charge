import React, { useState } from 'react';
import {
  Cpu,
  Play,
  BarChart2,
  Clock,
  Users,
  Activity,
  Zap,
  Timer
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SimulationSandbox() {

  // ============================================================
  // SIMULATION PARAMETERS
  // ============================================================

  const [params, setParams] = useState({
    num_chargers: 50,
    arrival_scale: 2.5,
    max_dwell_hrs: null,
    sim_hours: 168
  });

  const [simResults, setSimResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  // ============================================================
  // RUN SIMULATION
  // ============================================================

  const handleRunSimulation = async (e) => {

    if (e) {
      e.preventDefault();
    }

    setRunning(true);
    setError('');
    setSimResults(null);

    try {

      console.log('Sending simulation parameters:', params);

      const response = await fetch('/api/simulation', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          num_chargers: Number(params.num_chargers),
          arrival_scale: Number(params.arrival_scale),

          max_dwell_hrs:
            params.max_dwell_hrs === null
              ? null
              : Number(params.max_dwell_hrs),

          sim_hours: Number(params.sim_hours)
        })
      });

      // ----------------------------------------------------------
      // Check HTTP response
      // ----------------------------------------------------------

      if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
          `Backend error ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      console.log('SIMULATION RESPONSE:', data);

      // ----------------------------------------------------------
      // IMPORTANT
      // Your Python returns:
      //
      // {
      //   parameters: {...},
      //   performance_measures: {...},
      //   time_series: {...}
      // }
      // ----------------------------------------------------------

      if (!data.performance_measures) {

        throw new Error(
          'Backend response does not contain performance_measures.'
        );
      }

      setSimResults(data);

    } catch (err) {

      console.error(
        'Simulation Error:',
        err
      );

      setError(
        err.message ||
        'Unable to run simulation.'
      );

    } finally {

      setRunning(false);
    }
  };

  // ============================================================
  // EXTRACT PERFORMANCE MEASURES
  // ============================================================

  const metrics =
    simResults?.performance_measures || {};

  // ============================================================
  // EXTRACT TIME SERIES
  // ============================================================

  const queueHistory =
    simResults?.time_series?.queue_history || [];

  const occupancyHistory =
    simResults?.time_series?.occupancy_history || [];

  // Convert queue history into chart data

  const chartData = queueHistory.map(
    (queue, index) => ({
      time: index * 0.5,
      queue_length: queue,
      occupied_chargers:
        occupancyHistory[index] || 0
    })
  );

  // ============================================================
  // FORMAT HELPERS
  // ============================================================

  const formatNumber = (value, decimals = 1) => {

    if (
      value === undefined ||
      value === null ||
      Number.isNaN(Number(value))
    ) {
      return '0';
    }

    return Number(value).toFixed(decimals);
  };

  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="tab-content">

      <div className="grid-2col">

        {/* ======================================================
            LEFT SIDE - SIMULATION CONTROLS
        ====================================================== */}

        <div
          className="glass-card"
          style={{
            padding: '1.5rem'
          }}
        >

          <div className="section-header">

            <div>

              <h3 className="section-title">

                <Cpu
                  size={20}
                  style={{
                    color: 'var(--accent-violet)'
                  }}
                />

                SimPy Discrete-Event Simulation Sandbox

              </h3>

              <p className="section-desc">

                Configure station capacity and arrival intensity
                to simulate queue delays and charging bottleneck
                dynamics.

              </p>

            </div>

          </div>

          {/* ====================================================
              FORM
          ==================================================== */}

          <form
            onSubmit={handleRunSimulation}
            style={{
              marginTop: '1rem'
            }}
          >

            {/* NUMBER OF CHARGERS */}

            <div className="form-group">

              <label className="form-label">

                Number of Chargers:{' '}

                <strong>
                  {params.num_chargers}
                </strong>

                {' '}Level 2 EVSEs

              </label>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={params.num_chargers}

                onChange={(e) =>
                  setParams({
                    ...params,
                    num_chargers:
                      Number(e.target.value)
                  })
                }

                style={{
                  accentColor:
                    'var(--accent-violet)'
                }}
              />

            </div>


            {/* ARRIVAL SCALE */}

            <div className="form-group">

              <label className="form-label">

                Arrival Intensity Scale:{' '}

                <strong>
                  {params.arrival_scale}x
                </strong>

                {' '}Baseline

              </label>

              <input
                type="range"
                min="0.5"
                max="5"
                step="0.25"

                value={params.arrival_scale}

                onChange={(e) =>
                  setParams({
                    ...params,
                    arrival_scale:
                      Number(e.target.value)
                  })
                }

                style={{
                  accentColor:
                    'var(--accent-cyan)'
                }}
              />

            </div>


            {/* DWELL POLICY */}

            <div className="form-group">

              <label className="form-label">

                Dynamic Dwell Time Cap Policy

              </label>

              <select
                className="form-select"

                value={
                  params.max_dwell_hrs === null
                    ? 'none'
                    : String(params.max_dwell_hrs)
                }

                onChange={(e) => {

                  const value =
                    e.target.value;

                  setParams({
                    ...params,

                    max_dwell_hrs:
                      value === 'none'
                        ? null
                        : Number(value)
                  });

                }}
              >

                <option value="none">
                  Uncapped - Baseline
                </option>

                <option value="2">
                  2-Hour Cap Policy
                </option>

                <option value="3">
                  3-Hour Cap Policy
                </option>

                <option value="4">
                  4-Hour Cap Policy
                </option>

              </select>

            </div>


            {/* SIMULATION HOURS */}

            <div className="form-group">

              <label className="form-label">

                Simulation Time Horizon:{' '}

                <strong>
                  {params.sim_hours}
                </strong>

                {' '}Hours

                {' '}
                (
                {Math.round(
                  params.sim_hours / 24
                )}
                {' '}Days)

              </label>

              <input
                type="range"
                min="24"
                max="720"
                step="24"

                value={params.sim_hours}

                onChange={(e) =>
                  setParams({
                    ...params,
                    sim_hours:
                      Number(e.target.value)
                  })
                }

                style={{
                  accentColor:
                    'var(--primary-emerald)'
                }}
              />

            </div>


            {/* RUN BUTTON */}

            <button
              type="submit"

              className="btn-primary"

              style={{
                width: '100%',
                marginTop: '1rem',

                background:
                  'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))'
              }}

              disabled={running}
            >

              <Play size={18} />

              <span>

                {running
                  ? 'Executing SimPy Engine...'
                  : 'Run Discrete-Event Simulation'}

              </span>

            </button>

          </form>


          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '10px',

                background:
                  'rgba(239,68,68,0.12)',

                border:
                  '1px solid rgba(239,68,68,0.4)',

                color:
                  '#f87171'
              }}
            >

              <strong>
                Simulation Error
              </strong>

              <div
                style={{
                  marginTop: '0.4rem'
                }}
              >

                {error}

              </div>

            </div>

          )}

        </div>


        {/* ======================================================
            RIGHT SIDE - RESULTS
        ====================================================== */}

        <div
          className="glass-card"

          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >

          {/* HEADER */}

          <div className="section-header">

            <h3 className="section-title">

              <BarChart2
                size={20}
                style={{
                  color:
                    'var(--accent-cyan)'
                }}
              />

              Simulation Outcome Performance

            </h3>

          </div>


          {/* ====================================================
              RESULTS
          ==================================================== */}

          {simResults ? (

            <>

              {/* =================================================
                  METRIC CARDS
              ================================================= */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '1rem'
                }}
              >


                {/* TOTAL EVS */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Total EVs Served

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--primary-emerald)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {metrics.total_completed_sessions ?? 0}

                  </div>

                </div>


                {/* THROUGHPUT */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Throughput

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-cyan)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.throughput_evs_per_hour,
                      2
                    )}

                    {' '}EV/hr

                  </div>

                </div>


                {/* AVERAGE WAIT */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Average Wait Time

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',

                      color:
                        metrics.avg_waiting_time_min > 15
                          ? 'var(--accent-rose)'
                          : 'var(--accent-cyan)',

                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.avg_waiting_time_min,
                      1
                    )}

                    {' '}min

                  </div>

                </div>


                {/* MAX WAIT */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Maximum Wait Time

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-rose)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.max_waiting_time_min,
                      1
                    )}

                    {' '}min

                  </div>

                </div>


                {/* AVG QUEUE */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Average Queue Length

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-amber)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.avg_queue_length,
                      2
                    )}

                    {' '}EVs

                  </div>

                </div>


                {/* PEAK QUEUE */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Peak Queue Length

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-amber)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {metrics.max_queue_length ?? 0}

                    {' '}EVs

                  </div>

                </div>


                {/* UTILIZATION */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Charger Utilization

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-violet)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.charger_utilization_pct,
                      1
                    )}

                    %

                  </div>

                </div>


                {/* CONGESTION */}

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.03)',

                    padding: '1rem',

                    borderRadius: '12px'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.78rem',
                      color:
                        'var(--text-sub)'
                    }}
                  >

                    Congestion Frequency

                  </span>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color:
                        'var(--accent-rose)',
                      marginTop: '0.2rem'
                    }}
                  >

                    {formatNumber(
                      metrics.congestion_frequency_pct,
                      1
                    )}

                    %

                  </div>

                </div>

              </div>


              {/* =================================================
                  CHART
              ================================================= */}

              {chartData.length > 0 && (

                <div
                  style={{
                    height: '280px',
                    marginTop: '1rem'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.8rem',
                      color:
                        'var(--text-sub)',
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}
                  >

                    Queue Length Timeline

                  </span>


                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart
                      data={chartData}
                    >

                      <defs>

                        <linearGradient
                          id="queueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.6}
                          />

                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />

                        </linearGradient>

                      </defs>


                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />


                      <XAxis
                        dataKey="time"
                        minTickGap={30}
                        stroke="var(--text-muted)"
                        fontSize={11}
                        label={{
                          value:
                            'Simulation Time (hours)',
                          position:
                            'insideBottom',
                          offset: -5
                        }}
                      />


                      <YAxis
                        stroke="var(--text-muted)"
                        fontSize={11}
                      />


                      <Tooltip
                        contentStyle={{
                          background:
                            '#0F172A',
                          border:
                            '1px solid rgba(255,255,255,0.1)',
                          borderRadius:
                            '8px'
                        }}
                      />


                      <Area
                        type="monotone"
                        dataKey="queue_length"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#queueGradient)"
                        name="Queue Length"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              )}


              {/* =================================================
                  PARAMETER SUMMARY
              ================================================= */}

              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background:
                    'rgba(255,255,255,0.025)'
                }}
              >

                <div
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--text-sub)',
                    marginBottom: '0.6rem'
                  }}
                >

                  Simulation Configuration

                </div>


                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(4, 1fr)',
                    gap: '0.75rem'
                  }}
                >

                  <div>
                    <small>Chargers</small>

                    <div>
                      {simResults.parameters?.num_chargers}
                    </div>
                  </div>


                  <div>
                    <small>Arrival Scale</small>

                    <div>
                      {simResults.parameters?.arrival_scale}x
                    </div>
                  </div>


                  <div>
                    <small>Duration</small>

                    <div>
                      {simResults.parameters?.sim_hours} hrs
                    </div>
                  </div>


                  <div>
                    <small>Dwell Cap</small>

                    <div>
                      {simResults.parameters?.max_dwell_hrs
                        ? `${simResults.parameters.max_dwell_hrs} hrs`
                        : 'None'}
                    </div>
                  </div>

                </div>

              </div>

            </>

          ) : (

            /* ====================================================
               EMPTY STATE
            ==================================================== */

            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}
            >

              <Cpu
                size={48}
                style={{
                  opacity: 0.3,
                  marginBottom: '1rem'
                }}
              />

              <p
                style={{
                  fontSize: '0.9rem'
                }}
              >

                Configure the simulation
                parameters and click

                <br />

                <strong>
                  Run Discrete-Event Simulation
                </strong>

                {' '}to generate queueing
                and charger performance metrics.

              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
