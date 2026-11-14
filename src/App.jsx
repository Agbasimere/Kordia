import React, { useState, useEffect } from 'react';
import { AgreementProvider, useAgreement } from './context/AgreementContext';
import DashboardView from './components/DashboardView';
import CreateAgreementView from './components/CreateAgreementView';
import AgreementDetailsView from './components/AgreementDetailsView';
import SubmitReviewView from './components/SubmitReviewView';
import PaymentSettlementView from './components/PaymentSettlementView';
import PrivacyAuthorizationView from './components/PrivacyAuthorizationView';
import AdminGate from './components/AdminGate';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Scale, 
  Landmark, 
  Truck, 
  ClipboardList, 
  LogOut, 
  ShieldCheck, 
  Plus, 
  Database,
  CheckCircle2,
  AlertCircle,
  Key
} from 'lucide-react';
import { SEED_CREDENTIALS } from './data/mockData';

function UserAppContent({ onOpenAdmin }) {
  const { 
    activeView, 
    setActiveView, 
    toastMessage, 
    resetDemoData,
    currentRole,
    setCurrentRole,
    getCurrentUser,
    verifyUserEmail,
    logout,
    agreements 
  } = useAgreement();

  const currentUser = getCurrentUser();

  // Pending payouts counter
  const pendingPayoutsCount = agreements.filter(a => a.status === 'Released' && a.payout?.status !== 'PAYOUT_COMPLETED').length;

  return (
    <div className="adminShell">
      <a className="skipLink" href="#main-content">
        Skip to content
      </a>

      {/* Sleek Fixed Sidebar matching the corporate HTML design */}
      <aside>
        <div 
          className="brand" 
          onClick={() => setActiveView('dashboard')} 
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="8" fill="#101828"/>
            <path d="M14 6L7 9.5V14C7 18.2 10 22 14 23.5C18 22 21 18.2 21 14V9.5L14 6Z" fill="#0055FF"/>
            <path d="M11.5 14L13 15.5L16.5 12" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            Kordia
          </span>
        </div>

        <a 
          className={activeView === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveView('dashboard')}
          href="#dashboard"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </a>

        <a 
          className={activeView === 'details' ? 'active' : ''} 
          onClick={() => setActiveView('details')}
          href="#agreements"
        >
          <Receipt size={16} />
          My Agreements
        </a>

        <a 
          className={activeView === 'create' ? 'active' : ''} 
          onClick={() => setActiveView('create')}
          href="#create"
        >
          <Plus size={16} />
          Create Agreement
        </a>

        <a 
          className={activeView === 'submit_review' ? 'active' : ''} 
          onClick={() => setActiveView('submit_review')}
          href="#milestones"
        >
          <Truck size={16} />
          Milestones & Delivery
        </a>

        <a 
          className={activeView === 'payment_settlement' ? 'active' : ''} 
          onClick={() => setActiveView('payment_settlement')}
          href="#payouts"
        >
          <Landmark size={16} />
          Pollar Settlement
          {pendingPayoutsCount > 0 && (
            <span className="payoutBadge">{pendingPayoutsCount}</span>
          )}
        </a>

        <a 
          className={activeView === 'privacy_auth' ? 'active' : ''} 
          onClick={() => setActiveView('privacy_auth')}
          href="#privacy"
        >
          <ShieldCheck size={16} />
          Zcash Privacy & ZK
        </a>

        {/* Sidebar Bottom: Persona switcher & demo reset */}
        <div className="adminBottom">
          <div style={{ marginBottom: 14 }}>
            <small style={{ 
              display: 'block', 
              fontSize: 10, 
              color: 'var(--muted)', 
              marginBottom: 5, 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              fontWeight: 700 
            }}>
              Active User Account
            </small>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              aria-label="Active Account"
              style={{
                width: '100%',
                fontSize: 11,
                padding: '7px 8px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: '#fff',
                color: 'var(--dark)',
                fontWeight: 600
              }}
            >
              <option value="client">Hirer: David Vance (@davidvance)</option>
              <option value="freelancer">Talent: Amara Okafor (@amaraokafor)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            style={{ marginBottom: '6px' }}
          >
            <LogOut size={16} />
            Reset demo state
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '7px',
              border: '1px solid var(--border)',
              background: '#fff',
              color: 'var(--muted)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '8px'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>

          {/* Dedicated /admin link */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onOpenAdmin}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(0,85,255,0.2)',
                color: 'var(--blue)',
                padding: '7px 10px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Database size={13} />
              <span>Admin Portal (/admin) →</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content">
        {/* Top Header */}
        <header>
          <div>
            <small>
              Kordia Escrow Protocol · Cross-Border Trust
            </small>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <b style={{ color: 'var(--dark)' }}>{currentUser.name}</b>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--blue)', background: '#F3F5FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                {currentUser.user_tag}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                · {currentUser.company || currentUser.title || 'Verified'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Seed account password pill */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Key size={11} color="var(--blue)" />
              <span>Seed Pass: <code style={{ fontWeight: 700 }}>Password123!</code></span>
            </div>

            {currentUser.is_verified ? (
              <span className="tag tagGreen" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px' }}>
                <CheckCircle2 size={13} />
                <span>Verified Tag Active</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => verifyUserEmail(currentRole)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '5px 10px',
                  borderRadius: '7px',
                  border: '1px solid #f59e0b',
                  background: '#fffbeb',
                  color: '#b45309',
                  cursor: 'pointer'
                }}
              >
                Verify Email Now
              </button>
            )}

            <div className="private">
              <ShieldCheck size={15} />
              Zcash Orchard Shielded
            </div>
          </div>
        </header>

        {/* Unverified Account Warning Banner (If applicable) */}
        {!currentUser.is_verified && (
          <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#92400E' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} color="#D97706" />
              <span>
                Your account <strong>{currentUser.user_tag}</strong> is pending email verification. Verify your account to create and participate in escrow agreements.
              </span>
            </div>
            <button
              type="button"
              onClick={() => verifyUserEmail(currentRole)}
              style={{ fontSize: '11px', background: '#D97706', color: '#fff', border: 0, padding: '4px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Verify Account
            </button>
          </div>
        )}

        {/* View Pages */}
        <div style={{ minHeight: 'calc(100vh - 68px)' }}>
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'details' && <AgreementDetailsView />}
          {activeView === 'create' && <CreateAgreementView />}
          {activeView === 'submit_review' && <SubmitReviewView />}
          {activeView === 'payment_settlement' && <PaymentSettlementView />}
          {activeView === 'privacy_auth' && <PrivacyAuthorizationView />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="adminMobileNav">
        <a 
          className={activeView === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveView('dashboard')}
          href="#dashboard"
        >
          <LayoutDashboard />
          Dashboard
        </a>
        <a 
          className={activeView === 'details' ? 'active' : ''} 
          onClick={() => setActiveView('details')}
          href="#agreements"
        >
          <Receipt />
          Agreements
        </a>
        <a 
          className={activeView === 'create' ? 'active' : ''} 
          onClick={() => setActiveView('create')}
          href="#create"
        >
          <Plus />
          Create
        </a>
        <a 
          onClick={onOpenAdmin}
          href="#admin"
        >
          <Database />
          Admin
        </a>
      </nav>

      {/* Toast Notification */}
      <Toast toast={toastMessage} onClose={() => {}} />
    </div>
  );
}

function MainApp() {
  const { isAuthenticated } = useAgreement();
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname === '/admin' || 
           window.location.hash === '#/admin' || 
           window.location.hash === '#admin';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm = window.location.pathname === '/admin' || 
                    window.location.hash === '#/admin' || 
                    window.location.hash === '#admin';
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const openAdmin = () => {
    setIsAdminRoute(true);
    window.location.hash = '#/admin';
  };

  const returnToApp = () => {
    setIsAdminRoute(false);
    window.history.pushState(null, '', '/');
    window.location.hash = '#dashboard';
  };

  if (isAdminRoute) {
    return <AdminGate onReturnToApp={returnToApp} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onOpenAdmin={openAdmin} />;
  }

  return <UserAppContent onOpenAdmin={openAdmin} />;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAF8FF', padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: 480, background: '#fff', border: '1px solid rgba(16,24,40,0.08)', borderRadius: 16, padding: 32, boxShadow: '0 14px 26px rgba(18,34,74,0.08)', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Scale size={22} />
            </div>
            <h2 style={{ fontSize: 20, fontFamily: 'Manrope, sans-serif', margin: '0 0 8px', color: '#101828' }}>Application State Reset</h2>
            <p style={{ fontSize: 12, color: '#5B6472', lineHeight: 1.6, marginBottom: 20 }}>
              An unexpected state transition occurred ({this.state.error?.message || 'State mismatch'}). Click below to restore clean demo data.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.clear();
                } catch (e) {}
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #0041C8, #0055FF)',
                color: '#fff',
                border: 0,
                borderRadius: 9,
                padding: '11px 20px',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Reset Demo State & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AgreementProvider>
        <MainApp />
      </AgreementProvider>
    </ErrorBoundary>
  );
}
