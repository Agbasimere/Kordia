import React, { useState } from 'react';
import { 
  CheckSquare, ExternalLink, CheckCircle2, AlertTriangle, 
  Upload, FileText, Check, ArrowRight, Shield, Globe, Code2, Lock, 
  DollarSign, RefreshCw, XCircle, ChevronRight, MessageSquare, RotateCcw
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';

export default function SubmitReviewView() {
  const { 
    getActiveAgreement, 
    currentRole, 
    setCurrentRole, 
    setActiveView, 
    submitMilestone, 
    approveMilestone, 
    requestRevision,
    issueMutualRefund,
    getCurrentUser,
    getAgreementNextAction,
    showToast 
  } = useAgreement();

  const agreement = getActiveAgreement();
  const currentUser = getCurrentUser();
  const milestone = agreement?.milestones?.[0] || {
    id: "ms-default",
    title: "Milestone 1: Production Frontend & Responsive UI",
    deliverable: "Next.js + Tailwind web application with responsive layout, product showcase, and live Vercel URL.",
    amount: 500.0,
    status: agreement?.status || "Active"
  };

  const [submissionUrl, setSubmissionUrl] = useState(
    milestone?.submission_url || 'https://apex-store-staging.vercel.app'
  );
  const [repoUrl, setRepoUrl] = useState(
    milestone?.repo_url || 'https://github.com/amara-okafor/apex-commerce-mvp'
  );
  const [notes, setNotes] = useState(
    milestone?.submission_notes || 'Production preview live on Vercel staging. 100% responsive across mobile and desktop. 18 automated Cypress & Jest tests passing with 99 Lighthouse performance score.'
  );

  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('Mutual agreement between Hirer and Talent to cancel scope.');

  if (!agreement || !milestone) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-slate-500">
        No active agreement found.
      </div>
    );
  }

  const nextAction = getAgreementNextAction(agreement, currentUser);
  const isHirer = currentUser.user_tag?.toLowerCase() === agreement.client_tag?.toLowerCase();
  const isTalent = currentUser.user_tag?.toLowerCase() === agreement.freelancer_tag?.toLowerCase();

  const handleFreelancerSubmit = (e) => {
    e.preventDefault();
    submitMilestone(agreement.id, milestone.id, {
      url: submissionUrl,
      repo: repoUrl,
      notes: notes,
      attachments: [
        { name: "Lighthouse_Audit_Performance_99.pdf", size: "1.4 MB", type: "pdf" },
        { name: "Integration_Verification_Report.pdf", size: "840 KB", type: "pdf" }
      ]
    });
  };

  const handleRequestRevision = (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      showToast("Notes Required", "Please provide detailed revision requests for the talent.", "error");
      return;
    }
    requestRevision(agreement.id, revisionNotes);
    setShowRevisionForm(false);
    setRevisionNotes('');
  };

  const handleMutualRefund = (e) => {
    e.preventDefault();
    issueMutualRefund(agreement.id, refundReason);
    setShowRefundForm(false);
  };

  const isApproved = agreement.status === 'Approved' || agreement.status === 'Released';
  const isRefunded = agreement.status === 'Refunded';
  const isSubmitted = agreement.status === 'Submitted';

  return (
    <div className="adminPage animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="pageHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow">Milestone Delivery & Verification</div>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px' }}>Work Inspection & Direct Escrow Release</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => setActiveView('details')}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            ← Back to Order
          </button>

          {/* Clean 2-Way Persona Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid var(--border)', padding: '3px 4px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', padding: '0 6px', fontWeight: '700' }}>ROLE:</span>
            <button
              type="button"
              onClick={() => setCurrentRole('client')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '0',
                background: currentRole === 'client' ? 'var(--dark)' : 'transparent',
                color: currentRole === 'client' ? '#fff' : 'var(--muted)',
                fontWeight: currentRole === 'client' ? '700' : 'normal',
                cursor: 'pointer'
              }}
            >
              Hirer (@davidvance)
            </button>
            <button
              type="button"
              onClick={() => setCurrentRole('freelancer')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '0',
                background: currentRole === 'freelancer' ? 'var(--dark)' : 'transparent',
                color: currentRole === 'freelancer' ? '#fff' : 'var(--muted)',
                fontWeight: currentRole === 'freelancer' ? '700' : 'normal',
                cursor: 'pointer'
              }}
            >
              Talent (@amaraokafor)
            </button>
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      {nextAction && (
        <div 
          style={{
            background: nextAction.isMyTurn ? '#F0F7FF' : '#F8FAFC',
            border: `1px solid ${nextAction.isMyTurn ? '#BAE6FD' : '#E2E8F0'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span 
                  className={nextAction.isMyTurn ? 'tag tagGreen' : 'tag'} 
                  style={{ 
                    background: nextAction.isMyTurn ? '#0055FF' : '#64748B', 
                    color: '#fff', 
                    fontWeight: 700 
                  }}
                >
                  {nextAction.isMyTurn ? '👉 YOUR TURN TO ACT' : '⏳ WAITING ON COUNTERPARTY'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                  Agreement: {agreement.id} · ${agreement.total_amount?.toFixed(2)} USD
                </span>
              </div>
              <b style={{ fontSize: '14px', color: 'var(--dark)' }}>{nextAction.headline}</b>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0', lineHeight: 1.5 }}>
                {nextAction.description}
              </p>
            </div>

            {isSubmitted && isHirer && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowRevisionForm(true)}
                  style={{
                    fontSize: '11px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#fff',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  onClick={() => approveMilestone(agreement.id, milestone.id)}
                  style={{
                    fontSize: '11px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 0,
                    background: 'var(--green)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  Approve & Release to Talent ($500)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revision Request Form Modal/Card */}
      {showRevisionForm && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#92400E' }}>Request Milestone Modifications</h3>
          <p style={{ fontSize: '11px', color: '#B45309', margin: '0 0 12px', lineHeight: 1.5 }}>
            Specify what adjustments are needed before you release the funds. Talent will be notified and status will return to Active.
          </p>
          <form onSubmit={handleRequestRevision} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              required
              rows={3}
              placeholder="e.g. Please update the mobile navigation breakpoint on iPad and check the cart quantity increment button."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #FCD34D',
                fontSize: '12px',
                background: '#fff'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowRevisionForm(false)}
                style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #FCD34D', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 0, background: '#D97706', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Send Revision Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mutual Refund Modal/Card */}
      {showRefundForm && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', background: '#FEF2F2', borderColor: '#FECACA' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#991B1B' }}>Mutual Agreement Refund</h3>
          <p style={{ fontSize: '11px', color: '#B91C1C', margin: '0 0 12px', lineHeight: 1.5 }}>
            Executing a refund returns the locked $500 escrow deposit back to the Hirer's shielded Zcash wallet. Both parties can agree to close the transaction.
          </p>
          <form onSubmit={handleMutualRefund} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              required
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                fontSize: '12px',
                background: '#fff'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowRefundForm(false)}
                style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 0, background: '#DC2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Mutual Refund to Hirer ($500)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Talent Submission & Hirer Inspection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Talent Delivery Form */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Talent Delivery Form</h2>
            </div>
            <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
              {agreement.freelancer_tag || '@amaraokafor'}
            </span>
          </div>

          <form onSubmit={handleFreelancerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Live Production URL (Staging / Deployed App) *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  required
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://your-preview.vercel.app"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Source Code Repository (GitHub / GitLab)
              </label>
              <div className="relative">
                <Code2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Delivery Documentation & Test Coverage Notes *
              </label>
              <textarea
                required
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail what was built, testing steps, environment variables, etc."
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors resize-none shadow-xs leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Lighthouse_Audit_Report.pdf (99 Score)</span>
              </div>
              <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Verified</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {isSubmitted ? 'Deliverables already submitted · Re-submit to update' : 'Deliverables ready for inspection'}
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs"
              >
                {isSubmitted ? 'Update Deliverables' : 'Submit Milestone Deliverables'}
              </button>
            </div>
          </form>
        </div>

        {/* Hirer Inspection & Approval Panel */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Hirer Inspection Workspace</h2>
            </div>
            <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md">
              {agreement.client_tag || '@davidvance'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[10px]">Submitted Deliverables</span>
              <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Live Staging Ready</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Vercel Production Preview</span>
                </div>
                <a 
                  href={submissionUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-700" />
                  <span className="font-semibold text-slate-900">GitHub Code Repository</span>
                </div>
                <a 
                  href={repoUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                >
                  <span>Inspect Commits</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Talent Submission Notes:</strong>
              {notes}
            </div>
          </div>

          {/* Decision Controls */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Escrow Status:</span>
              <strong className="font-mono text-slate-900">${agreement.total_amount?.toFixed(2)} USD (Shielded)</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowRevisionForm(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Request Revisions</span>
              </button>

              <button
                type="button"
                onClick={() => approveMilestone(agreement.id, milestone.id)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Release ($500)</span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRefundForm(true)}
                style={{ fontSize: '11px', color: '#DC2626', background: 'transparent', border: 0, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Mutual Agreement Refund to Hirer
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
