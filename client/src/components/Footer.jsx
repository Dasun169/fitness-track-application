import React from 'react';
import { Dumbbell, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      marginTop: 'auto',
      padding: '1.25rem 1.5rem',
      color: 'var(--text-muted)',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Dumbbell size={16} color="var(--primary-cyan)" />
          <span style={{ fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>GYM TRACKER</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.25rem' }}>• Personal Performance System</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          © {new Date().getFullYear()} GYM TRACKER. All rights reserved for <strong style={{ color: 'var(--primary-cyan)' }}>Dasun Navindu</strong>.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
