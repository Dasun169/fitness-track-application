import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Key, ArrowLeft, Shield, CheckCircle2, AlertCircle, Lock, Sun, Moon, Palette, Check
} from 'lucide-react';

const Settings = () => {
  const { user, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'var(--text-muted)' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'var(--accent-rose)' };
    if (score === 2 || score === 3) return { score, label: 'Moderate', color: 'var(--accent-amber)' };
    return { score, label: 'Strong', color: 'var(--accent-emerald)' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setError('New password must contain both letters and numbers');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ maxWidth: '800px' }}>
        {/* Navigation back */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account & Application Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage profile details, theme appearance, and security credentials
          </p>
        </div>

        {/* Theme & Appearance Card */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Palette size={20} color="var(--primary-cyan)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Theme & Appearance</h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Choose your preferred color theme. The selection will be saved automatically for your browser session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Light Mode Option */}
            <div
              onClick={() => setTheme('light')}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'light' ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                background: 'var(--bg-glass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(2, 132, 199, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                  <Sun size={20} color="var(--primary-cyan)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Light View (Default)</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean & bright UI</span>
                </div>
              </div>
              {theme === 'light' && <Check size={18} color="var(--primary-cyan)" />}
            </div>

            {/* Dark Mode Option */}
            <div
              onClick={() => setTheme('dark')}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'dark' ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                background: 'var(--bg-glass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                  <Moon size={20} color="#f59e0b" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Dark View</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sleek dark mode</span>
                </div>
              </div>
              {theme === 'dark' && <Check size={18} color="var(--primary-cyan)" />}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={20} color="var(--primary-cyan)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Profile Details</h2>
          </div>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username (Read-Only)</label>
              <input
                type="text"
                className="form-control"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.8, cursor: 'not-allowed', fontWeight: 700 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Member Since</label>
              <input
                type="text"
                className="form-control"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                disabled
                style={{ opacity: 0.8, cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Security / Password Change Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={20} color="var(--primary-cyan)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security & Password</h2>
          </div>

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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 8 chars (letters & numbers)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Password Strength:</span>
                    <strong style={{ color: strength.color }}>{strength.label}</strong>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(strength.score / 4) * 100}%`,
                      height: '100%',
                      background: strength.color,
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
