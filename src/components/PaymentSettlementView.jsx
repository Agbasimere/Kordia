import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Shield, Lock, DollarSign, ArrowRight, ExternalLink, 
  CheckCircle2, RefreshCw, AlertCircle, Building2, User, ChevronRight,
  Clock, QrCode, ArrowDown, Landmark, Globe, Check
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { USERS, EXCHANGE_RATES } from '../data/mockData';
import { ZCASH_TESTNET_CONFIG, POLLAR_TESTNET_CONFIG, submitZcashTestnetTransaction, executePollarTestnetPayout } from '../lib/blockchainServices';

export default function PaymentSettlementView() {
  const { 
    getActiveAgreement, 
    executePollarPayout, 
    fundEscrow, 
    setActiveView,
    showToast 
  } = useAgreement();

  const agreement = getActiveAgreement();
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [isExecutingPayout, setIsExecutingPayout] = useState(false);
  const [payoutStep, setPayoutStep] = useState(0);
  const [quoteTimer, setQuoteTimer] = useState(894);
  const [customZecTx, setCustomZecTx] = useState('');
  const [isBroadcastingZec, setIsBroadcastingZec] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteTimer(prev => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!agreement) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-slate-500">
        No active agreement found.
      </div>
    );
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const amountUsd = agreement.total_amount || 500;
  const protocolFeeUsd = +(amountUsd * 0.005).toFixed(2);
  const netSettlementUsd = +(amountUsd - protocolFeeUsd).toFixed(2);

  const rates = {
    NGN: { rate: EXCHANGE_RATES.USD_NGN, symbol: '₦', name: 'Nigerian Naira (NGN)', bank: 'Guaranty Trust Bank (GTBank)' },
    KES: { rate: EXCHANGE_RATES.USD_KES, symbol: 'KSh', name: 'Kenyan Shilling (KES)', bank: 'Equity Bank Kenya' },
    GHS: { rate: EXCHANGE_RATES.USD_GHS, symbol: 'GH₵', name: 'Ghanaian Cedi (GHS)', bank: 'Ecobank Ghana' },
  };

  const currentFx = rates[selectedCurrency] || rates.NGN;
  const netLocal = (netSettlementUsd * currentFx.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleBroadcastZcash = async () => {
    setIsBroadcastingZec(true);
    try {
      const zecResult = await submitZcashTestnetTransaction({
        agreementId: agreement.id,
        amountUsd: amountUsd,
        amountZec: (amountUsd / EXCHANGE_RATES.ZEC_USD).toFixed(2),
        memo: agreement.escrow?.shielded_memo
      });
      fundEscrow(agreement.id);
      showToast("Zcash Testnet Confirmed", `Shielded Orchard deposit broadcasted. Block height #${zecResult.block_height}`, "success");
    } finally {
      setIsBroadcastingZec(false);
    }
  };

  const handleSimulatePayout = async () => {
    setIsExecutingPayout(true);
    setPayoutStep(1);

    setTimeout(() => {
      setPayoutStep(2);
    }, 1000);

    setTimeout(() => {
      setPayoutStep(3);
    }, 2000);

    setTimeout(async () => {
      setPayoutStep(4);
      await executePollarTestnetPayout({
        agreementId: agreement.id,
        amountUsd: amountUsd,
        beneficiaryName: USERS.freelancer.bank_details.account_name,
        bankName: currentFx.bank,
        accountNumber: USERS.freelancer.bank_details.account_number
      });
      executePollarPayout(agreement.id);
      setIsExecutingPayout(false);
    }, 3200);
  };

  const isReleased = agreement.status === 'Released';
  const isPaidOut = agreement.payout?.status === 'PAYOUT_COMPLETED' || payoutStep === 4;

  return (
    <div className="adminPage animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="pageHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow">Blockchain Testnet Infrastructure</div>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px' }}>Zcash Testnet & Pollar Clearing Rails</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => setActiveView('details')}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            ← Back to Order
          </button>
          <a
            href={ZCASH_TESTNET_CONFIG.faucet_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', textDecoration: 'none', color: 'var(--dark)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            <span>Zcash Testnet Faucet</span>
            <ExternalLink size={12} />
          </a>
          <span className="tag tagGreen">Zcash Orchard Testnet</span>
          <span className="tag" style={{ background: '#F3F5FF', color: 'var(--blue)' }}>Pollar Sandbox</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Shielded Escrow Funding Vault */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Shielded Zcash Testnet Vault</h2>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                agreement.escrow?.is_funded ? 'badge-emerald' : 'badge-amber'
              }`}>
                {agreement.escrow?.is_funded ? 'LOCKED IN ORCHARD POOL' : 'AWAITING SHIELDED DEPOSIT'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Network Consensus:</span>
                <span className="font-bold text-slate-900 font-mono">Zcash Testnet (NU5 / Halo 2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Value:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">${amountUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Orchard Shielded Asset:</span>
                <span className="font-bold text-emerald-700 font-mono">~{(amountUsd / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zero-Knowledge Proof:</span>
                <span className="font-semibold text-emerald-700">Halo 2 Recursive SNARK (Valid)</span>
              </div>

              <div className="h-px bg-slate-200" />

              <div>
                <small className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Shielded Encrypted Memo (Viewing Key Required)
                </small>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800">
                  {agreement.escrow?.shielded_memo}
                </div>
              </div>
            </div>

            {/* Live Testnet Explorer Reference */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center gap-3.5 bg-white">
              <div className="w-12 h-12 bg-slate-50 p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Shielded Testnet Tx Hash
                </span>
                <p className="text-xs font-mono text-emerald-700 font-semibold truncate mt-0.5">
                  {agreement.escrow?.tx_hash || '0x8fa4b9319e76fca55301bcde99a43928174e92a83fbb092305829d4c1'}
                </p>
                <a
                  href={`${ZCASH_TESTNET_CONFIG.explorer_tx_url}${agreement.escrow?.tx_hash || '0x8fa4b9319e76fca55301bcde99a43928174e92a83fbb092305829d4c1'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 mt-1"
                >
                  <span>Verify on Zcash Testnet Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {!agreement.escrow?.is_funded && (
              <button
                type="button"
                disabled={isBroadcastingZec}
                onClick={handleBroadcastZcash}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                {isBroadcastingZec ? 'Broadcasting to Zcash Testnet...' : 'Broadcast Shielded Escrow Deposit (12.5 ZEC)'}
              </button>
            )}
          </div>

          <div className="card text-xs text-slate-600 space-y-1" style={{ background: '#FAF8FF' }}>
            <b className="text-slate-900 block">Zcash PRD Principle:</b>
            <p className="leading-relaxed text-[11px]">
              Zcash shielded Orchard pools provide financial privacy by concealing transaction balances and counterparty histories. Viewing keys enable selective auditability for accounting and compliance.
            </p>
          </div>
        </div>

        {/* Right Column: Pollar Settlement & Bank Payout */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Pollar Sandbox Settlement Rail</h2>
              </div>
              <span className="badge-emerald px-2 py-0.5 rounded-full text-[10px] font-bold">
                Guaranteed Quote
              </span>
            </div>

            {/* Currency Selector */}
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(rates).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCurrency(c)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedCurrency === c 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block">{c}</span>
                  <small className={`text-[10px] font-mono ${selectedCurrency === c ? 'text-slate-300' : 'text-slate-400'}`}>
                    {rates[c].symbol}{rates[c].rate.toLocaleString()} / $
                  </small>
                </button>
              ))}
            </div>

            {/* Quote Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Executable Rate:</span>
                <b className="text-slate-900">1 USD = {currentFx.symbol}{currentFx.rate.toLocaleString()} {selectedCurrency}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quote Expiration:</span>
                <span className="font-semibold text-amber-700">Expires in {formatTimer(quoteTimer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Escrow Release:</span>
                <span className="font-mono text-slate-900 font-bold">${amountUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol Fee (0.5%):</span>
                <span className="font-mono text-slate-500">-${protocolFeeUsd.toFixed(2)} USD</span>
              </div>

              <div className="h-px bg-slate-200 my-1" />

              <div className="flex justify-between items-center">
                <div>
                  <b className="text-slate-900 text-xs block">Net Payout to Talent:</b>
                  <small className="text-slate-400">Via Pollar GTBank Rails</small>
                </div>
                <strong className="text-lg font-extrabold text-emerald-700 font-mono">
                  {currentFx.symbol}{netLocal} {selectedCurrency}
                </strong>
              </div>
            </div>

            {/* Bank Destination Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 bg-white">
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary Tag:</span>
                <b className="font-mono text-blue-700">{agreement.freelancer_tag || '@amaraokafor'}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Destination:</span>
                <b className="text-slate-900">{currentFx.bank}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Number:</span>
                <span className="font-mono font-semibold text-slate-900">{USERS.freelancer.bank_details.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Beneficiary:</span>
                <span className="font-bold text-slate-900">{USERS.freelancer.bank_details.account_name}</span>
              </div>
            </div>

            {/* Payout Action */}
            <div className="pt-2">
              {isPaidOut ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <b className="text-emerald-900 text-xs block font-bold">
                    ✓ Local Currency Payout Disbursed
                  </b>
                  <small className="text-emerald-700 text-[11px] block font-mono">
                    Ref: {agreement.payout?.transaction_reference || 'POL-NGN-781920-OK'} · Credited to GTBank account
                  </small>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!isReleased || isExecutingPayout}
                  onClick={handleSimulatePayout}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {!isReleased 
                    ? 'Payout Locked (Milestone Requires Hirer Approval First)' 
                    : isExecutingPayout 
                    ? 'Executing Pollar Bank Settlement...' 
                    : `Disburse Pollar Payout (${currentFx.symbol}${netLocal})`}
                </button>
              )}

              {isExecutingPayout && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-emerald-800 text-[11px]">
                    <span>Clearing Pipeline:</span>
                    <span>Stage {payoutStep} of 4</span>
                  </div>
                  <div className={payoutStep >= 1 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 1. Releasing shielded escrow from Orchard pool
                  </div>
                  <div className={payoutStep >= 2 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 2. Bridging to USDC stablecoin route
                  </div>
                  <div className={payoutStep >= 3 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 3. Routing through Pollar licensed local partner
                  </div>
                  <div className={payoutStep >= 4 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                    ✓ 4. Bank credit confirmed at Guaranty Trust Bank
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card text-xs text-slate-600 space-y-1" style={{ background: '#FAF8FF' }}>
            <b className="text-slate-900 block">Pollar Target Disclosure:</b>
            <p className="leading-relaxed text-[11px]">
              Pollar is the intended wallet and stablecoin infrastructure partner. Estimated amounts are clearly distinguished from executable quotes. Any ZEC-to-stablecoin conversion requires a supported swap or bridge route.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
