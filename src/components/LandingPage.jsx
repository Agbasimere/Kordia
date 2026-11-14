import React from 'react';
import { ArrowRight } from 'lucide-react';
import KordiaLogo from './KordiaLogo';
import { useAgreement } from '../context/AgreementContext';

export default function LandingPage({ onOpenAuth, onLaunchDemo }) {
  const { login } = useAgreement();

  const handleQuickDemo = (role) => {
    if (role === 'hirer') {
      login('@davidvance', 'Password123!');
    } else {
      login('@amaraokafor', 'Password123!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif" }}>
      
      {/* Top Navigation Bar */}
      <header style={{
        height: '76px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 min(5vw, 64px)',
        position: 'sticky',
        top: 0,
        background: '#FFFFFF',
        zIndex: 50
      }}>
        {/* Brand Logo */}
        <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <KordiaLogo size={32} />
        </div>

        {/* Auth CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onOpenAuth('signin')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="hover:bg-slate-100"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: 0,
              background: '#0F172A',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.15s ease'
            }}
            className="hover:bg-slate-800"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ flex: 1, padding: '72px 24px 90px', textAlign: 'center', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
          
          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 62px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: '#0F172A',
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            margin: '0 0 22px'
          }}>
            Your Trusted Escrow<br />
            for Secure Global Work,<br />
            <span style={{ color: '#0F172A' }}>
              Built Onchain.
            </span>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            lineHeight: 1.6,
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 36px',
            fontWeight: 400
          }}>
            Work with confidence, wherever you are. Kordia helps clients and freelancers create secure agreements, protect payments, and collaborate globally.
          </p>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              style={{
                padding: '14px 28px',
                borderRadius: '999px',
                border: 0,
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.2)',
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-slate-800"
            >
              <span>Create an Agreement</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              style={{
                padding: '14px 26px',
                borderRadius: '999px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-slate-100"
            >
              <span>Sign In to Account</span>
            </button>
          </div>

          {/* Quick 1-Click Interactive Demo Sandbox Access */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '18px 24px',
            maxWidth: '640px',
            margin: '0 auto',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
          }}>
            <small style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              ⚡ 1-Click Interactive Speedrun Test
            </small>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('talent')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="hover:border-slate-800 transition"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', color: '#0F172A', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px' }}>
                  T
                </div>
                <div>
                  <b style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>Talent Dashboard</b>
                  <small style={{ fontSize: '10px', color: '#64748B' }}>@amaraokafor · Stellar USDC</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('hirer')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="hover:border-slate-800 transition"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: '12px' }}>
                  H
                </div>
                <div>
                  <b style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>Hirer Dashboard</b>
                  <small style={{ fontSize: '10px', color: '#64748B' }}>@davidvance · Escrow Funding</small>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '24px min(5vw, 64px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: '#FFFFFF' }}>
        <KordiaLogo size={24} />
        <small style={{ color: '#64748B', fontSize: '12px' }}>
          © 2026 Kordia Protocol. Built for private peer agreements, protected escrow vault, and instant Pollar Stellar settlement.
        </small>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#/admin" style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, textDecoration: 'none' }}>
            Protocol Node (/admin)
          </a>
        </div>
      </footer>

    </div>
  );
}
