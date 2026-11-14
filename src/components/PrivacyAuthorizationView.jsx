import React, { useState } from 'react';
import { 
  Shield, Lock, Key, Eye, EyeOff, CheckCircle2, AlertCircle, 
  HelpCircle, Layers, Cpu, Users, FileCheck, ArrowRight,
  ShieldCheck, Check, X
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { USERS } from '../data/mockData';

export default function PrivacyAuthorizationView() {
  const { getActiveAgreement, showToast, setActiveView } = useAgreement();
  const agreement = getActiveAgreement();

  const [disclosureMode, setDisclosureMode] = useState('public');

  const [party1Signed, setParty1Signed] = useState(agreement?.authorizations?.[0]?.approved || false);
  const [party2Signed, setParty2Signed] = useState(agreement?.authorizations?.[1]?.approved || true);

  const totalSigned = (party1Signed ? 1 : 0) + (party2Signed ? 1 : 0);
  const isThresholdMet = totalSigned === 2;

  const handleToggleSign = (party, setter, currentVal) => {
    setter(!currentVal);
    showToast(
      !currentVal ? "Cryptographic Signature Added" : "Signature Revoked",
      `${party} ${!currentVal ? 'signed authorization payload' : 'withdrew signature'}.`,
      "info"
    );
  };

  return (
    <div className="adminPage animate-in fade-in duration-150">
      <div className="pageHead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow">Cryptographic privacy</div>
          <h1 style={{ margin: '4px 0 0', fontSize: '26px' }}>Zero-knowledge proofs & peer-to-peer consensus</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            onClick={() => setActiveView('details')}
            style={{ fontSize: '11px', border: '1px solid var(--border)', background: '#fff', padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}
          >
            ← Back to Order
          </button>
          <span className="tag tagGreen">Halo 2 ZK-SNARKs</span>
          <span className="tag" style={{ background: '#F3F5FF', color: 'var(--blue)' }}>Direct 2-Party Consensus</span>
        </div>
      </div>

      {/* ================= SECTION 1: ZCASH ORCHARD SHIELDED PRIVACY ================= */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Zcash Shielded Financial Privacy (Orchard Pool)</h2>
          </div>
          <span className="badge-emerald px-2.5 py-1 rounded-full text-xs font-bold">Zero-Knowledge Active</span>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Transparent */}
          <div className="p-4 rounded-xl bg-slate-50 border border-rose-100 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <b className="text-rose-700 flex items-center gap-1.5">
                <X className="w-4 h-4" />
                Transparent Public Blockchains (Ethereum / Bitcoin)
              </b>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">Exposed</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-rose-200 font-mono text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <div className="text-rose-600 font-bold">Public Explorer Data:</div>
              <div>Sender: 0x8a92...4b12 ($42,850.12 total balance)</div>
              <div>Recipient: 0x3f11...99e1 ($1,240.00 total balance)</div>
              <div>Amount Transferred: 500.00 USDC</div>
              <div>History: 142 previous transfers visible to competitors</div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Anyone with an internet connection can look up the client's total corporate balance and trace all payments made to overseas developers.
            </p>
          </div>

          {/* Shielded */}
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <b className="text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Kordia Private Escrow (Zcash Orchard Pool)
              </b>
              <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Protected</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 space-y-1.5 leading-relaxed">
              <div className="text-emerald-700 font-bold">Shielded On-Chain State:</div>
              <div>Sender Address: [SHIELDED · ORCHARD POOL]</div>
              <div>Recipient Address: [SHIELDED · ORCHARD POOL]</div>
              <div>Amount Transferred: [CONFIDENTIAL · ZERO-KNOWLEDGE]</div>
              <div>ZK Proof: Halo 2 Recursive Proof (Valid & Verified)</div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Only the sender and recipient know the transfer amount. Public network observers see zero balances, zero history, and zero party identities.
            </p>
          </div>

        </div>

        {/* Viewing Keys Demo */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Selective Viewing Keys</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliance without total disclosure. Share read-only audit keys with accountants or regulators without revealing other transactions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDisclosureMode('public')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  disclosureMode === 'public' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Public Observer
              </button>
              <button
                type="button"
                onClick={() => setDisclosureMode('auditor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  disclosureMode === 'auditor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Authorized Viewing Key
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
              <span>LEDGER VISIBILITY MODE: {disclosureMode.toUpperCase()}</span>
              <span>ZCASH NETWORK BLOCK: #2891042</span>
            </div>

            {disclosureMode === 'public' ? (
              <div className="space-y-1 text-slate-400 py-1">
                <div>txid: 0x8fa4b9319e76fca55301bcde99a43928174e92a83fbb092305829d4c1</div>
                <div>pool: Orchard Shielded Action (2 actions, valueBalance: 0)</div>
                <div>zk_proof: 0x09ff7b21...982b14 (Halo 2 PLONKish verification: PASS)</div>
                <div className="text-amber-400">shielded_memo: [ENCRYPTED CIPHERTEXT · 512 BYTES]</div>
                <div className="text-slate-500 italic">No counterparty or financial amount disclosed to public observer.</div>
              </div>
            ) : (
              <div className="space-y-1 text-emerald-400 py-1">
                <div>viewing_key: zxviews29182736451029384756102938475619283746501928374652019283</div>
                <div>decrypted_memo: {agreement.escrow.shielded_memo}</div>
                <div>decrypted_amount: {agreement.escrow.deposit_amount} ZEC ($500.00 USD value)</div>
                <div>contract_id: {agreement.id}</div>
                <div>milestone_deliverable: {agreement.milestones[0].title}</div>
                <div>escrow_status: LOCKED & PEER-PROTECTED</div>
                <div>consensus_policy: 2-of-2 Mutual Consensus Active</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: 2-OF-2 PEER-TO-PEER AUTHORIZATION ================= */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Direct Peer-to-Peer Consensus (2-of-2 Model)</h2>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isThresholdMet ? 'badge-emerald' : 'badge-amber'
          }`}>
            {totalSigned} of 2 Signatures ({isThresholdMet ? 'Consensus Satisfied' : 'Pending'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Party 1: Hirer (Client) */}
          <div className={`p-4 rounded-xl border transition-all ${
            party1Signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="badge-blue px-2 py-0.5 rounded text-[10px] font-bold">Hirer Node</span>
              <strong className={`text-[10px] ${party1Signed ? 'text-emerald-700' : 'text-slate-400'}`}>
                {party1Signed ? '✓ SIGNED' : 'STANDBY'}
              </strong>
            </div>
            <b className="text-slate-900 text-xs block">{USERS.client.name}</b>
            <small className="text-slate-500 text-[11px] block">{USERS.client.company}</small>

            <button
              type="button"
              onClick={() => handleToggleSign('Hirer', setParty1Signed, party1Signed)}
              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                party1Signed 
                  ? 'bg-white border border-slate-200 text-rose-600 hover:bg-slate-50' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {party1Signed ? 'Revoke Signature' : 'Sign Release (Hirer)'}
            </button>
          </div>

          {/* Party 2: Talent (Freelancer) */}
          <div className={`p-4 rounded-xl border transition-all ${
            party2Signed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-bold">Talent Node</span>
              <strong className={`text-[10px] ${party2Signed ? 'text-emerald-700' : 'text-slate-400'}`}>
                {party2Signed ? '✓ SIGNED' : 'STANDBY'}
              </strong>
            </div>
            <b className="text-slate-900 text-xs block">{USERS.freelancer.name}</b>
            <small className="text-slate-500 text-[11px] block">{USERS.freelancer.title}</small>

            <button
              type="button"
              onClick={() => handleToggleSign('Talent', setParty2Signed, party2Signed)}
              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                party2Signed 
                  ? 'bg-white border border-slate-200 text-rose-600 hover:bg-slate-50' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {party2Signed ? 'Revoke Signature' : 'Sign Release (Talent)'}
            </button>
          </div>

        </div>

        {/* Progress Bar & Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700">Consensus Signing Progress:</span>
            <span className={isThresholdMet ? 'text-emerald-700' : 'text-amber-700'}>
              {totalSigned} of 2 required signatures ({Math.round((totalSigned / 2) * 100)}%)
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isThresholdMet ? 'bg-emerald-600' : 'bg-amber-500'}`}
              style={{ width: `${(totalSigned / 2) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{isThresholdMet ? '✓ Escrow release payload authorized for clearing.' : 'Waiting on both parties to sign before release execution.'}</span>
            <strong className={isThresholdMet ? 'text-emerald-700' : 'text-amber-700'}>
              {isThresholdMet ? 'RELEASE UNLOCKED' : 'RELEASE LOCKED'}
            </strong>
          </div>
        </div>
      </div>

    </div>
  );
}
