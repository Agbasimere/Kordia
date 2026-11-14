import React, { useState, useEffect } from 'react';
import { AgreementProvider, useAgreement } from './context/AgreementContext';
import { PollarProvider } from '@pollar/react';
import { POLLAR_API_KEY, POLLAR_BASE_URL } from './lib/pollarClient';
import LandingPage from './components/LandingPage';
import CorporateDashboardView from './components/CorporateDashboardView';
import ProjectsListView from './components/ProjectsListView';
import TransactionsListView from './components/TransactionsListView';
import AgreementDetailsView from './components/AgreementDetailsView';
import CreateAgreementView from './components/CreateAgreementView';
import SubmitReviewView from './components/SubmitReviewView';
import PaymentSettlementView from './components/PaymentSettlementView';
import NotificationModal from './components/NotificationModal';
import ActionModals from './components/ActionModals';
import NewAuthModal from './components/NewAuthModal';
import UserProfileDropdown from './components/UserProfileDropdown';
import AdminGate from './components/AdminGate';
import Toast from './components/Toast';
import KordiaLogo from './components/KordiaLogo';
import { 
  LayoutDashboard, 
  Folder, 
  ArrowLeftRight, 
  Bell, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ShieldCheck, 
  Search,
  Sparkles,
  Smartphone,
  Send,
  Database,
  ExternalLink,
  Plus,
  ArrowRight
} from 'lucide-react';

function UserAppContent({ onOpenAdmin, onOpenLanding }) {
  const { 
    activeView, 
    setActiveView, 
    currentRole, 
    setCurrentRole, 
    getCurrentUser, 
    unreadNotificationsCount, 
    isAlertsOpen, 
    setIsAlertsOpen, 
    setActiveModal, 
    logout,
    linkedSocial 
  } = useAgreement();

  const user = getCurrentUser();
  const [isProfileFlyoutOpen, setIsProfileFlyoutOpen] = useState(false);

  return (
    <div className="kordiaCorporateWrapper">
      
      {/* ========================================================
          UPWARD HEADER NAVIGATION BAR
         ======================================================== */}
      <header className="kordiaUpwardHeader" style={{ position: 'relative' }}>
        
        {/* Left: Brand Logo + Stacked Collaborator Avatars (Matching Reference Image) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setActiveView('dashboard')}
            role="button"
            tabIndex={0}
          >
            <KordiaLogo size={28} />
          </div>

          {/* Collaborator Avatar Stack matching Reference Image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            <div className="kordiaAvatarStack">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" 
                alt="Amara" 
                className="kordiaAvatarItem"
                title="Amara Okafor"
              />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" 
                alt="David" 
                className="kordiaAvatarItem"
                title="David Vance"
              />
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" 
                alt="Admin" 
                className="kordiaAvatarItem"
                title="Admin"
              />
              <div className="kordiaAvatarCount">+5</div>
            </div>

            {/* Only Hirer can create agreement & invite talent */}
            {currentRole === 'client' && (
              <button
                type="button"
                onClick={() => setActiveModal('create_project')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
                className="hover:bg-slate-50"
              >
                <Plus size={12} />
                <span>Add talent</span>
              </button>
            )}
          </div>
        </div>

        {/* Center / Right: Individual Rectangular Nav Divs (Single rectangular divs matching reference image) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          <nav className="kordiaRectNavGroup">
            <button
              type="button"
              className={`kordiaRectNavBtn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Overview
            </button>

            <button
              type="button"
              className={`kordiaRectNavBtn ${activeView === 'projects' || activeView === 'details' ? 'active' : ''}`}
              onClick={() => setActiveView('projects')}
            >
              Projects
            </button>

            <button
              type="button"
              className={`kordiaRectNavBtn ${activeView === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveView('transactions')}
            >
              Transactions
            </button>

            <button
              type="button"
              className={`kordiaRectNavBtn ${false ? 'active' : ''}`}
              onClick={() => setIsAlertsOpen(true)}
            >
              Activity
            </button>
          </nav>

          {/* Notification Bell in its own rectangular box (Matching Image) */}
          <button
            type="button"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: isAlertsOpen ? '#F1F5F9' : '#FFFFFF',
              color: '#334155',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
            className="hover:bg-slate-50"
            title="Alerts & Live Invites"
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                border: '2px solid #FFFFFF'
              }}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Online Ring */}
          <div 
            onClick={() => setIsProfileFlyoutOpen(!isProfileFlyoutOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              border: isProfileFlyoutOpen ? '2px solid #0F172A' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
            title="Your Profile & Assigned Tasks"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
              alt=""
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
            />
          </div>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={logout}
            style={{
              border: 0,
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center'
            }}
            className="hover:text-red-500"
            title="Log out"
          >
            <LogOut size={15} />
          </button>

        </div>

        {/* Top-Right User Profile Container with Tasks Just Below Avatar */}
        <UserProfileDropdown
          isOpen={isProfileFlyoutOpen}
          onClose={() => setIsProfileFlyoutOpen(false)}
        />

      </header>

      {/* Alerts Popover matching Image 2 */}
      <NotificationModal 
        isOpen={isAlertsOpen} 
        onClose={() => setIsAlertsOpen(false)} 
      />

      {/* Interactive Action Modals (Fund, Withdraw, Transfer, Tag, Profile, Create) */}
      <ActionModals />

      {/* Main Corporate Work Area */}
      <main style={{ flex: 1 }}>
        {activeView === 'dashboard' && (
          <CorporateDashboardView onOpenProjectDetails={(id) => setActiveView('details')} />
        )}

        {activeView === 'projects' && (
          <ProjectsListView onOpenDetails={(id) => setActiveView('details')} />
        )}

        {activeView === 'transactions' && (
          <TransactionsListView />
        )}

        {activeView === 'details' && (
          <AgreementDetailsView />
        )}

        {activeView === 'create' && (
          <CreateAgreementView />
        )}

        {activeView === 'submit_review' && (
          <SubmitReviewView />
        )}

        {activeView === 'payment_settlement' && (
          <PaymentSettlementView />
        )}

        {/* Fallback to dashboard so screen is never blank */}
        {!['dashboard', 'projects', 'transactions', 'details', 'create', 'submit_review', 'payment_settlement'].includes(activeView) && (
          <CorporateDashboardView onOpenProjectDetails={(id) => setActiveView('details')} />
        )}
      </main>

    </div>
  );
}

function MainApp() {
  const { 
    isAuthenticated, 
    currentRole, 
    isLandingOpen, 
    setIsLandingOpen 
  } = useAgreement();

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname === '/admin' || 
           window.location.hash === '#/admin' || 
           window.location.hash === '#admin';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authRole, setAuthRole] = useState('freelancer');

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

  const openAuthWithParams = (mode = 'signin', role = 'freelancer') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  // Route 1: Dedicated Admin Portal (/admin)
  if (isAdminRoute) {
    return <AdminGate onReturnToApp={returnToApp} />;
  }

  // Route 2: Landing Page (Image 3) when unauthenticated or requested
  if (!isAuthenticated || isLandingOpen) {
    return (
      <>
        <LandingPage 
          onOpenAuth={openAuthWithParams} 
          onLaunchDemo={(role) => openAuthWithParams('signin', role)} 
        />
        <NewAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
          initialRole={authRole}
        />
      </>
    );
  }

  // Route 3: Authenticated Workspace (Image 1 & 2)
  return (
    <>
      <UserAppContent 
        onOpenAdmin={openAdmin} 
        onOpenLanding={() => setIsLandingOpen(true)} 
      />
      <NewAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
      />
    </>
  );
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
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F4F5F8', padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: 480, background: '#fff', border: '1px solid rgba(16,24,40,0.08)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontFamily: 'Manrope, sans-serif', margin: '0 0 8px', color: '#101828' }}>Workspace Session Reset</h2>
            <p style={{ fontSize: 12, color: '#5B6472', lineHeight: 1.6, marginBottom: 20 }}>
              An unexpected state transition occurred ({this.state.error?.message || 'State mismatch'}). Click below to reload.
            </p>
            <button
              type="button"
              onClick={() => {
                try { localStorage.clear(); } catch (e) {}
                window.location.reload();
              }}
              style={{
                background: '#0F172A',
                color: '#fff',
                border: 0,
                borderRadius: 9,
                padding: '11px 20px',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Reset State &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const POLLAR_CLIENT_CONFIG = {
  apiKey: POLLAR_API_KEY,
  baseUrl: POLLAR_BASE_URL,
  stellarNetwork: 'testnet'
};

const POLLAR_APP_CONFIG = {
  application: {
    name: "Kordia",
    network: "testnet",
    chains: ["STELLAR"],
    walletProvisioning: "AT_LOGIN",
    walletCustodyMode: "INTERNAL",
    signConfirmation: { mode: "PROMPT", windowSeconds: 300, maxUsd: "50" }
  },
  styles: {
    theme: "light",
    accentColor: "#0F172A",
    emailEnabled: true,
    embeddedWallets: true,
    smartWallet: true,
    modalZIndex: 999999,
    providers: {
      google: true,
      discord: false,
      x: false,
      github: false,
      apple: false
    }
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <PollarProvider 
        client={POLLAR_CLIENT_CONFIG}
        appConfig={POLLAR_APP_CONFIG}
      >
        <AgreementProvider>
          <MainApp />
          <Toast />
        </AgreementProvider>
      </PollarProvider>
    </ErrorBoundary>
  );
}
