import React, { useState } from 'react';
import { 
  FileText, Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  ExternalLink, Copy, Check, Lock, DollarSign, Users, Award, 
  Share2, ChevronRight, Eye, AlertCircle, Building2, User,
  Globe, Code2, Scale
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { USERS, EXCHANGE_RATES } from '../data/mockData';
import AgreementTimelineTracker from './AgreementTimelineTracker';

export default function AgreementDetailsView() {
  const { 
    getActiveAgreement, 
    currentRole, 
    setCurrentRole, 
    setActiveView, 
    setActiveModal,
    acceptAgreement, 
    fundEscrow, 
    approveMilestone, 
    executePollarPayout, 
    findUserByTag,
    activityLogs,
    showToast 
  } = useAgreement();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showViewingKey, setShowViewingKey] = useState(false);

  const agreement = getActiveAgreement();
  if (!agreement) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F1F5F9', color: '#64748B', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <FileText size={24} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>
          No Agreement Selected
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px' }}>
          {currentRole === 'client' 
            ? 'Create a project agreement to begin escrow-protected milestones with talent.' 
            : 'Agreements will appear here once proposed by clients.'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveView('projects')}
            style={{ padding: '9px 18px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontSize: '13px', fontWeight: 600, border: 0, cursor: 'pointer' }}
          >
            Browse Projects
          </button>
          {currentRole === 'client' && (
            <button
              type="button"
              onClick={() => setActiveModal('create_project')}
              style={{ padding: '9px 18px', borderRadius: '8px', background: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 0, cursor: 'pointer' }}
            >
              Create Agreement
            </button>
          )}
        </div>
      </div>
    );
  }

  const client = findUserByTag(agreement.client_tag) || USERS.client;
  const freelancer = findUserByTag(agreement.freelancer_tag) || USERS.freelancer;
  const milestone = agreement.milestones?.[0] || {
    id: "ms-default",
    title: "Milestone 1: Deliverables & Specifications",
    deliverable: "Deliverables specification and preview deployment",
    amount: agreement.total_amount || 500.0,
    status: agreement.status
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(agreement.id);
    setCopiedId(true);
    showToast("Copied to Clipboard", `Agreement ID ${agreement.id} copied`, "info");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast("Shareable Link Copied", "Encrypted agreement invitation link copied.", "info");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const authSignaturesCount = agreement.authorizations?.filter(a => a.approved)?.length || 0;
  const agreementLogs = activityLogs
    .filter(l => l.agreement_id === agreement.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="adminPage animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="pageHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow">Escrow Agreement Overview</div>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px' }}>Agreement History & Transaction Tracking</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => setActiveView('dashboard')}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
          <button
            type="button"
            onClick={handleCopyId}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            {copiedId ? 'Copied ID' : 'Copy ID'}
          </button>
          <button
            type="button"
            onClick={handleCopyShareLink}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            {copiedLink ? 'Link Copied' : 'Share Deal'}
          </button>
        </div>
      </div>

      {/* Turn-by-Turn Action & Lifecycle Tracker */}
      <AgreementTimelineTracker agreement={agreement} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Overview & Milestone Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Agreement Overview Card */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {agreement.id} · {agreement.category}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                agreement.status === 'Released' ? 'badge-emerald' :
                agreement.status === 'Submitted' ? 'badge-blue' :
                agreement.status === 'Refunded' ? 'badge-rose' :
                agreement.status === 'Active' ? 'badge-emerald' : 'badge-amber'
              }`}>
                ● Status: {agreement.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {agreement.title}
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {agreement.description}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hirer (Client)</span>
                <b className="text-slate-900 block mt-0.5">{client.name}</b>
                <span className="font-mono text-[11px] text-blue-700 font-bold block">{agreement.client_tag || '@davidvance'}</span>
                <span className="text-[11px] text-slate-500">{client.company}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Talent (Freelancer)</span>
                <b className="text-slate-900 block mt-0.5">{freelancer.name}</b>
                <span className="font-mono text-[11px] text-blue-700 font-bold block">{agreement.freelancer_tag || '@amaraokafor'}</span>
                <span className="text-[11px] text-slate-500">{freelancer.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Escrow Value</span>
                <b className="text-slate-900 text-sm font-mono block mt-0.5">${agreement.total_amount.toFixed(2)} USD</b>
                <span className="text-[11px] text-emerald-700 font-medium font-mono">{agreement.total_amount.toFixed(2)} USDC via Pollar</span>
              </div>
            </div>
          </div>

          {/* Milestone Deliverable Card */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Milestone 1 Deliverables</h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                ${milestone.amount.toFixed(2)} USD
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">{milestone.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{milestone.deliverable}</p>
            </div>

            {/* Submission preview */}
            {milestone.submission_url ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Submitted Deliverables</span>
                  <span className="text-slate-400 text-[11px]">{milestone.submitted_at ? new Date(milestone.submitted_at).toLocaleDateString() : 'Active'}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Live Production Preview:</span>
                    <a href={milestone.submission_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 font-mono">
                      <span>{milestone.submission_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {milestone.repo_url && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Code Repository:</span>
                      <a href={milestone.repo_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 font-mono">
                        <span>{milestone.repo_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {milestone.submission_notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100 leading-relaxed">
                      <span className="font-bold text-slate-900">Notes: </span>
                      {milestone.submission_notes}
                    </div>
                  )}

                  {milestone.attachments?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-800 uppercase text-[10px] block">
                        Attached Files &amp; Proof Images ({milestone.attachments.length})
                      </span>
                      <div className="space-y-1">
                        {milestone.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-slate-700 truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                            </div>
                            {file.url && (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 font-mono text-[11px] shrink-0"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => setActiveView('submit_review')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Open Work Inspection & Release Panel</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Milestone work in progress. Deliverables will appear once submitted by the talent.
              </div>
            )}
          </div>

          {/* Chronological Agreement History & Audit Trail */}
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Agreement History Ledger</h3>
            
            <div className="space-y-3">
              {agreementLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b className="text-slate-900 block">{log.action}</b>
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#0F172A', fontWeight: 600, background: '#fff', padding: '1px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                        {log.actor}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {agreementLogs.length === 0 && (
                <div className="text-slate-500 text-xs text-center py-4">
                  No activity entries recorded yet for this agreement.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Escrow Settlement & Direct Consensus */}
        <div className="space-y-6">
          
          {/* Escrow Settlement Breakdown Card */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Escrow Settlement</h3>
              </div>
              <span className="badge-emerald px-2 py-0.5 rounded-full text-[10px] font-bold">
                Pollar Rails
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Escrow Deposit:</span>
                <span className="font-mono font-bold text-slate-900">${agreement.total_amount?.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol Fee (0.5%):</span>
                <span className="font-mono text-slate-500">-${(agreement.total_amount * 0.005).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Method:</span>
                <span className="font-mono text-emerald-700 font-semibold">Stellar Testnet (Pollar SDK)</span>
              </div>

              <div className="h-px bg-slate-100 my-1.5" />

              <div className="flex justify-between items-start">
                <div>
                  <b className="text-slate-900 text-xs block">Net Escrow Payout:</b>
                  <small className="text-slate-400">USDC on Stellar Testnet</small>
                </div>
                <div className="text-right">
                  <b className="text-emerald-700 font-mono text-base block font-extrabold">
                    ${(agreement.total_amount * 0.995).toFixed(2)} USDC
                  </b>
                  <small className="text-slate-400 font-mono">
                    {agreement.payout?.recipient_wallet ? `${agreement.payout.recipient_wallet.slice(0, 6)}...${agreement.payout.recipient_wallet.slice(-4)}` : 'Talent Stellar Wallet'}
                  </small>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Escrow Security</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Pollar Multi-Party Escrow</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Funds are held in non-custodial milestone escrow and disbursed automatically upon mutual sign-off.
              </p>
            </div>
          </div>

          {/* Direct 2-Party Consensus Signatures */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Direct P2P Consensus</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                authSignaturesCount >= 2 ? 'badge-emerald' : 'badge-amber'
              }`}>
                {authSignaturesCount}/2 Signed
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Neither party can seize funds unilaterally. Payout to Talent or refund to Hirer requires mutual agreement and authorized milestone release.
            </p>

            <div className="space-y-2">
              {agreement.authorizations?.map((auth, i) => (
                <div 
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    auth.approved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div>
                    <b className="capitalize text-slate-900 block">{auth.party === 'client' ? 'Hirer' : 'Talent'}</b>
                    <small className="text-slate-500">{auth.name}</small>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                    auth.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {auth.approved ? '✓ SIGNED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Agreement State:</span>
              <strong className={authSignaturesCount >= 2 ? 'text-emerald-700' : 'text-amber-700'}>
                {authSignaturesCount >= 2 ? 'Consensus Satisfied (2/2)' : 'Pending Signatures (1/2)'}
              </strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
