import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Award, Target, Activity, Calendar, Users, RotateCcw } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, userFilter }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#0f172a',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        minWidth: '180px'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.35rem', fontWeight: 600 }}>
          {label} ({data.workoutSetName})
        </p>

        {payload.map((entry) => (
          <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ color: entry.color, fontWeight: 700, fontSize: '0.875rem' }}>
              {entry.name}:
            </span>
            <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
              {entry.value} kg
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ProgressChart = () => {
  const { user } = useAuth();

  const [exercisesList, setExercisesList] = useState([]);
  const [workoutSetsList, setWorkoutSetsList] = useState([]);
  
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedWorkoutSetId, setSelectedWorkoutSetId] = useState('');
  const [userFilter, setUserFilter] = useState('both'); // 'both', 'dasun_navindu', 'gayan_maduranga'

  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [defaultMinDate, setDefaultMinDate] = useState('');
  const [defaultMaxDate, setDefaultMaxDate] = useState('');

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats calculation
  const [stats, setStats] = useState({
    current: null,
    best: null,
    average: null,
    trend: null,
  });

  // Fetch available exercise list and workout sets
  useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        const [exRes, setsRes] = await Promise.all([
          api.get('/progress/exercises'),
          api.get('/workouts'),
        ]);

        setExercisesList(exRes.data);
        if (exRes.data.length > 0) {
          setSelectedExercise(exRes.data[0]);
        }

        setWorkoutSetsList(setsRes.data);
      } catch (err) {
        console.error('Failed to load chart filter options:', err);
        setError('Failed to load filter options');
      }
    };
    fetchInitialOptions();
  }, []);

  // Fetch chart data when filters change
  useEffect(() => {
    if (!selectedExercise) return;

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `/progress/${encodeURIComponent(selectedExercise)}?`;
        if (selectedWorkoutSetId) url += `workoutSetId=${selectedWorkoutSetId}&`;
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;

        const response = await api.get(url);
        const { progressData, minDate, maxDate } = response.data;

        // Set default date range bounds if not set by user
        if (minDate && !startDate) setDefaultMinDate(minDate);
        if (maxDate && !endDate) setDefaultMaxDate(maxDate);

        const formatted = progressData.map((item) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        }));

        setChartData(formatted);

        // Compute statistics based on userFilter
        if (formatted.length > 0) {
          let weights = [];
          if (userFilter === 'dasun_navindu') {
            weights = formatted.map((d) => d.dasun_navindu).filter((w) => w !== undefined && w !== null);
          } else if (userFilter === 'gayan_maduranga') {
            weights = formatted.map((d) => d.gayan_maduranga).filter((w) => w !== undefined && w !== null);
          } else {
            // Both users combined max/avg
            formatted.forEach((d) => {
              if (d.dasun_navindu) weights.push(d.dasun_navindu);
              if (d.gayan_maduranga) weights.push(d.gayan_maduranga);
            });
          }

          if (weights.length > 0) {
            const current = weights[weights.length - 1];
            const best = Math.max(...weights);
            const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);

            let trendVal = 0;
            if (weights.length > 1) {
              const first = weights[0];
              trendVal = +(current - first).toFixed(1);
            }

            setStats({
              current,
              best,
              average: avg,
              trend: trendVal,
            });
          } else {
            setStats({ current: null, best: null, average: null, trend: null });
          }
        } else {
          setStats({ current: null, best: null, average: null, trend: null });
        }
      } catch (err) {
        console.error('Failed to load exercise progress:', err);
        setError('Failed to load progress comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedExercise, selectedWorkoutSetId, userFilter, startDate, endDate]);

  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      {/* Header & Main Selectors */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity color="var(--primary-cyan)" size={22} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Exercise Analytics & Comparison</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Compare user performance lines & analyze weight progression over custom date periods
          </p>
        </div>

        {exercisesList.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Workout Set Selector */}
            <div style={{ minWidth: '170px' }}>
              <select
                className="form-control"
                value={selectedWorkoutSetId}
                onChange={(e) => setSelectedWorkoutSetId(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="">All Workout Sets</option>
                {workoutSetsList.map((set) => (
                  <option key={set._id} value={set._id}>
                    {set.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise Selector */}
            <div style={{ minWidth: '170px' }}>
              <select
                className="form-control"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{ fontWeight: 700, color: 'var(--primary-cyan)', borderColor: 'var(--border-glow)', fontSize: '0.875rem' }}
              >
                {exercisesList.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            {/* User Performance Dropdown (Me vs Other vs Both) */}
            <div style={{ minWidth: '190px' }}>
              <select
                className="form-control"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ fontWeight: 700, color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)', fontSize: '0.875rem' }}
              >
                <option value="both">⚡ Compare Both Users</option>
                <option value="dasun_navindu">👤 dasun_navindu</option>
                <option value="gayan_maduranga">👤 gayan_maduranga</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Date Period Filter Bar */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Calendar size={16} color="var(--primary-cyan)" />
          <span>Date Period Filter:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              className="form-control"
              value={startDate || defaultMinDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '145px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              className="form-control"
              value={endDate || defaultMaxDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '145px' }}
            />
          </div>

          {(startDate || endDate) && (
            <button onClick={handleResetDates} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {exercisesList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p>No exercise logs found yet. Create a workout set and add exercises to view progress charts!</p>
        </div>
      ) : loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p>Loading analytics & comparison...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p>No data recorded for {selectedExercise} in the selected date range.</p>
        </div>
      ) : (
        <>
          {/* Stats Summary Cards */}
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                <Target size={16} color="var(--primary-cyan)" />
                CURRENT WEIGHT
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-main)' }}>
                {stats.current !== null ? `${stats.current} kg` : '—'}
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                <Award size={16} color="var(--accent-amber)" />
                PERSONAL RECORD (BEST)
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-amber)' }}>
                {stats.best !== null ? `${stats.best} kg` : '—'}
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                {stats.trend >= 0 ? <TrendingUp size={16} color="var(--accent-emerald)" /> : <TrendingDown size={16} color="var(--accent-rose)" />}
                PROGRESS TREND
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.trend >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {stats.trend !== null ? (stats.trend > 0 ? `+${stats.trend} kg` : `${stats.trend} kg`) : '—'}
                </p>
                {stats.average !== null && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>avg: {stats.average} kg</span>}
              </div>
            </div>
          </div>

          {/* Interactive Comparison Line Chart */}
          <div style={{ width: '100%', height: 340, padding: '0.5rem 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit=" kg"
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip userFilter={userFilter} />} />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />

                {/* dasun_navindu Line (Cyan #00f2fe) */}
                {(userFilter === 'both' || userFilter === 'dasun_navindu') && (
                  <Line
                    type="monotone"
                    dataKey="dasun_navindu"
                    name="dasun_navindu (kg)"
                    stroke="#00f2fe"
                    strokeWidth={3}
                    dot={{ fill: '#00f2fe', r: 5, strokeWidth: 2, stroke: '#0b0f19' }}
                    activeDot={{ r: 8, stroke: '#38bdf8', strokeWidth: 3 }}
                    connectNulls
                  />
                )}

                {/* gayan_maduranga Line (Amber #f59e0b) */}
                {(userFilter === 'both' || userFilter === 'gayan_maduranga') && (
                  <Line
                    type="monotone"
                    dataKey="gayan_maduranga"
                    name="gayan_maduranga (kg)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#0b0f19' }}
                    activeDot={{ r: 8, stroke: '#fbbf24', strokeWidth: 3 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressChart;
