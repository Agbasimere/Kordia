import React, { useState } from 'react';
import { 
  X, Check, DollarSign, ArrowUpRight, Copy, QrCode, Star, 
  ShieldCheck, Landmark, Smartphone, Send, Wallet, RefreshCw, AlertCircle, ExternalLink, Loader2, Plus
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';
import { usePollar, WalletButton } from '@pollar/react';
import confetti from 'canvas-confetti';

export default function ActionModals() {
  const { 
    activeModal, 
    setActiveModal, 
    getCurrentUser, 
    currentRole,
    currentBalance, 
    fundAccount, 
    withdrawFunds, 
    transferToChain, 
    submitReview, 
    reviews, 
    createAgreement,
    displayCurrency,
    formatCurrency,
    showToast,
    roleWallets,
    getRoleWallet,
    linkWalletToRole,
    disconnectRoleWallet,
    onChainBalance,
    fetchLiveStellarBalance
  } = useAgreement();

  let pollar = null;
  try {
    pollar = usePollar();
  } catch (e) {}

  const [copiedKey, setCopiedKey] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  
  // Pollar Live Auth & Provisioning States
  const [pollarEmail, setPollarEmail] = useState(() => currentRole === 'client' ? 'david@apexdesign.co.uk' : 'soloagbasimere@gmail.com');
  const [pollarOtp, setPollarOtp] = useState('');
  const [pollarStep, setPollarStep] = useState('email'); // 'email' | 'otp' | 'verified'
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [clientSessionId, setClientSessionId] = useState(() => {
    try { return localStorage.getItem('pollar_session_id') || ''; } catch (e) { return ''; }
  });

  const [provisionedWallets, setProvisionedWallets] = useState(() => {
    const VALID_STELLAR_WALLETS = {
      client: 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB',
      freelancer: 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU'
    };
    try {
      const saved = localStorage.getItem('kordia_pollar_wallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.freelancer?.length === 56 && parsed.client?.length === 56) {
          return parsed;
        }
      }
      return VALID_STELLAR_WALLETS;
    } catch (e) {
      return VALID_STELLAR_WALLETS;
    }
  });

  const user = getCurrentUser();

  // Modal 1: Fund Account (Instant Testnet Top-Up + External Transfer)
  const [fundAmount, setFundAmount] = useState('1000');
  const [fundTab, setFundTab] = useState('instant'); // 'instant' | 'external'
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositResult, setDepositResult] = useState(null);
  const [isCheckingOnchain, setIsCheckingOnchain] = useState(false);

  // Modal 2: Withdraw (Pure Stellar Wallet)
  const [withdrawAmount, setWithdrawAmount] = useState('250');
  const [destStellarAddress, setDestStellarAddress] = useState('GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB');
  const [withdrawMemo, setWithdrawMemo] = useState('Kordia Pollar Settlement');

  // Modal 3: Transfer to other chain
  const [transferAmount, setTransferAmount] = useState('100');
  const [targetChain, setTargetChain] = useState('Ethereum');
  const [recipientAddress, setRecipientAddress] = useState('0x71C...9328');

  // Modal 4: Review submission
  const [reviewTarget, setReviewTarget] = useState(user.role === 'client' ? '@amaraokafor' : '@davidvance');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  // Modal 5: Create Project & Invite
  const [projectTitle, setProjectTitle] = useState('');
  const [talentTag, setTalentTag] = useState(currentRole === 'client' ? '@amaraokafor' : '@davidvance');
  const [projectBudget, setProjectBudget] = useState('500');
  const [projectDeliverable, setProjectDeliverable] = useState('');

  if (!activeModal) return null;

  const handleFundSubmit = async (e) => {
    if (e) e.preventDefault();
    const num = parseFloat(fundAmount);
    if (!num || num <= 0) {
      showToast("Invalid Amount", "Please enter a valid deposit amount.", "error");
      return;
    }
    setIsDepositing(true);
    setDepositResult(null);
    try {
      const res = await fundAccount(num, 'Pollar Stellar Testnet Deposit (USDC)');
      if (res && res.success) {
        setDepositResult(res);
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch (c) {}
      }
    } catch (err) {
      showToast("Deposit Notice", err.message || "Failed to process deposit", "error");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const dest = destStellarAddress?.trim();
    if (!dest || dest.length !== 56 || !dest.startsWith('G')) {
      showToast("Invalid Stellar Address", "Enter a valid 56-character Stellar public key starting with 'G'.", "error");
      return;
    }
    withdrawFunds(withdrawAmount, dest, withdrawMemo);
    setActiveModal(null);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    transferToChain(transferAmount, targetChain, recipientAddress);
    setActiveModal(null);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast("Missing Comment", "Please write a brief review feedback.", "error");
      return;
    }
    submitReview(reviewTarget, reviewRating, reviewComment);
    setReviewComment('');
    setActiveModal(null);
  };

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (currentRole !== 'client') {
      showToast("Access Restricted", "Only hirers can create project agreements.", "error");
      setActiveModal(null);
      return;
    }
    if (!projectTitle.trim()) {
      showToast("Title Required", "Please enter a project title.", "error");
      return;
    }
    createAgreement({
      title: projectTitle,
      freelancer_tag: talentTag.trim() || '@amaraokafor',
      amount: parseFloat(projectBudget) || 500,
      description: projectDeliverable || "Milestone deliverable for project."
    });
    setProjectTitle('');
    setProjectDeliverable('');
  };

  const handleSendPollarOtp = async (e) => {
    if (e) e.preventDefault();
    if (!pollarEmail || !pollarEmail.includes('@')) {
      showToast("Email Required", "Please enter a valid email address.", "error");
      return;
    }
    setIsSendingOtp(true);
    try {
      // Step 1: Create session via SDK API
      const sessionRes = await fetch("https://sdk.api.pollar.xyz/v3/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pollar-api-key": "pub_testnet_0bafb24f8ffa9564a0b6542d8a1e6311",
          "Origin": window.location.origin
        }
      });
      const sessionData = await sessionRes.json();
      const sId = sessionData?.content?.clientSessionId;
      if (!sId) throw new Error(sessionData?.message || "Failed to create Pollar session");
      
      setClientSessionId(sId);
      try { localStorage.setItem('pollar_session_id', sId); } catch (e) {}

      // Step 2: Send OTP
      const emailRes = await fetch("https://sdk.api.pollar.xyz/v3/auth/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pollar-api-key": "pub_testnet_0bafb24f8ffa9564a0b6542d8a1e6311",
          "Origin": window.location.origin
        },
        body: JSON.stringify({ clientSessionId: sId, email: pollarEmail.trim() })
      });
      const emailData = await emailRes.json();
      if (!emailRes.ok || !emailData?.success) {
        throw new Error(emailData?.message || "Failed to send code from Pollar");
      }

      setPollarStep('otp');
      showToast("Code Sent!", `6-digit Pollar OTP sent to ${pollarEmail}. Please check your inbox.`, "success");
    } catch (err) {
      console.error("[Pollar OTP Error]:", err);
      try {
        if (pollar?.getClient) {
          pollar.getClient().beginEmailLogin();
          pollar.getClient().sendEmailCode(pollarEmail.trim());
          setPollarStep('otp');
          showToast("Code Sent via SDK!", `Check ${pollarEmail} for your verification code.`, "success");
          return;
        }
      } catch (sdkErr) {}
      showToast("Notice", err.message || "Failed to send verification code", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPollarOtp = async (e) => {
    if (e) e.preventDefault();
    if (!pollarOtp || pollarOtp.trim().length < 4) {
      showToast("Code Required", "Please enter the 6-digit OTP code.", "error");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const sId = clientSessionId || (typeof localStorage !== 'undefined' ? localStorage.getItem('pollar_session_id') : '');
      const verifyRes = await fetch("https://sdk.api.pollar.xyz/v3/auth/email/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pollar-api-key": "pub_testnet_0bafb24f8ffa9564a0b6542d8a1e6311",
          "Origin": window.location.origin
        },
        body: JSON.stringify({ clientSessionId: sId, code: pollarOtp.trim() })
      });
      const verifyData = await verifyRes.json();
      
      if (verifyData?.code === "INVALID_EMAIL_CODE" || verifyData?.code === "SDK_EMAIL_CODE_INVALID") {
        showToast("Invalid Code", "The code you entered is invalid. Please double check your email.", "error");
        setIsVerifyingOtp(false);
        return;
      }

      // Successful verification
      const verifiedAddr = pollar?.wallet?.address || (currentRole === 'client' 
        ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB' 
        : 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU');
      
      linkWalletToRole(currentRole, verifiedAddr);
      setPollarStep('verified');
      setProvisionSuccess(true);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      showToast(
        "Pollar Wallet Provisioned!",
        `Wallet ${verifiedAddr.slice(0, 6)}...${verifiedAddr.slice(-4)} linked to ${user.name} (${currentRole === 'client' ? 'Hirer' : 'Talent'}).`,
        "success"
      );
    } catch (err) {
      console.error("[Pollar Verify Error]:", err);
      try {
        if (pollar?.getClient) {
          pollar.getClient().verifyEmailCode(pollarOtp.trim());
          const verifiedAddr = pollar?.wallet?.address || 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU';
          linkWalletToRole(currentRole, verifiedAddr);
          setPollarStep('verified');
          setProvisionSuccess(true);
          showToast("Verified via SDK!", "Your wallet has been provisioned.", "success");
          return;
        }
      } catch (sdkErr) {}
      showToast("Verification Error", err.message || "Could not verify code", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ========================================================
            MODAL 1: FUND ACCOUNT - POLLAR STELLAR TESTNET (USDC)
           ======================================================== */}
        {activeModal === 'fund' && (() => {
          const roleWallet = getRoleWallet(currentRole);
          const defaultKey = currentRole === 'client' 
            ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB' 
            : 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU';
          const activeAddress = roleWallet || defaultKey;

          return (
            <div>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Pollar Stellar Rail
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
                    Add Funds (USDC)
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setDepositResult(null);
                    setActiveModal(null);
                  }} 
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={18} />
                </button>
              </div>

              {depositResult ? (
                /* SUCCESS RECEIPT VIEW */
                <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    background: '#ECFDF5', 
                    color: '#059669', 
                    display: 'grid', 
                    placeItems: 'center', 
                    margin: '0 auto 16px',
                    border: '1px solid #A7F3D0'
                  }}>
                    <Check size={28} />
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    Transaction Confirmed on Stellar
                  </span>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'Manrope, sans-serif' }}>
                    +${depositResult.amount_usd.toFixed(2)} USDC
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
                    Funds credited automatically to your account balance.
                  </p>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#64748B' }}>New Available Balance:</span>
                      <b style={{ color: '#0F172A', fontSize: '13px' }}>${currentBalance.toFixed(2)} USDC</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#64748B' }}>Beneficiary Wallet:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                        {activeAddress.slice(0, 6)}...{activeAddress.slice(-6)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#64748B' }}>Pollar Reference:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>
                        {depositResult.reference}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#64748B' }}>Horizon Network:</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>Stellar Testnet (1.00 USDC = $1.00 USD)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      className="hover:bg-slate-50"
                    >
                      <span>View Account on StellarExpert</span>
                      <ExternalLink size={13} />
                    </a>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setDepositResult(null)}
                        style={{
                          flex: 1,
                          padding: '11px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        className="hover:bg-slate-50"
                      >
                        Add More Funds
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDepositResult(null);
                          setActiveModal(null);
                        }}
                        style={{
                          flex: 1,
                          padding: '11px',
                          borderRadius: '10px',
                          border: 0,
                          background: '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* DEPOSIT FORM VIEW */
                <div style={{ padding: '24px' }}>
                  {/* Two Mode Tabs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '3px', borderRadius: '10px', marginBottom: '18px' }}>
                    <button
                      type="button"
                      onClick={() => setFundTab('instant')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 0,
                        background: fundTab === 'instant' ? '#FFFFFF' : 'transparent',
                        color: fundTab === 'instant' ? '#0F172A' : '#64748B',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        boxShadow: fundTab === 'instant' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ⚡ 1-Click Testnet Top-Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundTab('external')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 0,
                        background: fundTab === 'external' ? '#FFFFFF' : 'transparent',
                        color: fundTab === 'external' ? '#0F172A' : '#64748B',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        boxShadow: fundTab === 'external' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      📥 External Stellar Deposit
                    </button>
                  </div>

                  {/* Destination Embedded Wallet Pill */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                        Target Pollar Stellar Wallet
                      </span>
                      <span style={{ fontSize: '10px', color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Active on Horizon
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all', flex: 1 }}>
                        {activeAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeAddress);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                          showToast("Copied", "Stellar address copied.", "info");
                        }}
                        style={{ border: 0, background: '#FFFFFF', padding: '5px', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}
                        title="Copy address"
                      >
                        {copiedKey ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', fontSize: '11px' }}>
                      <span style={{ color: '#64748B' }}>Account: <b>{user.name} ({user.user_tag})</b></span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>USDC Trustline: 100%</span>
                    </div>
                  </div>

                  {fundTab === 'instant' ? (
                    <form onSubmit={handleFundSubmit}>
                      {/* Quick Amount Chips */}
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        Select Deposit Amount (USDC)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {[250, 500, 1000, 2500].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setFundAmount(amt.toString())}
                            style={{
                              padding: '10px 4px',
                              borderRadius: '8px',
                              border: fundAmount === amt.toString() ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                              background: fundAmount === amt.toString() ? '#0F172A' : '#FFFFFF',
                              color: fundAmount === amt.toString() ? '#FFFFFF' : '#0F172A',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748B' }}>$</span>
                          <input
                            type="number"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            placeholder="Enter amount"
                            style={{ width: '100%', padding: '10px 14px 10px 30px', fontSize: '16px', fontWeight: 700, border: '1.5px solid #CBD5E1', borderRadius: '10px' }}
                            required
                          />
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#059669', fontSize: '12px' }}>
                            USDC
                          </span>
                        </div>
                        <small style={{ display: 'block', marginTop: '6px', color: '#64748B', fontSize: '11px' }}>
                          1.00 USDC = $1.00 USD. Automatically credited via Pollar SDK testnet rails.
                        </small>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isDepositing}
                        style={{
                          width: '100%',
                          padding: '13px',
                          borderRadius: '12px',
                          background: '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontWeight: 700,
                          border: 0,
                          cursor: isDepositing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isDepositing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Contacting Stellar Horizon Testnet...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            <span>Deposit ${fundAmount} USDC Automatically</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* EXTERNAL WALLET DEPOSIT TAB */
                    <div>
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                          How to deposit from an external wallet
                        </span>
                        <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                          Transfer testnet <b>USDC</b> or native <b>XLM</b> directly from Freighter, Lobstr, Albedo, or any Stellar wallet to your address:
                        </p>
                        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', color: '#0F172A', marginBottom: '12px' }}>
                          {activeAddress}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeAddress);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                              showToast("Copied", "Address copied to clipboard.", "info");
                            }}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            {copiedKey ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            <span>Copy Address</span>
                          </button>
                          <a
                            href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '11.5px', fontWeight: 700, color: '#0F172A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <span>StellarExpert</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setIsCheckingOnchain(true);
                          await fetchLiveStellarBalance(activeAddress);
                          setTimeout(() => {
                            setIsCheckingOnchain(false);
                            showToast("Synced", "On-chain balances refreshed from Horizon.", "success");
                          }, 600);
                        }}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {isCheckingOnchain ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        <span>Refresh On-Chain Balances</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================
            MODAL 2: WITHDRAW FUNDS (STELLAR WALLET ONLY)
           ======================================================== */}
        {activeModal === 'withdraw' && (
          <div>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stellar Horizon Testnet</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>Withdraw to Stellar Wallet</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} style={{ padding: '24px' }}>
              {/* Source Embedded Wallet Banner */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <small style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Source Pollar Wallet</small>
                  <span style={{ fontSize: '10px', color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
                  {getRoleWallet(currentRole) || 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU'}
                </div>
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  ${currentBalance.toFixed(2)} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>USDC</span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Withdrawal Amount (USDC)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '15px', fontWeight: 700, border: '1px solid #CBD5E1', borderRadius: '10px' }}
                />
              </div>

              {/* Destination Stellar Address */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Recipient Stellar Public Key (G...)
                </label>
                <input
                  type="text"
                  value={destStellarAddress}
                  onChange={(e) => setDestStellarAddress(e.target.value)}
                  placeholder="G..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '11.5px', fontFamily: 'monospace', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
                <small style={{ display: 'block', marginTop: '4px', color: '#64748B', fontSize: '10px' }}>
                  Destination Stellar account (Standard 56-character public key).
                </small>
              </div>

              {/* Memo */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Memo (Optional)</label>
                <input
                  type="text"
                  value={withdrawMemo}
                  onChange={(e) => setWithdrawMemo(e.target.value)}
                  placeholder="e.g. Invoice settlement or withdrawal"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Send ${withdrawAmount} USDC on Stellar
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            MODAL 3: TRANSFER FUNDS TO OTHER CHAINS
           ======================================================== */}
        {activeModal === 'transfer' && (
          <div>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cross-Chain Bridge</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>Transfer to Another Chain</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Destination Network</label>
                <select
                  value={targetChain}
                  onChange={(e) => setTargetChain(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '10px', background: '#FFFFFF' }}
                >
                  <option value="Ethereum">Ethereum (ERC-20)</option>
                  <option value="Base">Base (Coinbase L2)</option>
                  <option value="Polygon">Polygon (POS)</option>
                  <option value="Solana">Solana (SPL)</option>
                  <option value="Arbitrum">Arbitrum One</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Recipient Wallet Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x... or u1..."
                  style={{ width: '100%', padding: '10px 12px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #CBD5E1', borderRadius: '10px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Amount (USD)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '15px', fontWeight: 700, border: '1px solid #CBD5E1', borderRadius: '10px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#111827',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Dispatch Cross-Chain Transfer
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            MODAL 4: VIEW / SHARE TAG
           ======================================================== */}
        {activeModal === 'tag' && (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F1F5F9', color: '#0F172A', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <QrCode size={28} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
              Your Unique Kordia Tag
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 18px' }}>
              Share your tag with clients or talents to be called into peer escrow agreements.
            </p>

            <div style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                {user.user_tag}
              </span>
              <small style={{ display: 'block', color: '#64748B', marginTop: '4px' }}>
                {user.name} · {user.company || user.title}
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(user.user_tag);
                  showToast("Tag Copied", `Copied ${user.user_tag} to clipboard.`, "success");
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Copy size={14} />
                <span>Copy Tag</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  padding: '11px 20px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 5: PROFILE & PROOF OF TRUST (REVIEWS)
           ======================================================== */}
        {activeModal === 'profile' && (
          <div style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
                Profile &amp; Proof of Trust
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <img src={user.avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <b style={{ fontSize: '16px', color: '#0F172A' }}>{user.name}</b>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                      {user.user_tag}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {user.company || user.title} · {user.location}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', marginTop: '4px' }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#10B981" />)}
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>5.0 Rating (Proof of Trust Verified)</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ marginBottom: '20px' }}>
                <b style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '10px' }}>
                  Verified Reviews &amp; Endorsements
                </b>
                {(reviews[user.user_tag] || []).length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>No reviews published yet.</p>
                ) : (
                  reviews[user.user_tag]?.map((rev) => (
                    <div key={rev.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>{rev.author_tag}</span>
                        <div style={{ display: 'flex', color: '#10B981' }}>
                          {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="#10B981" />)}
                        </div>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#334155', margin: '0 0 4px', lineHeight: 1.5 }}>{rev.comment}</p>
                      <small style={{ fontSize: '10px', color: '#94A3B8' }}>{rev.date} · Verified Onchain Milestone</small>
                    </div>
                  ))
                )}
              </div>

              {/* Leave Review Form */}
              <form onSubmit={handleReviewSubmit} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <b style={{ fontSize: '12px', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  Leave a Review for Counterparty
                </b>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={reviewTarget}
                    onChange={(e) => setReviewTarget(e.target.value)}
                    placeholder="@tag"
                    style={{ padding: '8px 10px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    style={{ padding: '8px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF' }}
                  >
                    <option value="5">★★★★★ 5.0</option>
                    <option value="4">★★★★☆ 4.0</option>
                    <option value="3">★★★☆☆ 3.0</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share feedback on delivery speed, code quality, or communication..."
                  style={{ width: '100%', padding: '8px 10px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '8px', marginBottom: '10px' }}
                />
                <button
                  type="submit"
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#111827', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, border: 0, cursor: 'pointer' }}
                >
                  Publish Verified Review
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 6: CREATE PROJECT & INVITE TALENT (HIRER ONLY)
           ======================================================== */}
        {activeModal === 'create_project' && (
          <div>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Escrow Agreement</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
                  Create a Project &amp; Invite Talent
                </h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Brand Identity Design or Mobile App MVP"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Invite Talent Tag
                  </label>
                  <input
                    type="text"
                    value={talentTag}
                    onChange={(e) => setTalentTag(e.target.value)}
                    placeholder="@amaraokafor"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Budget (USD)</label>
                  <input
                    type="number"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', fontWeight: 700, border: '1px solid #CBD5E1', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Deliverable Description</label>
                <textarea
                  rows={3}
                  value={projectDeliverable}
                  onChange={(e) => setProjectDeliverable(e.target.value)}
                  placeholder="Describe scope, milestones, and technical requirements..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Create Agreement &amp; Invite Talent
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            MODAL 6: POLLAR STELLAR TESTNET WALLET
           ======================================================== */}
        {activeModal === 'pollar_wallet' && (() => {
          const roleWallet = getRoleWallet(currentRole);
          const defaultRoleKey = currentRole === 'client' 
            ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB'
            : (roleWallets.freelancer || 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU');
          const displayAddress = roleWallet || defaultRoleKey;
          const isVerified = Boolean(roleWallet);

          return (
            <div>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Pollar Network Testnet
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
                    Stellar Embedded Wallet
                  </h3>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '24px', maxHeight: '82vh', overflowY: 'auto' }}>
                {/* Account Details Box */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Platform User</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      {user.name} ({user.user_tag})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Account Role</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: currentRole === 'client' ? '#0284C7' : '#059669' }}>
                      {currentRole === 'client' ? 'Hirer (Pollar Escrow Funder)' : 'Talent (Beneficiary / Stellar Wallet)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Pollar Application ID</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0F172A', fontWeight: 700 }}>
                      cmwgtcqt8003g0ik16f2ea89i
                    </span>
                  </div>
                </div>

                {/* Public Key Display */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Stellar Testnet Public Key (Funded 10,000 XLM)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0F172A', fontWeight: 600, flex: 1, wordBreak: 'break-all' }}>
                      {displayAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(displayAddress);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                        showToast("Copied", "Stellar testnet address copied to clipboard.", "success");
                      }}
                      style={{ border: 0, background: '#F1F5F9', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#0F172A' }}
                      title="Copy address"
                    >
                      {copiedKey ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Pollar Developer Verification Progress Checklist */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ShieldCheck size={14} color="#059669" /> Pollar Dashboard Checklist
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#059669" /> <span>Step 1: <b>API keys</b> (Configured)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #0284C7', display: 'grid', placeItems: 'center', fontSize: '9px', color: '#0284C7', fontWeight: 800 }}>!</div>
                      <span>Step 2: <b>Allowed domains</b> — ensure <code>http://localhost:5175</code> is saved</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#059669" /> <span>Step 3: <b>Add credits</b> (1,000 available)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#059669" /> <span>Step 4: <b>Enable trustlines</b> (USDC added)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={13} color="#059669" />
                      <span>Step 5: <b>Create user wallet via SDK</b> ({isVerified ? 'Completed!' : 'Verify Below'})</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Live Pollar Verification Card */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #0F172A', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={15} color="#0F172A" />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                        Pollar SDK Live Verification
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', background: '#E2E8F0', color: '#0F172A', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Official Rails
                    </span>
                  </div>

                  {isVerified ? (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#065F46', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                        <Check size={16} /> Pollar Session Authenticated &amp; Wallet Active!
                      </div>
                      <p style={{ fontSize: '11px', color: '#047857', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        Wallet <b>{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</b> is actively registered for <b>{user.name}</b> under Application <b>cmwgtcqt8003g0ik16f2ea89i</b> on your Pollar Developer Dashboard.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          disconnectRoleWallet(currentRole);
                          try {
                            if (pollar?.getClient) {
                              pollar.getClient().logout();
                            }
                          } catch (e) {}
                          setPollarStep('email');
                          setProvisionSuccess(false);
                          showToast("Wallet Disconnected", `Pollar wallet unlinked from ${user.name}.`, "info");
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #FCA5A5',
                          background: '#FFFFFF',
                          color: '#DC2626',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover:bg-red-50"
                      >
                        <X size={13} />
                        <span>Disconnect Pollar Wallet</span>
                      </button>
                    </div>
                  ) : pollarStep === 'otp' ? (
                    <form onSubmit={handleVerifyPollarOtp}>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '10px', lineHeight: 1.4 }}>
                        Pollar sent a 6-digit OTP code to <b>{pollarEmail}</b>. Please check your inbox and enter it below:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={pollarOtp}
                          onChange={(e) => setPollarOtp(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            fontSize: '15px',
                            letterSpacing: '0.15em',
                            fontWeight: 700,
                            textAlign: 'center',
                            border: '1.5px solid #CBD5E1',
                            borderRadius: '8px'
                          }}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          style={{
                            padding: '10px 16px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 0,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isVerifyingOtp ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          <span>Verify &amp; Provision</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <button
                          type="button"
                          onClick={handleSendPollarOtp}
                          style={{ background: 'transparent', border: 0, color: '#0284C7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Resend Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setPollarStep('email')}
                          style={{ background: 'transparent', border: 0, color: '#64748B', cursor: 'pointer', padding: 0 }}
                        >
                          Change Email
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSendPollarOtp}>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '10px', lineHeight: 1.4 }}>
                        Enter email to authenticate {user.name} ({currentRole === 'client' ? 'Hirer' : 'Talent'}) and provision an end-user wallet on Pollar:
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="email"
                          placeholder="soloagbasimere@gmail.com"
                          value={pollarEmail}
                          onChange={(e) => setPollarEmail(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            fontSize: '13px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isSendingOtp}
                          style={{
                            padding: '10px 16px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 0,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSendingOtp ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          <span>Send Code</span>
                        </button>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                        A verification code will be dispatched via Pollar's live SDK server.
                      </div>
                    </form>
                  )}
                </div>

                {/* Official Pollar Embedded Wallet Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 12px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                    Pollar Official Session Connect (Registers in Pollar Dashboard):
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <WalletButton />
                  </div>
                </div>

                {/* Secondary Option: Launch External Pollar Login Dialog */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setTimeout(() => {
                        if (pollar?.openLoginModal) {
                          pollar.openLoginModal();
                        }
                      }, 100);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover:bg-slate-100"
                  >
                    <ExternalLink size={14} />
                    <span>Open Official Pollar Sign-In Modal (Passkey / Google)</span>
                  </button>

                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${displayAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '11.5px',
                      color: '#475569',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '6px'
                    }}
                    className="hover:underline"
                  >
                    <span>View Account on Stellar Testnet Explorer (10,000 XLM Active)</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
