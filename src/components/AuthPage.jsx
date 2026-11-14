import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, User, Mail, AtSign, Check, Building2, ExternalLink } from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { SEED_CREDENTIALS } from '../data/mockData';

export default function AuthPage({ onOpenAdmin }) {
  const { login, signUp, profiles } = useAgreement();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [identifier, setIdentifier] = useState('@davidvance');
  const [password, setPassword] = useState('Password123!');
  
  // Sign up fields
  const [signUpRole, setSignUpRole] = useState('client');
  const [fullName, setFullName] = useState('');
  const [userTag, setUserTag] = useState('');
  const [email, setEmail] = useState('');
  const [companyOrTitle, setCompanyOrTitle] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(identifier, password);
  };

  const handleQuickLogin = (roleKey) => {
    const cred = SEED_CREDENTIALS[roleKey === 'client' ? 'hirer' : 'talent'];
    login(cred.user_tag, cred.password);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    signUp({
      name: fullName,
      email: email,
      user_tag: userTag,
      role: signUpRole,
      password: newPassword,
      company_or_title: companyOrTitle
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--bg, #FAF8FF)',
      padding: '32px 16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 14px 34px rgba(18, 34, 74, 0.08)',
        border: '1px solid var(--border, rgba(16, 24, 40, 0.08))'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: '#101828',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 16px rgba(16, 24, 40, 0.15)'
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6L7 9.5V14C7 18.2 10 22 14 23.5C18 22 21 18.2 21 14V9.5L14 6Z" fill="#0055FF"/>
              <path d="M11.5 14L13 15.5L16.5 12" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--dark, #101828)',
            fontFamily: 'Manrope, sans-serif',
            margin: '0 0 4px'
          }}>
            Kordia
          </h1>
          <p style={{
            fontSize: '12px',
            color: 'var(--muted, #5B6472)',
            margin: 0,
            letterSpacing: '0.01em'
          }}>
            Private agreements. Protected payments. Borderless work.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '22px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: 0,
              fontSize: '12px',
              fontWeight: activeTab === 'login' ? 700 : 500,
              background: activeTab === 'login' ? '#fff' : 'transparent',
              color: activeTab === 'login' ? 'var(--dark, #101828)' : '#64748B',
              cursor: 'pointer',
              boxShadow: activeTab === 'login' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            style={{
              padding: '8px 12px',
              borderRadius: '7px',
              border: 0,
              fontSize: '12px',
              fontWeight: activeTab === 'signup' ? 700 : 500,
              background: activeTab === 'signup' ? '#fff' : 'transparent',
              color: activeTab === 'signup' ? 'var(--dark, #101828)' : '#64748B',
              cursor: 'pointer',
              boxShadow: activeTab === 'signup' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN TAB */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                  User Tag or Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <AtSign size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="@davidvance or @amaraokafor"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#101828',
                      fontFamily: 'monospace',
                      outline: 'none',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Password
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Seed: <code style={{ color: 'var(--blue, #0055FF)', fontWeight: 600 }}>Password123!</code>
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#101828',
                      outline: 'none',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'var(--blue, #0055FF)',
                  color: '#fff',
                  border: 0,
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 85, 255, 0.25)',
                  marginTop: '4px'
                }}
              >
                <span>Sign In to Workspace</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Quick 1-Click Demo Login for Judges */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', fontWeight: 700 }}>
                  Demo Accounts (1-Click Instant Sign In)
                </span>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 700 }}>✓ Verified Tags</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('client')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', color: 'var(--blue, #0055FF)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '12px' }}>
                      H
                    </div>
                    <div>
                      <b style={{ fontSize: '12px', color: '#101828', display: 'block' }}>David Vance (@davidvance)</b>
                      <small style={{ color: '#64748B', fontSize: '10px' }}>Hirer · Apex Design Studio Ltd (London)</small>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--blue, #0055FF)', fontWeight: 700 }}>Sign In →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('freelancer')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '12px' }}>
                      T
                    </div>
                    <div>
                      <b style={{ fontSize: '12px', color: '#101828', display: 'block' }}>Amara Okafor (@amaraokafor)</b>
                      <small style={{ color: '#64748B', fontSize: '10px' }}>Talent · Senior Full-Stack Dev (Lagos)</small>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>Sign In →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIGN UP TAB */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                I want to join as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSignUpRole('client')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: signUpRole === 'client' ? '2px solid var(--blue, #0055FF)' : '1px solid #E2E8F0',
                    background: signUpRole === 'client' ? '#F3F5FF' : '#fff',
                    color: signUpRole === 'client' ? 'var(--blue, #0055FF)' : '#475569',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Hirer (Client)
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole('freelancer')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: signUpRole === 'freelancer' ? '2px solid var(--blue, #0055FF)' : '1px solid #E2E8F0',
                    background: signUpRole === 'freelancer' ? '#F3F5FF' : '#fff',
                    color: signUpRole === 'freelancer' ? 'var(--blue, #0055FF)' : '#475569',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Talent (Freelancer)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexis Chen"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Unique User Tag (Used to tag in agreements)
              </label>
              <input
                type="text"
                required
                value={userTag}
                onChange={(e) => setUserTag(e.target.value)}
                placeholder="@alexischen"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexis@example.com"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                {signUpRole === 'client' ? 'Company Name' : 'Professional Title'}
              </label>
              <input
                type="text"
                value={companyOrTitle}
                onChange={(e) => setCompanyOrTitle(e.target.value)}
                placeholder={signUpRole === 'client' ? 'Apex Tech Labs' : 'Frontend Engineer & UI Architect'}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create password..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'var(--blue, #0055FF)',
                color: '#fff',
                border: 0,
                padding: '11px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Register & Activate User Tag
            </button>
          </form>
        )}

        {/* Footer: Admin Portal Link */}
        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onOpenAdmin}
            style={{
              fontSize: '11px',
              color: '#64748B',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none'
            }}
          >
            <span>Protocol Node Administration (/admin) →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
