import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import WorkoutCard from '../components/WorkoutCard';
import ProgressChart from '../components/ProgressChart';
import api from '../services/api';
import { Plus, BarChart2, Calendar, AlertCircle, Dumbbell, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Home = () => {
  const [workoutSets, setWorkoutSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProgress, setShowProgress] = useState(true);

  // New Workout Set Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newName, setNewName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch user's workout sets
  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workouts');
      setWorkoutSets(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching workout sets:', err);
      setError(err.message || 'Failed to load workout sets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Update default name when month/year changes
  useEffect(() => {
    const monthName = MONTH_NAMES[newMonth - 1] || '';
    setNewName(`${monthName} ${newYear} Workout`);
  }, [newMonth, newYear]);

  // Create Workout Set submit handler
  const handleCreateSet = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreateLoading(true);
    try {
      await api.post('/workouts', {
        month: Number(newMonth),
        year: Number(newYear),
        name: newName.trim(),
      });
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (err) {
      alert(err.message || 'Failed to create workout set');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete Workout Set handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/workouts/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchWorkouts();
    } catch (err) {
      alert(err.message || 'Failed to delete workout set');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Dashboard Header Banner */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>DASHBOARD OVERVIEW</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Workout Performance Tracker</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Manage monthly training blocks & analyze exercise progression over time
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="btn btn-secondary"
            >
              <BarChart2 size={18} color="var(--primary-cyan)" />
              <span>{showProgress ? 'Hide Analytics' : 'Show Analytics'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              <span>New Workout Set</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Workout Sets Grid Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dumbbell size={20} color="var(--primary-cyan)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Monthly Workout Sets</h2>
              <span className="badge badge-cyan" style={{ marginLeft: '0.5rem' }}>{workoutSets.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="center-spinner">
              <div className="spinner"></div>
              <p>Fetching workout sets...</p>
            </div>
          ) : workoutSets.length === 0 ? (
            <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <Calendar size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Workout Sets Created Yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                Start tracking your monthly gym routines by adding your first workout set!
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                <Plus size={18} />
                <span>Create Workout Set</span>
              </button>
            </div>
          ) : (
            <div className="grid-4">
              {workoutSets.map((set) => (
                <WorkoutCard
                  key={set._id}
                  workoutSet={set}
                  onDelete={(id, name) => setDeleteTarget({ id, name })}
                />
              ))}
            </div>
          )}
        </section>

        {/* Collapsable Progress Section */}
        {showProgress && <ProgressChart />}

        {/* Create Workout Set Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Workout Set</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSet}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select
                      className="form-control"
                      value={newMonth}
                      onChange={(e) => setNewMonth(Number(e.target.value))}
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {idx + 1} - {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newYear}
                      min="2020"
                      max="2035"
                      onChange={(e) => setNewYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Workout Set Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. January 2024 Strength Training"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create Set'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fda4af' }}>
                Confirm Deletion
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? All logged exercises within this workout set will be permanently removed.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="btn btn-danger"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Set'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
