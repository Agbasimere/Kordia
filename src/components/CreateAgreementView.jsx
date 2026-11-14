import React, { useState } from 'react';
import { 
  FileText, Shield, DollarSign, Calendar, AlertCircle, 
  ArrowRight, Check, Users, Lock, CreditCard, ChevronRight, Award,
  Search, ShieldCheck, UserCheck
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';

export default function CreateAgreementView() {
  const { 
    createAgreement, 
    setActiveView, 
    getCurrentUser, 
    profiles, 
    searchVerifiedUsers,
    findUserByTag,
    showToast 
  } = useAgreement();

  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    counterparty_tag: currentUser.role === 'client' ? '@amaraokafor' : '@davidvance',
    title: 'Apex E-Commerce Platform & Checkout Integration',
    description: 'Build and deploy a privacy-compliant modern web storefront with product catalog, cart persistence, and mobile-optimized checkout for international clients.',
    category: 'Full-Stack Web Development',
    total_amount: '500',
    currency: 'USD',
    deadline: '2026-11-28',
    milestone_title: 'Milestone 1: Production Frontend & Responsive UI',
    milestone_deliverable: 'Next.js + Tailwind web application with responsive layout, product showcase, and live Vercel staging preview URL.',
    objection_window_days: '7'
  });

  const [tagQuery, setTagQuery] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const selectedCounterparty = findUserByTag(formData.counterparty_tag);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectTag = (tag) => {
    setFormData(prev => ({ ...prev, counterparty_tag: tag }));
    setShowTagDropdown(false);
  };

  const handleLoadTemplate = () => {
    setFormData(prev => ({
      ...prev,
      title: 'Full-Stack Web Application & API Integration',
      description: 'End-to-end responsive web application for client portal with responsive mobile view, automated tests, and production deployment on Vercel.',
      category: 'Full-Stack Web Development',
      total_amount: '500',
      currency: 'USD',
      deadline: '2026-11-30',
      milestone_title: 'Milestone 1: Frontend Architecture & Automated Tests',
      milestone_deliverable: 'Complete responsive React/Next.js frontend, test coverage report, and deployed staging URL.',
      objection_window_days: '7'
    }));
    showToast("Template Loaded", "Standard engineering escrow template populated.", "info");
  };

  const amountNum = parseFloat(formData.total_amount) || 0;
  const netUsd = (amountNum * 0.995).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    createAgreement(formData);
  };

  const availableCounterparties = Object.values(profiles).filter(
    u => u.user_tag !== currentUser.user_tag
  );

  return (
    <div className="adminPage animate-in fade-in duration-150">
      <div className="pageHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow">Escrow Agreement Form</div>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px' }}>Create Work Escrow Agreement</h1>
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
            onClick={handleLoadTemplate}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={13} />
            <span>Load Contract Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container (Left 2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: User Tagging & Parties */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">1. Counterparty Tagging</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tag Counterparty by Unique User Tag *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    name="counterparty_tag"
                    value={formData.counterparty_tag}
                    onChange={handleChange}
                    placeholder="e.g. @amaraokafor or @davidvance"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#F3F5FF', color: 'var(--blue)', fontWeight: 600, padding: '0 14px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Directory
                  </button>
                </div>

                {/* Verified user tag dropdown picker */}
                {showTagDropdown && (
                  <div style={{ marginTop: '8px', border: '1px solid var(--border)', borderRadius: '10px', background: '#fff', padding: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                      SELECT A VERIFIED COUNTERPARTY:
                    </small>
                    {availableCounterparties.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectTag(user.user_tag)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', background: formData.counterparty_tag === user.user_tag ? '#F3F5FF' : 'transparent' }}
                      >
                        <div>
                          <strong style={{ color: 'var(--blue)', fontFamily: 'monospace' }}>{user.user_tag}</strong>
                          <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>({user.name})</span>
                        </div>
                        <span className={user.is_verified ? 'tag tagGreen' : 'tag tagAmber'}>
                          {user.is_verified ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tagged User Card Confirmation */}
              {selectedCounterparty && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: selectedCounterparty.is_verified ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${selectedCounterparty.is_verified ? '#BBF7D0' : '#FDE68A'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--blue)' }}>
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <b style={{ color: 'var(--dark)' }}>{selectedCounterparty.name}</b>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--blue)' }}>{selectedCounterparty.user_tag}</span>
                      </div>
                      <small style={{ color: 'var(--muted)', display: 'block' }}>
                        {selectedCounterparty.company || selectedCounterparty.title} · {selectedCounterparty.location}
                      </small>
                    </div>
                  </div>

                  <span className={selectedCounterparty.is_verified ? 'tag tagGreen' : 'tag tagAmber'}>
                    {selectedCounterparty.is_verified ? '✓ Verified Account' : 'Pending Verification'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Project Scope */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">2. Project Information</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern E-Commerce Platform"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                  >
                    <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                    <option value="Smart Contract & Web3">Smart Contract & Web3</option>
                    <option value="UI/UX Architecture">UI/UX Architecture</option>
                    <option value="Security & Auditing">Security & Auditing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Milestone Completion Due Date *</label>
                  <input
                    type="date"
                    required
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope & Technical Deliverables *</label>
                <textarea
                  rows={3}
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors resize-none shadow-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Terms & Milestones */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">3. Milestone Deliverable & Amount</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Escrow Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold font-mono text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="USDC">USDC (Pollar Rails)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone 1 Title *</label>
                <input
                  type="text"
                  required
                  name="milestone_title"
                  value={formData.milestone_title}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deliverable Specification *</label>
                <textarea
                  rows={2}
                  required
                  name="milestone_deliverable"
                  value={formData.milestone_deliverable}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors resize-none shadow-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Direct Escrow Terms */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">4. Direct Escrow & Release Terms</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Escrow Protocol</label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
                  Kordia Pollar Escrow Vault
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hirer Inspection Window</label>
                <select
                  name="objection_window_days"
                  value={formData.objection_window_days}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                >
                  <option value="7">7 Days standard inspection</option>
                  <option value="14">14 Days extended inspection</option>
                  <option value="3">3 Days expedited sprint</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <strong>Direct Peer-to-Peer Consensus:</strong> Hirer inspects deliverables and authorizes release to Talent, or parties mutually agree on revisions or refund to Hirer. Funds are secured in Kordia Pollar protected escrow until release.
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Generate Agreement & Tag Counterparty
            </button>
          </div>
        </form>

        {/* Live Agreement Preview (Right) */}
        <div className="space-y-4">
          <div className="card sticky top-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escrow Agreement Summary</span>
              <span className="tag tagAmber">Awaiting Acceptance</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {formData.title || 'Untitled Agreement'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                {formData.description || 'No description provided'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Creator Tag:</span>
                <span className="font-mono font-bold text-slate-900">{currentUser.user_tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Counterparty Tag:</span>
                <span className="font-mono font-bold text-blue-700">{formData.counterparty_tag || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Amount:</span>
                <span className="font-bold text-slate-900 font-mono">${amountNum.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pollar Stellar Payout:</span>
                <span className="font-bold text-emerald-600 font-mono">{netUsd} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inspection Window:</span>
                <span className="text-slate-700">{formData.objection_window_days} Days</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              Once submitted, the agreement appears immediately on <strong>{formData.counterparty_tag}</strong>'s dashboard. Work begins upon freelancer acceptance and escrow deposit funding.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
