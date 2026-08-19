import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  ArrowLeft, Edit3, Save, X, Plus, Trash2, Calendar,
  Dumbbell, CheckCircle2, AlertCircle, Eye, Columns, Rows
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WorkoutSetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workoutSet, setWorkoutSet] = useState(null);
  const [dates, setDates] = useState([]);
  const [exerciseNames, setExerciseNames] = useState([]);
  const [gridState, setGridState] = useState({}); // { [exerciseName]: { [dateStr]: weight } }
  
  const [isEditMode, setIsEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals for adding Date column or Exercise row
  const [isAddDateOpen, setIsAddDateOpen] = useState(false);
  const [newDateInput, setNewDateInput] = useState(new Date().toISOString().split('T')[0]);

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [newExerciseInput, setNewExerciseInput] = useState('');

  // Fetch Workout Set Matrix Data
  const fetchMatrixData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/workouts/${id}/exercises`);
      const { workoutSet: setMeta, dates: dList, exerciseNames: eList, matrix } = response.data;
      
      setWorkoutSet(setMeta);
      setDates(dList);
      setExerciseNames(eList);

      // Build editable local grid state for current logged-in user: { [exName]: { [dateStr]: weight } }
      const initialGrid = {};
      eList.forEach((name) => {
        initialGrid[name] = {};
        dList.forEach((dStr) => {
          initialGrid[name][dStr] = matrix[name] && matrix[name][dStr] ? matrix[name][dStr].weight : '';
        });
      });

      setGridState(initialGrid);
    } catch (err) {
      console.error('Failed to load workout matrix:', err);
      setError(err.message || 'Failed to load workout set grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixData();
  }, [id]);

  // Handle cell weight change
  const handleCellChange = (exName, dateStr, val) => {
    setGridState((prev) => ({
      ...prev,
      [exName]: {
        ...prev[exName],
        [dateStr]: val,
      },
    }));
  };

  // Add new Gym Date Column
  const handleAddDateColumn = async (e) => {
    e.preventDefault();
    if (!newDateInput) return;

    if (!dates.includes(newDateInput)) {
      const updatedDates = [...dates, newDateInput].sort();
      setDates(updatedDates);

      // Initialize column entries in grid state
      setGridState((prev) => {
        const updatedGrid = { ...prev };
        exerciseNames.forEach((exName) => {
          if (!updatedGrid[exName]) updatedGrid[exName] = {};
          if (updatedGrid[exName][newDateInput] === undefined) {
            updatedGrid[exName][newDateInput] = '';
          }
        });
        return updatedGrid;
      });

      // If we have at least one exercise row, post dummy payload so the new date column is stored in MongoDB
      if (exerciseNames.length > 0) {
        try {
          await api.post(`/workouts/${id}/exercises`, {
            name: exerciseNames[0],
            weight: 0,
            date: newDateInput,
          });
        } catch (err) {
          console.error('Failed to save date placeholder:', err);
        }
      }
    }

    setIsAddDateOpen(false);
    setSuccessMsg(`Added new Gym Date column: ${newDateInput}`);
  };

  // Add new Exercise Row
  const handleAddExerciseRow = async (e) => {
    e.preventDefault();
    const cleanName = newExerciseInput.trim();
    if (!cleanName) return;

    if (!exerciseNames.includes(cleanName)) {
      setExerciseNames((prev) => [...prev, cleanName].sort());
      setGridState((prev) => {
        const rowObj = {};
        dates.forEach((d) => {
          rowObj[d] = '';
        });
        return { ...prev, [cleanName]: rowObj };
      });

      // If we have at least one date, post dummy payload so the new exercise row is stored in MongoDB
      const targetDate = dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0];
      try {
        await api.post(`/workouts/${id}/exercises`, {
          name: cleanName,
          weight: 0,
          date: targetDate,
        });
      } catch (err) {
        console.error('Failed to save exercise row placeholder:', err);
      }
    }

    setNewExerciseInput('');
    setIsAddExerciseOpen(false);
    setSuccessMsg(`Added new Exercise row: "${cleanName}"`);
  };

  // Delete Date Column
  const handleDeleteDateColumn = async (dateStr) => {
    if (!window.confirm(`Are you sure you want to remove the date column ${dateStr}?`)) return;

    try {
      await api.delete(`/workouts/${id}/date/${dateStr}`);
      setDates((prev) => prev.filter((d) => d !== dateStr));

      setGridState((prev) => {
        const newGrid = { ...prev };
        Object.keys(newGrid).forEach((exName) => {
          delete newGrid[exName][dateStr];
        });
        return newGrid;
      });
      setSuccessMsg(`Deleted date column ${dateStr}`);
    } catch (err) {
      setError(err.message || 'Failed to delete date column');
    }
  };

  // Delete Exercise Row
  const handleDeleteExerciseRow = async (exName) => {
    if (!window.confirm(`Are you sure you want to delete all logs for exercise "${exName}"?`)) return;

    try {
      await api.delete(`/workouts/${id}/exercise-name/${encodeURIComponent(exName)}`);
      setExerciseNames((prev) => prev.filter((name) => name !== exName));
      setGridState((prev) => {
        const newGrid = { ...prev };
        delete newGrid[exName];
        return newGrid;
      });
      setSuccessMsg(`Deleted exercise row "${exName}"`);
    } catch (err) {
      setError(err.message || 'Failed to delete exercise row');
    }
  };

  // Save entire Matrix Grid to Backend MongoDB for logged-in user
  const handleSaveMatrix = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const updates = [];
      exerciseNames.forEach((exName) => {
        dates.forEach((dStr) => {
          const val = gridState[exName] && gridState[exName][dStr];
          if (val !== undefined && val !== null && val !== '') {
            updates.push({
              name: exName,
              date: dStr,
              weight: Number(val),
            });
          }
        });
      });

      await api.post(`/workouts/${id}/matrix-batch`, { updates });
      await fetchMatrixData();

      setSuccessMsg('Your workout weights saved successfully!');
    } catch (err) {
      console.error('Failed to save matrix grid:', err);
      setError(err.message || 'Failed to save matrix changes');
    } finally {
      setSaving(false);
    }
  };

  // Format date header concisely as MM/DD (e.g., "08/19")
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`; // "MM/DD"
    }
    const d = new Date(dateStr + 'T00:00:00');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Navigation & Actions Top Bar */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          {workoutSet && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setIsAddDateOpen(true)} className="btn btn-secondary btn-sm">
                <Columns size={16} color="var(--primary-cyan)" />
                <span>+ Add Date Column</span>
              </button>

              <button onClick={() => setIsAddExerciseOpen(true)} className="btn btn-secondary btn-sm">
                <Rows size={16} color="var(--accent-amber)" />
                <span>+ Add Exercise Row</span>
              </button>

              <button onClick={() => setIsEditMode(!isEditMode)} className="btn btn-secondary btn-sm">
                {isEditMode ? <Eye size={16} /> : <Edit3 size={16} />}
                <span>{isEditMode ? 'View Mode' : 'Edit Mode'}</span>
              </button>

              <button onClick={handleSaveMatrix} className="btn btn-primary btn-sm" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving Grid...' : 'Save All Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="center-spinner">
            <div className="spinner"></div>
            <p>Loading Matrix Grid Layout...</p>
          </div>
        ) : !workoutSet ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Workout set not found.</p>
          </div>
        ) : (
          <div>
            {/* Set Overview Header Card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-cyan">
                      <Calendar size={13} />
                      {MONTH_NAMES[workoutSet.month - 1]} {workoutSet.year}
                    </span>
                    <span className={`badge ${isEditMode ? 'badge-amber' : 'badge-emerald'}`}>
                      {isEditMode ? 'Matrix Editing Mode' : 'Read-Only View'}
                    </span>
                    <span className="badge badge-cyan" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      Shared Routine Template
                    </span>
                  </div>

                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{workoutSet.name}</h1>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Gym Days: </span>
                    <strong style={{ color: 'var(--primary-cyan)' }}>{dates.length} days</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Exercise Rows: </span>
                    <strong style={{ color: 'var(--accent-amber)' }}>{exerciseNames.length} rows</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Table Grid Container */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Dumbbell size={22} color="var(--primary-cyan)" />
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Exercise Matrix Grid</h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Compact Format (MM/DD) • Shared Rows & Dates • Personal Weights per User
                </p>
              </div>

              {exerciseNames.length === 0 && dates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: '1rem', fontSize: '1rem' }}>No exercise rows or gym dates added to this workout set yet.</p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={() => setIsAddExerciseOpen(true)} className="btn btn-primary btn-sm">
                      <Plus size={16} />
                      <span>Add Exercise Row</span>
                    </button>
                    <button onClick={() => setIsAddDateOpen(true)} className="btn btn-secondary btn-sm">
                      <Plus size={16} />
                      <span>Add Date Column</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '180px', minWidth: '160px', background: 'rgba(15, 23, 42, 0.95)', position: 'sticky', left: 0, zIndex: 5 }}>
                          Exercise Name
                        </th>
                        {dates.map((dStr) => (
                          <th key={dStr} style={{ textAlign: 'center', width: '80px', minWidth: '70px', padding: '0.5rem 0.25rem' }} title={dStr}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                              <span style={{ color: 'var(--primary-cyan)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>
                                {formatDateHeader(dStr)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteDateColumn(dStr)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '1px' }}
                                title={`Delete column ${dStr}`}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th style={{ width: '60px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setIsAddDateOpen(true)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                            title="Add new Date column"
                          >
                            + Date
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseNames.map((exName) => (
                        <tr key={exName}>
                          {/* Row Header: Exercise Name */}
                          <td style={{ fontWeight: 700, color: 'var(--text-main)', background: 'rgba(15, 23, 42, 0.85)', position: 'sticky', left: 0, zIndex: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{exName}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteExerciseRow(exName)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                                title={`Delete exercise row "${exName}"`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>

                          {/* Matrix Cells: Weight (kg) per Date Column */}
                          {dates.map((dStr) => {
                            const val = gridState[exName] ? gridState[exName][dStr] : '';

                            return (
                              <td key={`${exName}-${dStr}`} style={{ textAlign: 'center', padding: '0.4rem 0.2rem' }}>
                                {isEditMode ? (
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    placeholder="—"
                                    className="form-control"
                                    value={val}
                                    onChange={(e) => handleCellChange(exName, dStr, e.target.value)}
                                    style={{
                                      textAlign: 'center',
                                      padding: '0.35rem 0.15rem',
                                      fontSize: '0.875rem',
                                      fontWeight: 700,
                                      width: '65px',
                                      borderColor: val ? 'var(--primary-cyan)' : 'var(--border-color)',
                                      background: val ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.8)',
                                      borderRadius: '6px',
                                    }}
                                  />
                                ) : (
                                  val ? (
                                    <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '0.25rem 0.45rem' }}>
                                      {val} kg
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>—</span>
                                  )
                                )}
                              </td>
                            );
                          })}

                          <td style={{ textAlign: 'center' }}></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Quick Row & Column Inserter */}
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setIsAddExerciseOpen(true)} className="btn btn-secondary btn-sm">
                    <Plus size={16} color="var(--accent-amber)" />
                    <span>+ Add Exercise Row</span>
                  </button>

                  <button onClick={() => setIsAddDateOpen(true)} className="btn btn-secondary btn-sm">
                    <Plus size={16} color="var(--primary-cyan)" />
                    <span>+ Add Gym Date Column</span>
                  </button>
                </div>

                <button onClick={handleSaveMatrix} className="btn btn-primary" disabled={saving}>
                  <Save size={18} />
                  <span>{saving ? 'Saving Changes...' : 'Save All Grid Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Gym Date Column */}
        {isAddDateOpen && (
          <div className="modal-overlay" onClick={() => setIsAddDateOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Gym Date Column</h3>
                <button onClick={() => setIsAddDateOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDateColumn}>
                <div className="form-group">
                  <label className="form-label">Select Workout Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsAddDateOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Column
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Exercise Row */}
        {isAddExerciseOpen && (
          <div className="modal-overlay" onClick={() => setIsAddExerciseOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Exercise Row</h3>
                <button onClick={() => setIsAddExerciseOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExerciseRow}>
                <div className="form-group">
                  <label className="form-label">Exercise Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Scout, Bench Press, Bicep Curl"
                    value={newExerciseInput}
                    onChange={(e) => setNewExerciseInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsAddExerciseOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Exercise Row
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutSetEditor;
