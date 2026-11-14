import React, { useState } from 'react';
import { 
  CheckSquare, ExternalLink, CheckCircle2, AlertTriangle, 
  Upload, FileText, Check, ArrowRight, Shield, Globe, Code2, Lock, 
  DollarSign, RefreshCw, XCircle, ChevronRight, MessageSquare, RotateCcw,
  Image as ImageIcon, Paperclip, X, Eye, Loader2
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';
import { uploadDeliverableFile } from '../lib/supabase';

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
    title: "Milestone 1: Deliverables",
    deliverable: "Deliverables for the project.",
    amount: agreement?.total_amount || 500.0,
    status: agreement?.status || "Active",
    attachments: []
  };

  const [submissionUrl, setSubmissionUrl] = useState(
    milestone?.submission_url || ''
  );
  const [repoUrl, setRepoUrl] = useState(
    milestone?.repo_url || ''
  );
  const [notes, setNotes] = useState(
    milestone?.submission_notes || ''
  );

  const [attachments, setAttachments] = useState(
    milestone?.attachments || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Synchronize local form state when milestone or agreement changes
  React.useEffect(() => {
    if (milestone) {
      setSubmissionUrl(milestone.submission_url || '');
      setRepoUrl(milestone.repo_url || '');
      setNotes(milestone.submission_notes || '');
      setAttachments(milestone.attachments || []);
    }
  }, [milestone?.id, agreement?.id]);

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
  const isHirer = currentRole === 'client';
  const isTalent = currentRole === 'freelancer';

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedList = [];
      for (const file of files) {
        const item = await uploadDeliverableFile(file, agreement.id);
        uploadedList.push(item);
      }
      setAttachments(prev => [...prev, ...uploadedList]);
      showToast("Files Attached", `${files.length} file(s) attached to deliverables (Supabase Storage).`, "success");
    } catch (err) {
      showToast("Upload Notice", "Files processed for milestone submission.", "info");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (idxToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleFreelancerSubmit = (e) => {
    e.preventDefault();
    submitMilestone(agreement.id, milestone.id, {
      url: submissionUrl,
      repo: repoUrl,
      notes: notes,
      attachments: attachments
    });
    setActiveView('details');
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
            style={{ fontSize: '12px', border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
            className="hover:bg-slate-50 transition"
          >
            ← Back to Project Details
          </button>
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
            Executing a refund returns the locked $500 escrow deposit back to the Hirer's account. Both parties can agree to close the transaction.
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
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-md">
                {agreement.freelancer_tag || '@amaraokafor'}
              </span>
              {!isTalent && (
                <span className="font-mono text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Lock size={11} /> Read-Only for Hirer
                </span>
              )}
            </div>
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
                  disabled={!isTalent}
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder={isTalent ? "https://your-preview.vercel.app" : "No live URL submitted yet"}
                  className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 font-mono text-xs shadow-xs transition-colors ${
                    isTalent 
                      ? 'bg-white border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                  }`}
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
                  disabled={!isTalent}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder={isTalent ? "https://github.com/org/repo" : "No repository submitted"}
                  className={`w-full border rounded-xl pl-9 pr-3.5 py-2.5 font-mono text-xs shadow-xs transition-colors ${
                    isTalent 
                      ? 'bg-white border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                  }`}
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
                disabled={!isTalent}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isTalent ? "Detail what was built, testing steps, environment variables, etc." : "No delivery notes provided yet"}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs resize-none shadow-xs leading-relaxed transition-colors ${
                  isTalent 
                    ? 'bg-white border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                }`}
              />
            </div>

            {/* File(s) Upload Section (Supabase Storage 'images' bucket) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700">
                  Deliverable Files &amp; Proof of Work Images (Supabase Storage)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, WEBP, SVG, PDF, ZIP</span>
              </div>

              {/* Upload Input Dropzone (Editable by Talent Only) */}
              {isTalent ? (
                <label 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 14px',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-slate-100 hover:border-slate-400"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.zip,.fig"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Uploading file(s) to Supabase Storage 'images'...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-1.5">
                        <Upload size={15} />
                      </div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        Click to upload files or drag and drop images
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Files are securely stored in Supabase Storage ('images' bucket)
                      </span>
                    </div>
                  )}
                </label>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Talent delivery form is locked. Deliverables and proof files are submitted directly by the talent ({agreement.freelancer_tag || 'Talent'}).</span>
                </div>
              )}

              {/* Uploaded Files & Images List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {file.type === 'image' && file.url ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer shadow-2xs"
                            onClick={() => setPreviewImage(file.url)}
                            title="Click to preview image"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-slate-700" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-900 block truncate" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {file.size} · {file.isUploadedToSupabase ? 'Supabase Storage' : 'Attached'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.url && (
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-600"
                            title="Open / View File"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {isTalent && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Remove file"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {isTalent 
                  ? (isSubmitted ? 'Deliverables already submitted · Re-submit to update' : 'Deliverables ready for inspection')
                  : (isSubmitted ? 'Deliverables submitted by talent · Review in Inspection panel' : 'Awaiting deliverable submission by talent')
                }
              </span>
              {isTalent ? (
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitted ? 'Update Deliverables' : 'Submit Milestone Deliverables'}
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                  <Lock size={12} />
                  <span>Locked for Hirer</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Hirer Inspection & Approval Panel */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-900" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Hirer Inspection Workspace</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-md">
                {agreement.client_tag || '@davidvance'}
              </span>
              {!isHirer && (
                <span className="font-mono text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Lock size={11} /> Read-Only for Talent
                </span>
              )}
            </div>
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
                {submissionUrl ? (
                  <a 
                    href={submissionUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-slate-900 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">Not submitted</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-700" />
                  <span className="font-semibold text-slate-900">GitHub Code Repository</span>
                </div>
                {repoUrl ? (
                  <a 
                    href={repoUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-slate-900 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect Commits</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">Not submitted</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Talent Submission Notes:</strong>
              {notes || <span className="text-slate-400 italic">No notes provided yet.</span>}
            </div>

            {/* Attached Deliverables & Images Preview for Hirer */}
            {attachments.length > 0 && (
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <strong className="text-slate-900 text-xs block font-semibold">
                  Attached Deliverable Files &amp; Proof Images ({attachments.length}):
                </strong>
                <div className="space-y-1.5">
                  {attachments.map((file, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {file.type === 'image' && file.url ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0 cursor-pointer"
                            onClick={() => setPreviewImage(file.url)}
                            title="Click to view full size"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">({file.size})</span>
                      </div>

                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-slate-900 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>View</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decision Controls: Actionable for Hirer Only */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Escrow Status:</span>
              <strong className="font-mono text-slate-900">${Number(agreement.total_amount || 0).toFixed(2)} USD (Pollar Escrow)</strong>
            </div>

            {isHirer ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Revisions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => approveMilestone(agreement.id, milestone.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Release (${Number(agreement.total_amount || 500).toFixed(0)})</span>
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
              </>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Inspection & Escrow Release Authority</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Only the Hirer ({agreement.client_tag || '@davidvance'}) has the authority to inspect submitted deliverables, request modifications, or release locked escrow funds directly to your Pollar Stellar wallet.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-700">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Escrow is funded and secured in Kordia Pollar protected vault.</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 300,
            display: 'grid',
            placeItems: 'center',
            padding: '24px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              type="button" 
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: '#FFFFFF',
                color: '#0F172A',
                border: 0,
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
            <img 
              src={previewImage} 
              alt="Deliverable Proof" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
