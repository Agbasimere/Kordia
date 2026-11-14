import React from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, 
  Send, DollarSign, ExternalLink, RefreshCw, FileText
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';

export default function AgreementTimelineTracker({ agreement, onActionTrigger }) {
  const { 
    getCurrentUser, 
    getAgreementNextAction, 
    acceptAgreement, 
    fundEscrow, 
    setActiveView 
  } = useAgreement();

  const currentUser = getCurrentUser();
  const nextAction = getAgreementNextAction(agreement, currentUser);

  if (!agreement || !nextAction) return null;

  const isClient = currentUser.user_tag?.toLowerCase() === agreement.client_tag?.toLowerCase();
  const counterpartyTag = isClient ? agreement.freelancer_tag : agreement.client_tag;

  // 5 Step Lifecycle
  const steps = [
    { num: 1, name: "Proposal & Terms", key: "Awaiting acceptance" },
    { num: 2, name: "Pollar Escrow", key: "Awaiting funding" },
    { num: 3, name: "Work in Progress", key: "Active" },
    { num: 4, name: "Review & Approval", key: "Submitted" },
    { num: 5, name: "Agreement Completed", key: "Released" },
  ];

  const getStepStatus = (stepNum) => {
    if (agreement.status === 'Refunded') {
      return stepNum <= 3 ? 'completed' : 'cancelled';
    }
    if (nextAction.stepNumber > stepNum) return 'completed';
    if (nextAction.stepNumber === stepNum) return 'active';
    return 'pending';
  };

  const handleActionClick = () => {
    if (onActionTrigger) {
      onActionTrigger(nextAction.actionType);
      return;
    }
    if (nextAction.actionType === 'ACCEPT_TERMS') {
      acceptAgreement(agreement.id);
    } else if (nextAction.actionType === 'FUND_ESCROW') {
      fundEscrow(agreement.id);
    } else if (nextAction.actionType === 'SUBMIT_WORK') {
      setActiveView('submit_review');
    } else if (nextAction.actionType === 'REVIEW_APPROVE') {
      setActiveView('submit_review');
    } else if (nextAction.actionType === 'EXECUTE_PAYOUT') {
      setActiveView('payment_settlement');
    }
  };

  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
      
      {/* Turn Action Banner */}
      <div 
        style={{
          background: nextAction.isMyTurn ? '#F0F7FF' : '#F8FAFC',
          border: `1px solid ${nextAction.isMyTurn ? '#BAE6FD' : '#E2E8F0'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span 
                className={nextAction.isMyTurn ? 'tag tagGreen' : 'tag'} 
                style={{ 
                  background: nextAction.isMyTurn ? '#0055FF' : '#64748B', 
                  color: '#fff', 
                  fontWeight: 700,
                  fontSize: '10px',
                  letterSpacing: '0.04em'
                }}
              >
                {nextAction.isMyTurn ? '👉 YOUR TURN TO ACT' : `⏳ WAITING ON ${counterpartyTag}`}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                Step {nextAction.stepNumber} of {nextAction.stepTotal}: {nextAction.stepName}
              </span>
            </div>

            <b style={{ fontSize: '14px', color: 'var(--dark)', display: 'block', margin: '2px 0 4px' }}>
              {nextAction.headline}
            </b>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              {nextAction.description}
            </p>
          </div>

          {nextAction.isMyTurn && nextAction.buttonText && (
            <div style={{ flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleActionClick}
                style={{
                  background: 'var(--blue)',
                  color: '#fff',
                  border: 0,
                  padding: '10px 18px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 85, 255, 0.2)'
                }}
              >
                <span>{nextAction.buttonText}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual 5-Step Process Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <small style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', fontWeight: 700 }}>
            Transaction Lifecycle Progress
          </small>
          <small style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>
            Counterparty: {counterpartyTag}
          </small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {steps.map((st) => {
            const status = getStepStatus(st.num);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';

            return (
              <div 
                key={st.num}
                style={{
                  borderTop: `3px solid ${isCompleted ? '#10B981' : isActive ? 'var(--blue)' : '#E2E8F0'}`,
                  paddingTop: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    fontFamily: 'monospace',
                    fontWeight: 700, 
                    color: isCompleted ? '#10B981' : isActive ? 'var(--blue)' : 'var(--muted)' 
                  }}>
                    {isCompleted ? '✓' : `0${st.num}`}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--dark)' : isCompleted ? '#10B981' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {st.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
