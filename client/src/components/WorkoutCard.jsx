import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Trash2 } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WorkoutCard = ({ workoutSet, onDelete }) => {
  const monthName = MONTH_NAMES[workoutSet.month - 1] || `Month ${workoutSet.month}`;

  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="badge badge-cyan">
            <Calendar size={13} />
            {monthName} {workoutSet.year}
          </span>
          <button
            onClick={() => onDelete(workoutSet._id, workoutSet.name)}
            className="btn btn-sm"
            style={{ background: 'transparent', color: 'var(--text-dim)', padding: '0.25rem' }}
            title="Delete workout set"
          >
            <Trash2 size={16} hoverColor="var(--accent-rose)" />
          </button>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {workoutSet.name}
        </h3>
        
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Created: {new Date(workoutSet.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/workout/${workoutSet._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
          <span>Manage Exercises</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default WorkoutCard;
