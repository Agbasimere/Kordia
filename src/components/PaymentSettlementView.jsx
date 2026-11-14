import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, ShieldCheck, ArrowRight, Wallet, 
  ExternalLink, Check, Copy, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';

export default function PaymentSettlementView() {
  const { 
    getActiveAgreement, 
    executePollarPayout, 
    setActiveView, 
    showToast,
    getRoleWallet
  } = useAgreement();

  const agreement = getActiveAgreement();
  const [isExecutingPayout, setIsExecutingPayout] = useState(false);
  const [payoutStep, setPayoutStep] = useState(0);

  if (!agreement) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-slate-500">
        No active agreement selected for settlement.
      </div>
    );
  }

  const amountUsd = agreement.total_amount || 500;
  const protocolFeeUsd = +(amountUsd * 0.005).toFixed(2);
  const netSettlementUsd = +(amountUsd - protocolFeeUsd).toFixed(2);
  const talentWallet = getRoleWallet('freelancer') || agreement.payout?.recipient_wallet || "GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU";

  const handleSimulatePayout = async () => {
    setIsExecutingPayout(true);
    setPayoutStep(1);

    setTimeout(() => {
      setPayoutStep(2);
    }, 900);

    setTimeout(() => {
      setPayoutStep(3);
    }, 1800);

    setTimeout(async () => {
      setPayoutStep(4);
      executePollarPayout(agreement.id);
      setIsExecutingPayout(false);
      showToast("Payout Completed", `Disbursed $${netSettlementUsd.toFixed(2)} USDC directly to Talent's Stellar wallet.`, "success");
    }, 2800);
  };

  const isReleased = agreement.status === 'Released';
  const isPaidOut = agreement.payout?.status === 'PAYOUT_COMPLETED' || payoutStep === 4;

  return (
    <div style={{ maxWidth: '1420px', margin: '0 auto', padding: '24px 32px 60px', width: '100%', boxSizing: 'border-box' }} className="animate-in fade-in duration-150">
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Stellar Horizon Testnet Rails
          </span>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Pollar Stellar Wallet Settlement
          </h1>
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
          <span className="badge-emerald px-2.5 py-1 rounded-md text-[11px] font-bold">
            Stellar Testnet Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Agreement & Escrow Vault Summary */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Contract</span>
              <span className="badge font-mono text-[11px]">{agreement.id}</span>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{agreement.title}</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{agreement.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Funder (Hirer):</span>
                <b className="font-mono text-slate-900">{agreement.client_tag}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Talent Beneficiary:</span>
                <b className="font-mono text-slate-900">{agreement.freelancer_tag}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Capital:</span>
                <span className="font-mono font-bold text-slate-900">${amountUsd.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Status:</span>
                <span className="font-bold text-emerald-700">{agreement.status}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 bg-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <b className="text-slate-900">Pollar Smart Escrow Guarantee</b>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Escrow funds are held in non-custodial smart contracts and disbursed directly to the talent's Pollar Stellar wallet upon milestone approval.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pollar Stellar Wallet Settlement */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Stellar Embedded Wallet Settlement</h2>
              </div>
              <span className="badge-emerald px-2 py-0.5 rounded-full text-[10px] font-bold">
                100% USDC Trustline
              </span>
            </div>

            {/* Settlement Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Asset:</span>
                <b className="text-slate-900 font-mono">USDC (Stellar Testnet)</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pegged Value:</span>
                <span className="font-semibold text-emerald-700">1.00 USDC = $1.00 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Escrow Release:</span>
                <span className="font-mono text-slate-900 font-bold">${amountUsd.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol Fee (0.5%):</span>
                <span className="font-mono text-slate-500">-${protocolFeeUsd.toFixed(2)} USDC</span>
              </div>

              <div className="h-px bg-slate-200 my-1" />

              <div className="flex justify-between items-center">
                <div>
                  <b className="text-slate-900 text-xs block">Net Payout to Talent:</b>
                  <small className="text-slate-400">Direct to Stellar Wallet</small>
                </div>
                <strong className="text-lg font-extrabold text-emerald-700 font-mono">
                  ${netSettlementUsd.toFixed(2)} USDC
                </strong>
              </div>
            </div>

            {/* Stellar Wallet Destination Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 bg-white">
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary Tag:</span>
                <b className="font-mono text-slate-900">{agreement.freelancer_tag || '@amaraokafor'}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Chain:</span>
                <b className="text-slate-900">Stellar Horizon Testnet</b>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Stellar Embedded Public Key:</span>
                <span className="font-mono font-semibold text-slate-900 text-[11px] block break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {talentWallet}
                </span>
              </div>
            </div>

            {/* Payout Action */}
            <div className="pt-2">
              {isPaidOut ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <b className="text-emerald-900 text-xs block font-bold">
                    ✓ Escrow Payout Disbursed to Stellar Wallet
                  </b>
                  <small className="text-emerald-700 text-[11px] block font-mono break-all">
                    Ref: {agreement.payout?.provider_reference || 'POL-PAY-STELLAR'} · Settled on Stellar Testnet
                  </small>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!isReleased || isExecutingPayout}
                  onClick={handleSimulatePayout}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {!isReleased 
                    ? 'Payout Locked (Milestone Requires Hirer Approval First)' 
                    : isExecutingPayout 
                    ? 'Settling on Stellar Horizon...' 
                    : `Disburse Pollar Payout ($${netSettlementUsd.toFixed(2)} USDC)`}
                </button>
              )}

              {isExecutingPayout && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-emerald-800 text-[11px]">
                    <span>Stellar Settlement Pipeline:</span>
                    <span>Stage {payoutStep} of 4</span>
                  </div>
                  <div className={payoutStep >= 1 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 1. Releasing escrow deposit from Pollar vault
                  </div>
                  <div className={payoutStep >= 2 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 2. Verifying talent's Stellar USDC trustline
                  </div>
                  <div className={payoutStep >= 3 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 3. Dispatching payment to Stellar Horizon testnet
                  </div>
                  <div className={payoutStep >= 4 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 4. Confirmed on Stellar Ledger
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
