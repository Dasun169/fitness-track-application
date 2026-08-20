import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Dumbbell, Settings, LogOut, User, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        
        {/* App Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'var(--primary-gradient)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <Dumbbell size={22} color="var(--primary-btn-text)" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              GYM <span style={{ color: 'var(--primary-cyan)' }}>TRACKER</span>
            </h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Performance System
            </p>
          </div>
        </Link>

        {/* Right Nav Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-icon"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
            aria-label="Toggle Theme"
            style={{ borderRadius: '50%' }}
          >
            {theme === 'light' ? (
              <Moon size={18} color="var(--text-main)" />
            ) : (
              <Sun size={18} color="#f59e0b" />
            )}
          </button>

          {user && (
            <>
              {/* User Account Badge */}
              <div className="badge badge-cyan desktop-only" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <User size={13} />
                <span>{user.username}</span>
              </div>

              {/* Navigation Link: Settings / Dashboard */}
              {location.pathname !== '/settings' ? (
                <Link to="/settings" className="btn btn-secondary btn-sm" title="Settings">
                  <Settings size={16} />
                  <span className="desktop-only">Settings</span>
                </Link>
              ) : (
                <Link to="/" className="btn btn-secondary btn-sm" title="Dashboard">
                  <Dumbbell size={16} />
                  <span className="desktop-only">Dashboard</span>
                </Link>
              )}

              {/* Logout Button */}
              <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Log out">
                <LogOut size={16} />
                <span className="desktop-only">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
