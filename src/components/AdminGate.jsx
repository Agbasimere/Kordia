import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, ArrowLeft, Check, Database, AlertCircle } from 'lucide-react';
import AdminDashboardView from './AdminDashboardView';
import { SEED_CREDENTIALS } from '../data/mockData';

export default function AdminGate({ onReturnToApp }) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('kordia_admin_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === SEED_CREDENTIALS.admin.password) {
      setIsUnlocked(true);
      setErrorMsg('');
      try {
        sessionStorage.setItem('kordia_admin_unlocked', 'true');
      } catch (e) {}
    } else {
      setErrorMsg('Invalid admin security key. Use seed pass: AdminSecure2026!');
    }
  };

  const handleQuickFill = () => {
    setPassword(SEED_CREDENTIALS.admin.password);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('kordia_admin_unlocked');
    } catch (e) {}
  };

  if (isUnlocked) {
    return <AdminDashboardView onLock={handleLock} onReturnToApp={onReturnToApp} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #0A0F1D 0%, #101828 100%)',
      padding: '24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        
        {/* Header Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,85,255,0.1)', color: '#0055FF', display: 'grid', placeItems: 'center' }}>
            <Lock size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#101828', fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
              Platform Admin Security Gate
            </h2>
            <small style={{ color: '#64748B', fontSize: '11px' }}>
              Direct access restricted to protocol operators
            </small>
          </div>
        </div>

        {/* Seeded Credentials Banner */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '11px',
          color: '#334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong style={{ color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '10px' }}>
              Seeded Admin Credentials
            </strong>
            <button
              type="button"
              onClick={handleQuickFill}
              style={{
                fontSize: '10px',
                color: '#0055FF',
                background: '#F0F7FF',
                border: '1px solid #BAE6FD',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Autofill Pass
            </button>
          </div>
          <div style={{ fontFamily: 'monospace', lineHeight: 1.6 }}>
            <div>Admin Tag: <strong style={{ color: '#0055FF' }}>@admin</strong></div>
            <div>Admin Email: <span>admin@kordia.work</span></div>
            <div>Seed Password: <code style={{ background: '#E2E8F0', padding: '1px 5px', borderRadius: '3px' }}>AdminSecure2026!</code></div>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Admin Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: errorMsg ? '1px solid #EF4444' : '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {errorMsg && (
              <small style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                {errorMsg}
              </small>
            )}
          </div>

          <button
            type="submit"
            style={{
              background: '#0055FF',
              color: '#fff',
              border: 0,
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 85, 255, 0.25)'
            }}
          >
            <span>Unlock Admin Console</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onReturnToApp}
            style={{
              fontSize: '12px',
              color: '#64748B',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={13} />
            <span>Return to User Workspaces</span>
          </button>
        </div>

      </div>
    </div>
  );
}
