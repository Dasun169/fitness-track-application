import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Dumbbell, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('dasun_navindu');
  const [password, setPassword] = useState('Password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please select a user and enter a password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (selectedUser) => {
    setUsername(selectedUser);
    setPassword('Password123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      position: 'relative',
    }}>
      {/* Theme Toggle Button on Login Screen */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          style={{ borderRadius: '50%' }}
        >
          {theme === 'light' ? <Moon size={18} color="var(--text-main)" /> : <Sun size={18} color="#f59e0b" />}
        </button>
      </div>

      <div className="glass-card" style={{ width: '100%', maxWidth: '430px', padding: '2.25rem 1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--primary-gradient)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.15rem auto',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <Dumbbell size={30} color="var(--primary-btn-text)" strokeWidth={2.5} />
          </div>
          
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            GYM TRACKER
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Authorized User Authentication Portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username-select">Select User Account</label>
            <div style={{ position: 'relative' }}>
              <select
                id="username-select"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              >
                <option value="dasun_navindu">dasun_navindu</option>
                <option value="gayan_maduranga">gayan_maduranga</option>
              </select>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick User Selector Help Chips */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.15rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} color="var(--primary-cyan)" />
            <span>Pre-configured Accounts (Default Pass: Password123)</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickSelect('dasun_navindu')}
              className={`badge ${username === 'dasun_navindu' ? 'badge-cyan' : 'badge-amber'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              dasun_navindu
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('gayan_maduranga')}
              className={`badge ${username === 'gayan_maduranga' ? 'badge-cyan' : 'badge-amber'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              gayan_maduranga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
