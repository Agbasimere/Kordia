import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, DollarSign, Clock, CheckCircle2, AlertTriangle, 
  ArrowRight, Plus, ExternalLink, ChevronRight, Activity, TrendingUp,
  CreditCard, Shield, User, Filter, RefreshCw, Award, Play,
  Globe, Code2, Scale, Check, Landmark, ArrowUpRight, Search, UserCheck
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';
import AgreementTimelineTracker from './AgreementTimelineTracker';

export default function DashboardView() {
  const { 
    getUserAgreements, 
    activityLogs, 
    setSelectedAgreementId, 
    setActiveView, 
    currentRole, 
    setCurrentRole, 
    getCurrentUser, 
    findUserByTag,
    getActiveAgreement,
    getAgreementNextAction
  } = useAgreement();

  const currentUser = getCurrentUser();
  const userAgreements = getUserAgreements();
  const activeAgreement = getActiveAgreement() || userAgreements[0];

  const counterpartyTag = activeAgreement?.client_tag === currentUser.user_tag 
    ? activeAgreement?.freelancer_tag 
    : activeAgreement?.client_tag;
  const counterpartyUser = findUserByTag(counterpartyTag);

  // Metrics calculated strictly for user's tagged agreements
  const totalInEscrow = userAgreements
    .filter(a => a.status === 'Active' || a.status === 'Submitted' || a.status === 'Awaiting funding')
    .reduce((acc, a) => acc + (a.total_amount || 0), 0);

  const totalSettled = userAgreements
    .filter(a => a.status === 'Released' || a.payout?.status === 'PAYOUT_COMPLETED')
    .reduce((acc, a) => acc + (a.total_amount || 0), 0);

  const getTagClass = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Released':
        return 'tag tagGreen';
      case 'Awaiting acceptance':
      case 'Awaiting funding':
      case 'Submitted':
        return 'tag tagAmber';
      case 'Refunded':
        return 'tag tagDanger';
      default:
        return 'tag';
    }
  };

  return (
    <div className="adminPage animate-in fade-in duration-150">
      
      {/* User Welcome Banner */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: '20px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="tag" style={{ background: '#F3F5FF', color: 'var(--blue)', fontWeight: 700 }}>
                {currentUser.role === 'client' ? 'Hirer Dashboard' : 'Talent Dashboard'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--blue)', fontWeight: 700 }}>
                {currentUser.user_tag}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                · {currentUser.name} ({currentUser.company || currentUser.title || 'Verified'})
              </span>
            </div>
            <h1 style={{ fontSize: '24px', margin: '4px 0 6px', color: 'var(--dark)' }}>
              {currentUser.role === 'client' ? `Hirer Workspace · ${currentUser.company}` : `Talent Workspace · ${currentUser.name}`}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
              Direct peer-to-peer milestone escrow between Hirer and Talent. Track each step of your agreement, verify whose turn it is to act, and settle securely via shielded Zcash and Pollar GTBank rails.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveView('create')}
              className="primary"
              style={{ width: 'auto', padding: '10px 18px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Create New Agreement</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('details')}
              style={{ fontSize: '12px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--dark)', cursor: 'pointer', fontWeight: 600 }}
            >
              My Agreements ({userAgreements.length})
            </button>
          </div>
        </div>

        {/* Quick User Persona Switcher Strip */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            Switch Active Persona:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCurrentRole('client')}
              style={{
                fontSize: '11px',
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: currentRole === 'client' ? '#F3F5FF' : '#fff',
                color: currentRole === 'client' ? 'var(--blue)' : 'var(--dark)',
                fontWeight: currentRole === 'client' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Hirer: David Vance (@davidvance)</span>
              {currentRole === 'client' && <Check size={12} color="var(--blue)" />}
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('freelancer')}
              style={{
                fontSize: '11px',
                padding: '5px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: currentRole === 'freelancer' ? '#F3F5FF' : '#fff',
                color: currentRole === 'freelancer' ? 'var(--blue)' : 'var(--dark)',
                fontWeight: currentRole === 'freelancer' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Talent: Amara Okafor (@amaraokafor)</span>
              {currentRole === 'freelancer' && <Check size={12} color="var(--blue)" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4 User Escrow Metrics */}
      <div className="metrics">
        <div className="metric">
          <small>Secured in Escrow</small>
          <strong>${totalInEscrow > 0 ? totalInEscrow.toFixed(2) : '500.00'}</strong>
          <small style={{ color: 'var(--green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={11} /> 12.5 ZEC in Orchard Pool
          </small>
        </div>

        <div className="metric">
          <small>Active Agreements</small>
          <strong>{userAgreements.length} Total</strong>
          <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Tagged to your user ID
          </small>
        </div>

        <div className="metric">
          <small>Settlement Route</small>
          <strong>₦836,048</strong>
          <small style={{ color: 'var(--blue)', marginTop: '4px' }}>
            Pollar GTBank Rail (NGN)
          </small>
        </div>

        <div className="metric">
          <small>Escrow Protection</small>
          <strong>Direct P2P Escrow</strong>
          <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Hirer ↔ Talent Consensus
          </small>
        </div>
      </div>

      {/* Spotlight: Active Tagged Agreement Card with Turn-by-Turn Tracker */}
      {activeAgreement && (
        <section className="card" style={{ padding: '24px 28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--muted)' }}>
                  {activeAgreement.id}
                </span>
                <span className={getTagClass(activeAgreement.status)}>
                  {activeAgreement.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {activeAgreement.category}
                </span>
              </div>
              <h2 style={{ fontSize: '18px', margin: '4px 0 2px', color: 'var(--dark)' }}>
                {activeAgreement.title}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ font: '800 22px Manrope', color: 'var(--dark)' }}>
                ${activeAgreement.total_amount?.toFixed(2)} USD
              </div>
              <small style={{ color: 'var(--green)', fontWeight: 600 }}>
                ~{(activeAgreement.total_amount / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC Shielded
              </small>
            </div>
          </div>

          {/* Counterparties summary with verified tags */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', padding: '16px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                Hirer (Client)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ color: 'var(--dark)' }}>David Vance</b>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--blue)', background: '#F3F5FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {activeAgreement.client_tag || '@davidvance'}
                </span>
              </div>
              <small style={{ display: 'block', color: 'var(--muted)' }}>Apex Design Studio · London, UK</small>
            </div>

            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                Talent (Freelancer)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ color: 'var(--dark)' }}>Amara Okafor</b>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--blue)', background: '#F3F5FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {activeAgreement.freelancer_tag || '@amaraokafor'}
                </span>
              </div>
              <small style={{ display: 'block', color: 'var(--muted)' }}>Senior Full-Stack Engineer · Lagos, Nigeria</small>
            </div>
          </div>

          {/* Turn-by-Turn Action Timeline Tracker */}
          <div style={{ marginTop: '18px' }}>
            <AgreementTimelineTracker agreement={activeAgreement} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedAgreementId(activeAgreement.id);
                setActiveView('details');
              }}
              style={{ fontSize: '12px', padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', color: 'var(--dark)', fontWeight: 600 }}
            >
              View Full Agreement Details & History →
            </button>
          </div>
        </section>
      )}

      {/* Two Blockchains Integration Card (Zcash & Pollar) */}
      <section className="card" style={{ padding: '24px 28px', marginBottom: '20px' }}>
        <div className="sectionHead" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Dual Blockchain & Settlement Infrastructure</h3>
            <span className="muted" style={{ fontSize: '11px' }}>
              How Kordia combines Zcash financial privacy with Pollar local stablecoin clearing rails
            </span>
          </div>
          <span className="tag tagGreen">Verified Rails</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Rail 1: Zcash Privacy Layer */}
          <div style={{ padding: '18px 20px', borderRadius: '12px', background: '#FAF8FF', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: 'var(--dark)' }}>1. Zcash Orchard Privacy Layer</b>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px' }}>Zero-Knowledge Financial Protection</small>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, margin: '8px 0 12px' }}>
              Milestone escrow deposits are locked in the shielded Zcash Orchard pool. Balances and counterparty transaction histories remain completely private from the public.
            </p>
            <div style={{ fontSize: '11px', color: 'var(--dark)', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Selective Disclosure: </span>
              <b>Viewing keys grant parties auditable proof without exposing full wallet history.</b>
            </div>
          </div>

          {/* Rail 2: Pollar Settlement Layer */}
          <div style={{ padding: '18px 20px', borderRadius: '12px', background: '#FAF8FF', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,85,255,0.12)', color: 'var(--blue)', display: 'grid', placeItems: 'center' }}>
                <Landmark size={16} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: 'var(--dark)' }}>2. Pollar Local Bank Rail</b>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px' }}>Stablecoin & Local Currency Settlement</small>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, margin: '8px 0 12px' }}>
              Upon milestone approval, payment transitions through Pollar's settlement route: converts to stablecoin USDC and disburses directly in local Naira (₦836,048) to GTBank.
            </p>
            <div style={{ fontSize: '11px', color: 'var(--dark)', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Clearing Target: </span>
              <b>Amara Okafor · GTBank Account 0149928371 (Instant).</b>
            </div>
          </div>

        </div>
      </section>

      {/* User's Tagged Agreements Table with Turn Badges */}
      <section className="card" style={{ padding: '24px 28px', marginBottom: '20px' }}>
        <div className="sectionHead" style={{ marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Agreements Tagged to {currentUser.user_tag}</h3>
            <span className="muted" style={{ fontSize: '11px' }}>
              Track whose turn it is to act for each transaction to keep moving forward
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('create')}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={13} />
            <span>Create New</span>
          </button>
        </div>

        <div>
          {userAgreements.map((agr) => {
            const nextAction = getAgreementNextAction(agr, currentUser);
            return (
              <div key={agr.id} className="order" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <b>{agr.title}</b>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--muted)' }}>{agr.id}</span>
                  </div>
                  <small>
                    Hirer: <strong style={{ color: 'var(--blue)' }}>{agr.client_tag}</strong>
                    {' · '}
                    Talent: <strong style={{ color: 'var(--blue)' }}>{agr.freelancer_tag}</strong>
                  </small>
                  {nextAction && (
                    <div style={{ marginTop: '3px' }}>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          color: nextAction.isMyTurn ? '#0055FF' : 'var(--muted)',
                          background: nextAction.isMyTurn ? '#F3F5FF' : '#F1F5F9',
                          padding: '2px 7px',
                          borderRadius: '4px'
                        }}
                      >
                        {nextAction.isMyTurn ? '👉 YOUR TURN: ' + nextAction.stepName : '⏳ WAITING ON: ' + nextAction.turnTag}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <b style={{ fontSize: '13px' }}>${agr.total_amount?.toFixed(2)} USD</b>
                  <small style={{ color: 'var(--green)' }}>~{(agr.total_amount / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC</small>
                </div>

                <div>
                  <span className={getTagClass(agr.status)}>
                    {agr.status}
                  </span>
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="primaryBtn"
                    onClick={() => {
                      setSelectedAgreementId(agr.id);
                      setActiveView('details');
                    }}
                  >
                    View History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgreementId(agr.id);
                      setActiveView('submit_review');
                    }}
                  >
                    Deliverables
                  </button>
                </div>
              </div>
            );
          })}

          {userAgreements.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
              No agreements currently tagged to your account tag {currentUser.user_tag}.
            </div>
          )}
        </div>
      </section>

      {/* Activity Timeline / History */}
      <section className="card" style={{ padding: '24px 28px' }}>
        <div className="sectionHead" style={{ marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Verifiable Agreement History & Audit Trail</h3>
            <span className="muted" style={{ fontSize: '11px' }}>
              Chronological ledger of every agreement proposal, acceptance, deposit, and payment release
            </span>
          </div>
          <button 
            type="button" 
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer' }}
            onClick={() => setActiveView('privacy_auth')}
          >
            Audit Log & Viewing Keys
          </button>
        </div>

        <div>
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="order">
              <div>
                <b>{log.action}</b>
                <small>{log.details}</small>
              </div>
              <div>
                <span className="status" style={{ fontFamily: 'monospace' }}>{log.actor}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
