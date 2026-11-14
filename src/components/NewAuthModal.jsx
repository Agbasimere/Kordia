import React, { useState } from 'react';
import { 
  X, Check, ArrowRight, ShieldCheck, UserCheck, Briefcase, 
  Building2, Smartphone, Landmark, Key, Star
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import KordiaLogo from './KordiaLogo';

export default function NewAuthModal({ isOpen, onClose, initialMode = 'signin', initialRole = 'freelancer' }) {
  const { login, signUp } = useAgreement();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [role, setRole] = useState(initialRole); // 'freelancer' (Talent) | 'client' (Hirer)

  // Sign In inputs
  const [loginIdentifier, setLoginIdentifier] = useState('@amaraokafor');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  // Sign Up inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userTag, setUserTag] = useState('');
  const [password, setPassword] = useState('Password123!');
  
  // Talent specific: selects work title & Pollar Stellar embedded wallet
  const [workTitle, setWorkTitle] = useState('Graphic Designer');
  const [customTitle, setCustomTitle] = useState('');
  const [stellarWallet, setStellarWallet] = useState('GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU');

  // Hirer specific: company or private hirer
  const [hirerType, setHirerType] = useState('company'); // 'company' | 'private'
  const [companyName, setCompanyName] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!userTag || userTag.startsWith('@')) {
      const suggested = `@${val.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      setUserTag(suggested);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(loginIdentifier, loginPassword);
    onClose();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const finalTitle = role === 'freelancer' 
      ? (workTitle === 'Other' ? customTitle : workTitle)
      : (hirerType === 'company' ? (companyName || 'Company Employer') : 'Private Hirer');

    signUp({
      name,
      email,
      user_tag: userTag,
      role,
      work_title: finalTitle,
      password,
      stellar_wallet: stellarWallet
    });
    onClose();
  };

  const handleQuickSeed = (target) => {
    if (target === 'talent') {
      login('@amaraokafor', 'Password123!');
    } else {
      login('@davidvance', 'Password123!');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <KordiaLogo size={28} />
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs ("Sign In" | "Create Account") */}
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{
                border: 0,
                background: mode === 'signin' ? '#FFFFFF' : 'transparent',
                color: mode === 'signin' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                border: 0,
                background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '12px',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
          
          {/* ========================================================
              VIEW 1: SIGN IN FORM
             ======================================================== */}
          {mode === 'signin' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  User Tag or Email
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="@amaraokafor or email"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password123!"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Sign In to Workspace
              </button>

              {/* 1-Click Fast Fill Cards */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <small style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.06em' }}>
                  1-Click Fast Login
                </small>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickSeed('talent')}
                    style={{
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <b style={{ color: '#0F172A', display: 'block' }}>Talent (@amaraokafor)</b>
                    <small style={{ color: '#64748B' }}>Senior Engineer</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSeed('hirer')}
                    style={{
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <b style={{ color: '#0F172A', display: 'block' }}>Hirer (@davidvance)</b>
                    <small style={{ color: '#64748B' }}>Apex Design Ltd</small>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================
              VIEW 2: CREATE ACCOUNT FORM (MATCHING USER SPEC)
             ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit}>
              
              {/* Role Toggle: Talent vs Hirer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  style={{
                    border: `1.5px solid ${role === 'freelancer' ? '#0F172A' : '#E2E8F0'}`,
                    background: role === 'freelancer' ? '#F1F5F9' : '#FFFFFF',
                    borderRadius: '10px',
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: role === 'freelancer' ? '#0F172A' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Join as Talent
                </button>

                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    border: `1.5px solid ${role === 'client' ? '#0F172A' : '#E2E8F0'}`,
                    background: role === 'client' ? '#F1F5F9' : '#FFFFFF',
                    borderRadius: '10px',
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: role === 'client' ? '#0F172A' : '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Join as Hirer
                </button>
              </div>

              {/* Name & Tag */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Chidi Okafor"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Unique Tag</label>
                  <input
                    type="text"
                    required
                    value={userTag}
                    onChange={(e) => setUserTag(e.target.value)}
                    placeholder="@tag"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@work.com"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* TALENT FLOW: Selects Work Title & Links Pollar Stellar Wallet */}
              {role === 'freelancer' && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                      Select Your Work Title
                    </label>
                    <select
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                      style={{ width: '100%', padding: '7px 9px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '6px', background: '#FFFFFF' }}
                    >
                      <option value="Graphic Designer">Graphic Designer</option>
                      <option value="Senior Full-Stack Engineer">Senior Full-Stack Engineer</option>
                      <option value="Smart Contract Auditor">Smart Contract Auditor</option>
                      <option value="UI/UX Product Designer">UI/UX Product Designer</option>
                      <option value="Mobile App Developer">Mobile App Developer</option>
                      <option value="Technical Writer">Technical Writer</option>
                      <option value="Other">Other Custom Title</option>
                    </select>
                  </div>

                  {workTitle === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify your title..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      style={{ width: '100%', padding: '6px 9px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '6px', marginBottom: '8px' }}
                    />
                  )}

                  {/* Pollar Stellar Wallet Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                      Pollar Stellar Wallet Address
                    </label>
                    <input
                      type="text"
                      placeholder="G... (56-character Stellar public key)"
                      value={stellarWallet}
                      onChange={(e) => setStellarWallet(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                    />
                    <small style={{ display: 'block', color: '#64748B', fontSize: '10px', marginTop: '3px' }}>
                      USDC milestone payouts will settle directly to this Stellar wallet.
                    </small>
                  </div>
                </div>
              )}

              {/* HIRER FLOW (Per User Prompt): Company vs Private Hirer */}
              {role === 'client' && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Hirer Type
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="radio" 
                        name="htype" 
                        checked={hirerType === 'company'} 
                        onChange={() => setHirerType('company')} 
                      />
                      <span>Company / Agency</span>
                    </label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="radio" 
                        name="htype" 
                        checked={hirerType === 'private'} 
                        onChange={() => setHirerType('private')} 
                      />
                      <span>Private Hirer</span>
                    </label>
                  </div>

                  {hirerType === 'company' && (
                    <input
                      type="text"
                      placeholder="Company Name (e.g. Apex Design Studio Ltd)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '6px 9px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                    />
                  )}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Create Account &amp; Claim {userTag || 'Tag'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
