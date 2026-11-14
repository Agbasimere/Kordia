import React, { useRef, useEffect } from 'react';
import { 
  User, CheckCircle2, Landmark, LogOut, Smartphone, 
  Send, ExternalLink, X, ArrowUpRight, Wallet, RotateCcw
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { usePollar } from '@pollar/react';

export default function UserProfileDropdown({ isOpen, onClose }) {
  const { 
    getCurrentUser, 
    currentRole, 
    currentBalance, 
    formatCurrency, 
    logout, 
    resetAllData,
    setActiveView,
    setIsAlertsOpen,
    setActiveModal,
    getRoleWallet,
    disconnectRoleWallet,
    showToast
  } = useAgreement();

  let pollar = null;
  try {
    pollar = usePollar();
  } catch (err) {
    // Pollar context fallback
  }

  const dropdownRef = useRef(null);
  const user = getCurrentUser();
  const activeRoleWallet = getRoleWallet(currentRole);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '60px',
        right: '24px',
        width: '350px',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E2E8F0',
        zIndex: 100,
        overflow: 'hidden',
        animation: 'fadeInSlide 0.15s ease-out',
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
      }}
    >
      
      {/* 1. Profile Header with Avatar & User Info */}
      <div style={{
        padding: '18px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #F1F5F9',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            border: 0,
            background: 'transparent',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px'
          }}
          className="hover:text-slate-700"
        >
          <X size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar with Status Dot */}
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt=""
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #E2E8F0'
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #FFFFFF'
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: '14.5px', color: '#0F172A', fontWeight: 700, display: 'block' }}>
              {user?.name || 'Kordia User'}
            </b>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0 2px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#0F172A',
                background: '#F1F3F6',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {user?.user_tag || '@user'}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#059669',
                background: '#ECFDF5',
                padding: '1px 5px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <CheckCircle2 size={9} /> Verified
              </span>
            </div>

            <small style={{ fontSize: '11px', color: '#64748B', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'user@kordia.work'}
            </small>
          </div>
        </div>

        <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#475569' }}>
          Role: <b>{currentRole === 'client' ? 'Hirer (Employer)' : (user?.title || 'Professional Talent')}</b>
        </div>
      </div>

      {/* 2. Pollar Embedded Stellar Wallet */}
      <div style={{ padding: '16px 20px', background: '#F8F9FA', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={14} color="#0F172A" />
            <b style={{ fontSize: '11.5px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pollar Stellar Wallet
            </b>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
            Stellar Testnet
          </span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Custody:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0F172A' }}>Custodial (Pollar Embedded)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Asset Trustline:</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669' }}>USDC · 100% Coverage</span>
          </div>
          {activeRoleWallet ? (
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Public Key:</span>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
                {activeRoleWallet}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              No Stellar wallet connected.
            </div>
          )}
        </div>

        {/* Pollar App Connection Status */}
        <div style={{ marginTop: '10px', padding: '10px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '10.5px', color: '#64748B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Pollar App ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>cmwgtcqt80...ea89i</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Allowed Origin:</span>
            <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>http://localhost:5175</span>
          </div>

          {activeRoleWallet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '6px 8px', background: '#ECFDF5', borderRadius: '6px', fontSize: '10.5px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Stellar SDK Wallet:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {activeRoleWallet.slice(0, 6)}...{activeRoleWallet.slice(-4)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveModal('fund');
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #A7F3D0',
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-emerald-100"
                >
                  + Add Funds
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveModal('pollar_wallet');
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-slate-50"
                >
                  Manage
                </button>
                <button
                  type="button"
                  onClick={() => {
                    disconnectRoleWallet(currentRole);
                    try {
                      if (pollar?.getClient) {
                        pollar.getClient().logout();
                      }
                    } catch (e) {}
                    showToast("Wallet Disconnected", `Pollar wallet unlinked from ${user.name}.`, "info");
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-red-100"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveModal('pollar_wallet');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #0F172A',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              className="hover:bg-slate-800"
            >
              <Wallet size={12} />
              <span>Create / Connect Pollar SDK Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Real-Time Account Balance Summary */}
      <div style={{ padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Real-time Balance</span>
          <b style={{ fontSize: '16px', color: '#0F172A', fontFamily: 'monospace' }}>
            {formatCurrency(currentBalance)}
          </b>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            setActiveModal('withdraw');
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #0F172A',
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          className="hover:bg-slate-800"
        >
          Withdraw
        </button>
      </div>

      {/* 3b. Reset Workspace Data for Testing */}
      <div style={{ padding: '10px 18px', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset workspace? This will clear all agreements, balances, and history so you can test from a clean slate.")) {
              resetAllData();
              onClose();
            }
          }}
          style={{
            width: '100%',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px dashed #CBD5E1',
            background: '#F8FAFC',
            color: '#64748B',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          className="hover:border-slate-400 hover:text-slate-900"
        >
          <RotateCcw size={12} />
          <span>Reset All Data &amp; Balances (Demo Clean Slate)</span>
        </button>
      </div>

      {/* 4. Action Strip: Notifications & Sign Out */}
      <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8F9FA' }}>
        <button
          type="button"
          onClick={() => {
            onClose();
            setIsAlertsOpen(true);
          }}
          style={{
            border: 0,
            background: 'transparent',
            color: '#0F172A',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          className="hover:underline"
        >
          <Smartphone size={13} />
          <span>Notification Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            logout();
          }}
          style={{
            border: 0,
            background: 'transparent',
            color: '#EF4444',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          className="hover:underline"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
