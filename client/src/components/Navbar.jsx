import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Settings, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 242, 254, 0.3)'
          }}>
            <Dumbbell size={24} color="#0b0f19" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              GYM <span style={{ color: 'var(--primary-cyan)' }}>TRACKER</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Personal Performance System
            </p>
          </div>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="badge badge-cyan" style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}>
              <User size={14} />
              <span>{user.username}</span>
            </div>

            {location.pathname !== '/settings' ? (
              <Link to="/settings" className="btn btn-secondary btn-sm">
                <Settings size={16} />
                <span className="desktop-only">Settings</span>
              </Link>
            ) : (
              <Link to="/" className="btn btn-secondary btn-sm">
                <Dumbbell size={16} />
                <span>Dashboard</span>
              </Link>
            )}

            <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Log out">
              <LogOut size={16} />
              <span className="desktop-only">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
