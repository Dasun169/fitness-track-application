import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, Dumbbell } from 'lucide-react';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          boxShadow: 'var(--shadow-modal)',
          minWidth: '200px',
        }}
      >
        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
          🏋️ {label}
        </p>

        {payload.map((entry) => (
          <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.3rem' }}>
            <span style={{ color: entry.fill, fontWeight: 700, fontSize: '0.85rem' }}>
              {entry.name}:
            </span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {entry.value !== undefined && entry.value !== null ? `${entry.value} kg (Avg)` : '0 kg'}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const WorkoutBarChart = () => {
  const { theme } = useTheme();

  const [workoutSetsList, setWorkoutSetsList] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch list of workout sets for dropdown
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await api.get('/workouts');
        setWorkoutSetsList(res.data);
        if (res.data.length > 0) {
          setSelectedSetId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load workout sets for bar chart:', err);
      }
    };
    fetchSets();
  }, []);

  // Fetch bar chart data whenever selected set changes
  useEffect(() => {
    const fetchBarData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/progress/bar-chart?';
        if (selectedSetId) {
          url += `workoutSetId=${selectedSetId}`;
        }
        const res = await api.get(url);
        setBarData(res.data);
      } catch (err) {
        console.error('Failed to fetch bar chart data:', err);
        setError('Failed to load bar chart comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchBarData();
  }, [selectedSetId]);

  const isLight = theme === 'light';

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      {/* Header & Selector */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BarChart3 color="var(--primary-cyan)" size={22} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Exercise Average Weight Comparison (Bar Chart)</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Overall average weight comparison (kg) per workout type for user and friend
          </p>
        </div>

        {workoutSetsList.length > 0 && (
          <div style={{ minWidth: '220px', width: '100%', maxWidth: '280px' }}>
            <label className="form-label" style={{ marginBottom: '0.25rem', fontSize: '0.8rem' }}>Select Workout Set:</label>
            <select
              className="form-control"
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-cyan)', borderColor: 'var(--border-glow)' }}
            >
              <option value="">All Workout Sets</option>
              {workoutSetsList.map((set) => (
                <option key={set._id} value={set._id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="center-spinner">
          <div className="spinner"></div>
          <p>Loading average weight comparison...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : barData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Dumbbell size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
          <p>No exercise workout types added to this set yet.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 380, padding: '0.5rem 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap="15%" barGap={4} margin={{ top: 25, right: 20, left: -5, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'} />
              <XAxis
                dataKey="exerciseName"
                stroke={isLight ? '#475569' : '#64748b'}
                tick={{ fill: isLight ? '#334155' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
                dy={5}
              />
              <YAxis
                stroke={isLight ? '#475569' : '#64748b'}
                tick={{ fill: isLight ? '#334155' : '#94a3b8', fontSize: 11 }}
                unit=" kg"
                domain={[0, (dataMax) => (dataMax > 0 ? Math.ceil(dataMax * 1.25) : 50)]}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)' }} />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />

              <Bar
                dataKey="dasun_navindu"
                name="dasun_navindu (Avg kg)"
                fill={isLight ? '#0284c7' : '#00f2fe'}
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              >
                <LabelList
                  dataKey="dasun_navindu"
                  position="top"
                  formatter={(val) => (val > 0 ? `${val} kg` : '0 kg')}
                  fill={isLight ? '#0f172a' : '#f8fafc'}
                  fontSize={10}
                  fontWeight={700}
                />
              </Bar>

              <Bar
                dataKey="gayan_maduranga"
                name="gayan_maduranga (Avg kg)"
                fill={isLight ? '#d97706' : '#f59e0b'}
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              >
                <LabelList
                  dataKey="gayan_maduranga"
                  position="top"
                  formatter={(val) => (val > 0 ? `${val} kg` : '0 kg')}
                  fill={isLight ? '#0f172a' : '#f8fafc'}
                  fontSize={10}
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WorkoutBarChart;
