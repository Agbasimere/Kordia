import React, { useState } from 'react';
import { 
  TrendingUp, ArrowUpRight, ArrowUp, Plus, ArrowLeftRight, 
  CheckCircle2, Clock, Users, Star, ArrowRight, Smartphone, 
  Send, ExternalLink, SlidersHorizontal, Eye, EyeOff, Landmark, Wallet
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';
import { usePollar } from '@pollar/react';

export default function CorporateDashboardView({ onOpenProjectDetails }) {
  let pollar = null;
  try {
    pollar = usePollar();
  } catch (e) {}
  const { 
    getCurrentUser, 
    currentRole, 
    currentBalance, 
    agreements, 
    notifications, 
    activityLogs, 
    displayCurrency, 
    setDisplayCurrency, 
    formatCurrency, 
    setActiveModal, 
    setIsAlertsOpen,
    setSelectedAgreementId,
    setActiveView,
    getRoleWallet
  } = useAgreement();

  const user = getCurrentUser();
  const activeRoleWallet = getRoleWallet(currentRole);
  const [hideBalance, setHideBalance] = useState(false);

  // Filter agreements for active user
  const userProjects = agreements.filter(a => {
    if (currentRole === 'client') {
      return a.client_tag?.toLowerCase() === user?.user_tag?.toLowerCase() || a.creator_tag?.toLowerCase() === user?.user_tag?.toLowerCase();
    }
    return a.freelancer_tag?.toLowerCase() === user?.user_tag?.toLowerCase();
  });

  // Real-Time Calculations (No Mock Data)
  const totalReceivables = userProjects.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const activeAgreementsCount = userProjects.filter(p => p.status !== 'Released' && p.status !== 'Refunded').length;
  const completedCount = userProjects.filter(p => p.status === 'Released').length;

  // Real-time Balance Formatted
  const formattedMainBalance = hideBalance 
    ? '••••••••' 
    : `$${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1420px', margin: '0 auto', padding: '24px 32px 60px', width: '100%', boxSizing: 'border-box' }} className="animate-in fade-in duration-150">
      
      {/* ========================================================
          1. ACCOUNT BALANCE ROW (REPLACING GREETINGS WITH REAL-TIME BALANCE)
             MATCHING BLACK & WHITE SAMPLE: "Projected Cash" + Real-time Balance
         ======================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '22px'
      }}>
        
        {/* Left: Projected Cash & Real-time Big Number */}
        <div>
          <span style={{
            fontSize: '17px',
            color: '#475569',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            display: 'block',
            marginBottom: '4px',
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
          }}>
            Projected Cash
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{
              fontSize: 'clamp(36px, 4.4vw, 54px)',
              fontWeight: 500,
              letterSpacing: '-0.035em',
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              margin: 0,
              lineHeight: 1.05
            }}>
              {formattedMainBalance}
            </h1>

            <button
              type="button"
              onClick={() => setHideBalance(!hideBalance)}
              style={{
                border: 0,
                background: 'transparent',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'grid',
                placeItems: 'center'
              }}
              title={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            {currentBalance === 0 && (
              <button
                type="button"
                onClick={() => setActiveModal('fund')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                className="hover:bg-emerald-100"
              >
                <Plus size={12} /> Top up account
              </button>
            )}
          </div>
        </div>

        {/* Right: Add funds button (Hirer only) + Currency selector + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
          
          {/* Currency Toggle: USD and USDC (Stellar Testnet Rails) */}
          <div style={{
            display: 'inline-flex',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            padding: '3px',
            borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            {['USD', 'USDC'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setDisplayCurrency(curr)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: 0,
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: displayCurrency === curr ? '#0F172A' : 'transparent',
                  color: displayCurrency === curr ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                }}
              >
                {curr === 'USD' ? '$ USD' : '⚡ USDC'}
              </button>
            ))}
          </div>

          {/* Add funds (Visible to both Hirer and Talent) */}
          <button
            type="button"
            onClick={() => setActiveModal('fund')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#0F172A',
              color: '#FFFFFF',
              border: 0,
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(15,23,42,0.12)',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              transition: 'all 0.15s ease'
            }}
            className="hover:opacity-90 active:scale-95"
          >
            <Plus size={14} />
            <span>Add funds</span>
          </button>

          {/* Withdraw via Pollar (White with transparent hover) */}
          <button
            type="button"
            onClick={() => setActiveModal('withdraw')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              transition: 'all 0.15s ease'
            }}
            className="hover:bg-slate-100/80 active:bg-slate-200/60"
          >
            <ArrowUp size={14} />
            <span>Withdraw</span>
          </button>

          {/* Transfer (White with transparent hover) */}
          <button
            type="button"
            onClick={() => setActiveModal('transfer')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              transition: 'all 0.15s ease'
            }}
            className="hover:bg-slate-100/80 active:bg-slate-200/60"
          >
            <ArrowLeftRight size={14} />
            <span>Transfer</span>
          </button>

        </div>

      </div>

      {/* ========================================================
          2. ROW OF 4 RECTANGULAR STAT BOXES (REAL-TIME DATA)
             Directly under the balance: Active Agreements | Receivables | Settled | Pollar Rate
         ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '26px'
      }} className="corporateGridStats">
        
        {/* Box 1: Real-time Active Agreements */}
        <div className="kordiaCorporateCard" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '104px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              lineHeight: 1
            }}>
              {activeAgreementsCount}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#059669',
              background: '#ECFDF5',
              padding: '2px 7px',
              borderRadius: '999px'
            }}>
              Live
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Active Agreements
          </span>
        </div>

        {/* Box 2: Real-time Receivables */}
        <div className="kordiaCorporateCard" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '104px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              lineHeight: 1
            }}>
              {formatCurrency(totalReceivables)}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Total Receivables
          </span>
        </div>

        {/* Box 3: Real-time Completed Contracts */}
        <div className="kordiaCorporateCard" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '104px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              lineHeight: 1
            }}>
              {completedCount}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#059669',
              background: '#ECFDF5',
              padding: '2px 7px',
              borderRadius: '999px'
            }}>
              Settled
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
            Settled Contracts
          </span>
        </div>

        {/* Box 4: Pollar Settlement & SDK Wallet Status */}
        <div 
          className="kordiaCorporateCard" 
          style={{ 
            padding: '20px 22px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            minHeight: '104px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onClick={() => {
            setActiveModal('pollar_wallet');
          }}
          title="Click to view & provision Pollar Stellar Testnet Wallet"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              lineHeight: 1
            }}>
              100%
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#10B981',
              background: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              {pollar?.wallet ? 'Connected' : 'Pollar Testnet'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
              Pollar Settlement Rate
            </span>
            {!activeRoleWallet ? (
              <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: 700, textDecoration: 'underline' }}>
                Connect Wallet →
              </span>
            ) : (
              <span style={{ fontSize: '10px', color: '#059669', fontFamily: 'monospace', fontWeight: 700 }}>
                {activeRoleWallet.slice(0, 5)}...{activeRoleWallet.slice(-3)}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================
          3. MAIN SECTION: FINANCIAL HEALTH SCORE (LEFT) + RIGHT CARDS
             (BLACK & WHITE + EMERALD GREEN PALETTE MATCHING SAMPLE)
         ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
        gap: '24px'
      }} className="corporateGridMain">
        
        {/* ====================================================
            LEFT CARD: FINANCIAL HEALTH SCORE PILLAR CHART
           ==================================================== */}
        <div className="kordiaCorporateCard" style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 4px',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
            }}>
              Financial health score
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#64748B',
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
            }}>
              Liquidity, spend, receivables and settlement stability over 12 months
            </p>
          </div>

          {/* Pillars Graphic (Matching Sample Multi-Tone & Vibrant Green Bars) */}
          <div style={{ position: 'relative', width: '100%', height: '240px' }}>
            
            {/* Top Score Badges */}
            <div style={{ position: 'absolute', top: 0, left: '8%', textAlign: 'center' }}>
              <b style={{ fontSize: '12px', color: '#64748B', display: 'block', fontWeight: 700 }}>11%</b>
              <small style={{ fontSize: '10px', color: '#94A3B8' }}>Critical</small>
            </div>

            <div style={{ position: 'absolute', top: '15px', left: '26%', textAlign: 'center' }}>
              <b style={{ fontSize: '12px', color: '#64748B', display: 'block', fontWeight: 700 }}>37%</b>
              <small style={{ fontSize: '10px', color: '#94A3B8' }}>Fragile</small>
            </div>

            <div style={{ position: 'absolute', top: '18px', left: '46%', textAlign: 'center' }}>
              <b style={{ fontSize: '12px', color: '#64748B', display: 'block', fontWeight: 700 }}>56%</b>
              <small style={{ fontSize: '10px', color: '#94A3B8' }}>Stable</small>
            </div>

            {/* Floating White Card above the green section (77% Strong) */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '68%',
              transform: 'translateX(-50%)',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '4px 10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              textAlign: 'center',
              zIndex: 10
            }}>
              <b style={{ fontSize: '12px', color: '#0F172A', display: 'block', fontWeight: 700 }}>77%</b>
              <small style={{ fontSize: '10px', color: '#64748B' }}>Strong</small>
            </div>

            {/* Floating White Card above 97% Excellent */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '88%',
              transform: 'translateX(-50%)',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '4px 10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              textAlign: 'center',
              zIndex: 10
            }}>
              <b style={{ fontSize: '12px', color: '#0F172A', display: 'block', fontWeight: 700 }}>97%</b>
              <small style={{ fontSize: '10px', color: '#64748B' }}>Excellent</small>
            </div>

            {/* Vertical Line Pillars */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: 0,
              right: 0,
              height: '150px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 8px'
            }}>
              {Array.from({ length: 68 }).map((_, i) => {
                const isGreen = i >= 45;
                const wave = Math.sin(i / 4.5) * 22;
                let baseH = 40;
                if (i >= 15 && i < 29) baseH = 65;
                else if (i >= 29 && i < 45) baseH = 80;
                else if (i >= 45 && i < 57) baseH = 110;
                else if (i >= 57) baseH = 95;

                const heightPx = Math.min(138, Math.max(25, baseH + wave + (i % 2) * 5));

                return (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      height: `${heightPx}px`,
                      background: isGreen ? '#10B981' : i < 15 ? '#E2E8F0' : i < 29 ? '#CBD5E1' : '#94A3B8',
                      borderRadius: '1px',
                      opacity: isGreen ? 1 : 0.85
                    }}
                  />
                );
              })}
            </div>

            {/* Bottom Numbered Scale Pills */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 4px'
            }}>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                <span
                  key={val}
                  style={{
                    fontSize: '10.5px',
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    fontWeight: 600,
                    color: val >= 80 ? '#FFFFFF' : '#64748B',
                    background: val >= 80 ? '#10B981' : '#F1F3F6',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {val}
                </span>
              ))}
            </div>

          </div>

        </div>

        {/* ====================================================
            RIGHT COLUMN: TOP 2 CARDS + BOTTOM POLLAR FX CARD
           ==================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Row: 2 Cards Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Top Right Card 1 (White Card: 67% Confident) */}
            <div className="kordiaCorporateCard" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#64748B',
                  margin: '0 0 12px',
                  lineHeight: 1.35,
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                }}>
                  How confident do you feel making decisions on Keel data and AI suggestions?
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#0F172A',
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                  }}>
                    67%
                  </span>
                  <small style={{ fontSize: '11px', color: '#64748B' }}>Confident</small>
                </div>
              </div>

              {/* Green pillar bar with floating 8.65% tag */}
              <div style={{ position: 'relative', marginTop: '14px', height: '65px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '50px',
                  borderRadius: '6px',
                  background: 'linear-gradient(180deg, #A7F3D0 0%, #10B981 100%)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    8.65%
                  </div>
                </div>
              </div>

              {/* Bottom legend dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px', color: '#94A3B8', marginTop: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} /> Confident</span>
                <span>Clear</span>
                <span>Reliable</span>
              </div>
            </div>

            {/* Top Right Card 2 (Solid Black Card #0F172A: Pollar Settlement Rails) */}
            <div style={{
              background: '#0F172A',
              borderRadius: '20px',
              padding: '20px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '190px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
            }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  margin: '0 0 12px',
                  lineHeight: 1.35,
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                }}>
                  Which rail is active for instant local milestone settlement?
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                  }}>
                    100%
                  </span>
                  <small style={{ fontSize: '11px', color: '#94A3B8' }}>Pollar Rails</small>
                </div>
              </div>

              {/* High-tech Circular Gauge Arc Meter (Matching Reference Image) */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 6px' }}>
                <svg width="120" height="60" viewBox="0 0 120 60">
                  <path
                    d="M 15 55 A 45 45 0 0 1 105 55"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15 55 A 45 45 0 0 1 105 55"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom legend dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px', color: '#94A3B8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} /> Pollar</span>
                <span>Stellar Horizon</span>
                <span>Active Rail</span>
              </div>
            </div>

          </div>

          {/* Bottom Card (Pollar Stellar Settlement Rate: USDC on Stellar) */}
          <div className="kordiaCorporateCard" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <span style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
                }}>
                  Pollar Settlement Rail (Stellar Testnet)
                </span>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  lineHeight: 1.15
                }}>
                  1.00 USDC <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>= $1.00 USD</span>
                </div>
              </div>

              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                display: 'grid',
                placeItems: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}>
                <ArrowUpRight size={14} />
              </div>
            </div>

            <p style={{
              fontSize: '11px',
              color: '#94A3B8',
              margin: '0 0 16px',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
            }}>
              Direct cryptographic settlement to Pollar embedded Stellar wallets via Stellar Horizon testnet.
            </p>

            {/* Fine Vertical Wave Line Chart spanning across the card */}
            <div style={{ position: 'relative', width: '100%', height: '50px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {Array.from({ length: 42 }).map((_, i) => {
                  const h = 8 + Math.abs(Math.sin(i / 3)) * 26;
                  return (
                    <div
                      key={i}
                      style={{
                        width: '1.5px',
                        height: `${h}px`,
                        background: '#CBD5E1',
                        borderRadius: '1px'
                      }}
                    />
                  );
                })}
              </div>

              <div style={{
                position: 'absolute',
                right: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#A7F3D0',
                color: '#065F46',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #6EE7B7'
              }}>
                Active Rail
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
