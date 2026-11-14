import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS, INITIAL_AGREEMENTS, INITIAL_ACTIVITY_LOG, EXCHANGE_RATES } from '../data/mockData';
import { syncAgreementToSupabase, isSupabaseConfigured, supabase } from '../lib/supabase';

const AgreementContext = createContext(null);

const STORAGE_KEY_AGREEMENTS = 'kordia_agreements_v3';
const STORAGE_KEY_PROFILES = 'kordia_profiles_v3';
const STORAGE_KEY_LOGS = 'kordia_activity_logs_v3';
const STORAGE_KEY_ROLE = 'kordia_active_role_v3';
const STORAGE_KEY_AUTH = 'kordia_authenticated_v3';

export function AgreementProvider({ children }) {
  // Profiles directory (verified users with unique tags)
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed.client?.user_tag && parsed.freelancer?.user_tag) {
          return parsed;
        }
      }
      return USERS;
    } catch (e) {
      return USERS;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Agreements state
  const [agreements, setAgreements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGREEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
          return parsed;
        }
      }
      return INITIAL_AGREEMENTS;
    } catch (e) {
      return INITIAL_AGREEMENTS;
    }
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOG;
    } catch (e) {
      return INITIAL_ACTIVITY_LOG;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'client' || saved === 'freelancer' || saved === 'admin') {
        return saved;
      }
      return 'client';
    } catch (e) {
      return 'client';
    }
  });

  const [selectedAgreementId, setSelectedAgreementId] = useState('KRD-2026-9042');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'details' | 'create' | 'submit_review' | 'payment_settlement' | 'privacy_auth' | 'admin_console'
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AGREEMENTS, JSON.stringify(agreements));
    } catch (e) {
      console.error(e);
    }
  }, [agreements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error(e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.error(e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
    } catch (e) {
      console.error(e);
    }
  }, [currentRole]);

  // Sync with live Supabase database on mount
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch live profiles from Supabase
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProfiles(prev => {
            const next = { ...prev };
            data.forEach(p => {
              if (p.role === 'client') {
                next.client = { ...next.client, ...p, name: p.full_name, company: p.company_or_title };
              } else if (p.role === 'freelancer') {
                next.freelancer = { ...next.freelancer, ...p, name: p.full_name, title: p.company_or_title };
              } else if (p.role === 'admin') {
                next.admin = { ...next.admin, ...p, name: p.full_name };
              }
            });
            return next;
          });
        }
      }).catch(err => console.warn('Supabase profile sync notice:', err));

      // 2. Sync initial agreement if database table is empty
      supabase.from('agreements').select('id').limit(1).then(({ data, error }) => {
        if (!error && (!data || data.length === 0)) {
          INITIAL_AGREEMENTS.forEach(agr => {
            syncAgreementToSupabase(agr);
          });
        }
      }).catch(err => console.warn('Supabase initial agreement notice:', err));
    }
  }, []);

  const showToast = (title, message, type = 'info') => {
    setToastMessage({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id === prev?.id ? null : prev));
    }, 4500);
  };

  const addLog = (agreement_id, actor, action, details, type = 'system') => {
    const newLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      agreement_id,
      actor,
      action,
      details,
      type
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const getCurrentUser = () => {
    return profiles[currentRole] || profiles.client;
  };

  const getActiveAgreement = () => {
    return agreements.find(a => a.id === selectedAgreementId) || agreements[0] || INITIAL_AGREEMENTS[0];
  };

  // Find user by tag e.g. '@amaraokafor'
  const findUserByTag = (tag) => {
    if (!tag) return null;
    const clean = tag.trim().toLowerCase();
    return Object.values(profiles).find(u => u.user_tag?.toLowerCase() === clean);
  };

  // Search verified users
  const searchVerifiedUsers = (query) => {
    if (!query) return Object.values(profiles);
    const q = query.trim().toLowerCase();
    return Object.values(profiles).filter(u => 
      u.user_tag?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.company?.toLowerCase().includes(q)
    );
  };

  // Verify email & activate unique user tag
  const verifyUserEmail = (roleKey) => {
    setProfiles(prev => {
      const target = prev[roleKey];
      if (!target) return prev;
      return {
        ...prev,
        [roleKey]: {
          ...target,
          is_verified: true,
          verified_at: new Date().toISOString()
        }
      };
    });
    const user = profiles[roleKey];
    showToast("Email Verified", `Account ${user?.user_tag || ''} is now verified with active escrow privileges.`, "success");
  };

  // Toggle verification (Admin tool)
  const toggleUserVerification = (roleKey) => {
    setProfiles(prev => {
      const target = prev[roleKey];
      if (!target) return prev;
      const nextState = !target.is_verified;
      return {
        ...prev,
        [roleKey]: {
          ...target,
          is_verified: nextState,
          verified_at: nextState ? new Date().toISOString() : null
        }
      };
    });
    showToast("Verification Updated", `User verification state updated.`, "info");
  };

  // Filter agreements for current user
  const getUserAgreements = () => {
    if (currentRole === 'admin') return agreements;
    const currentTag = getCurrentUser()?.user_tag?.toLowerCase();
    if (!currentTag) return agreements;
    return agreements.filter(a => 
      a.client_tag?.toLowerCase() === currentTag ||
      a.freelancer_tag?.toLowerCase() === currentTag ||
      a.creator_tag?.toLowerCase() === currentTag
    );
  };

  /**
   * Action & Turn Intelligence Engine
   * Calculates whose turn it is, what action is needed, and provides step progression.
   */
  const getAgreementNextAction = (agreement, user) => {
    if (!agreement || !user) return null;
    const isClient = user.user_tag?.toLowerCase() === agreement.client_tag?.toLowerCase();
    const isFreelancer = user.user_tag?.toLowerCase() === agreement.freelancer_tag?.toLowerCase();
    const otherTag = isClient ? agreement.freelancer_tag : agreement.client_tag;
    const status = agreement.status;

    // Step 1: Awaiting acceptance
    if (status === 'Awaiting acceptance') {
      const isCreator = user.user_tag?.toLowerCase() === agreement.creator_tag?.toLowerCase();
      const isMyTurn = !isCreator;
      return {
        stepNumber: 1,
        stepTotal: 5,
        stepName: "Agreement Acceptance",
        isMyTurn,
        turnTag: isCreator ? otherTag : user.user_tag,
        headline: isMyTurn ? "Your Action: Review & Accept Agreement Terms" : `Waiting on ${otherTag} to Accept Terms`,
        description: isMyTurn 
          ? "The agreement was proposed with milestones and delivery terms. Review and digitally sign to initiate the escrow." 
          : `Proposal dispatched to ${otherTag}. Once accepted, the transaction proceeds to shielded escrow funding.`,
        actionType: isMyTurn ? 'ACCEPT_TERMS' : 'WAITING',
        buttonText: isMyTurn ? "Sign & Accept Agreement" : null
      };
    }

    // Step 2: Awaiting funding
    if (status === 'Awaiting funding') {
      const isMyTurn = isClient;
      return {
        stepNumber: 2,
        stepTotal: 5,
        stepName: "Shielded Escrow Deposit",
        isMyTurn,
        turnTag: agreement.client_tag,
        headline: isMyTurn ? "Your Action: Deposit Escrow Funds (Zcash Orchard)" : `Waiting on Hirer (${agreement.client_tag}) to Deposit Escrow`,
        description: isMyTurn 
          ? `Lock $${agreement.total_amount?.toFixed(2)} (${agreement.equivalent_zec || 12.5} ZEC) into the shielded Orchard pool so the talent can safely begin.` 
          : `Agreement accepted! Once ${agreement.client_tag} funds the shielded escrow, you are authorized to begin building.`,
        actionType: isMyTurn ? 'FUND_ESCROW' : 'WAITING',
        buttonText: isMyTurn ? `Fund Shielded Escrow ($${agreement.total_amount?.toFixed(2)})` : null
      };
    }

    // Step 3: Active (Work in Progress)
    if (status === 'Active') {
      const isMyTurn = isFreelancer;
      return {
        stepNumber: 3,
        stepTotal: 5,
        stepName: "Milestone Execution & Delivery",
        isMyTurn,
        turnTag: agreement.freelancer_tag,
        headline: isMyTurn ? "Your Action: Deliver Milestone & Submit Proof" : `Talent (${agreement.freelancer_tag}) is Building Deliverables`,
        description: isMyTurn 
          ? "Escrow funds are secured in the shielded vault. When ready, submit your live staging preview URL and repository for hirer inspection." 
          : `Escrow is locked. Talent is currently executing milestones. You will receive an inspection notice once deliverables are submitted.`,
        actionType: isMyTurn ? 'SUBMIT_WORK' : 'WAITING',
        buttonText: isMyTurn ? "Submit Deliverables" : null
      };
    }

    // Step 4: Submitted (Under Hirer Review)
    if (status === 'Submitted') {
      const isMyTurn = isClient;
      return {
        stepNumber: 4,
        stepTotal: 5,
        stepName: "Milestone Review & Approval",
        isMyTurn,
        turnTag: agreement.client_tag,
        headline: isMyTurn ? "Your Action: Inspect Work & Authorize Payout" : `Waiting on Hirer (${agreement.client_tag}) to Review Deliverables`,
        description: isMyTurn 
          ? "Talent has submitted the live preview and code repository. Inspect deliverables and approve payout release or request revisions." 
          : `Deliverables submitted! Hirer is reviewing the live deployment. Upon approval, your Pollar local bank payout will be authorized.`,
        actionType: isMyTurn ? 'REVIEW_APPROVE' : 'WAITING',
        buttonText: isMyTurn ? `Approve & Authorize Payout ($${agreement.total_amount?.toFixed(2)})` : null
      };
    }

    // Step 5: Approved / Released
    if (status === 'Approved' || status === 'Released') {
      const isPaid = agreement.payout?.status === 'PAYOUT_COMPLETED';
      const isMyTurn = isFreelancer && !isPaid;
      return {
        stepNumber: 5,
        stepTotal: 5,
        stepName: isPaid ? "Settlement Completed" : "Pollar Local Bank Clearing",
        isMyTurn: !isPaid,
        turnTag: agreement.freelancer_tag,
        headline: isPaid 
          ? "Escrow Cleared & Transaction Completed" 
          : (isFreelancer ? "Your Action: Disburse Local Bank Payout (GTBank)" : "Payment Released to Talent"),
        description: isPaid 
          ? `Settled ₦${agreement.payout?.estimated_local_amount?.toLocaleString() || '836,048'} into ${agreement.payout?.bank_name} (${agreement.payout?.account_number}).` 
          : `Milestone approved. Funds ready for local Nigerian bank settlement to ${agreement.freelancer_tag}.`,
        actionType: !isPaid ? 'EXECUTE_PAYOUT' : 'COMPLETED',
        buttonText: !isPaid ? `Disburse Payout (₦${agreement.payout?.estimated_local_amount?.toLocaleString() || '836,048'})` : null
      };
    }

    // Step 6: Refunded
    if (status === 'Refunded') {
      return {
        stepNumber: 5,
        stepTotal: 5,
        stepName: "Escrow Refunded to Hirer",
        isMyTurn: false,
        turnTag: "Closed",
        headline: "Agreement Cancelled & Escrow Refunded",
        description: `Funds ($${agreement.total_amount?.toFixed(2)}) have been returned to Hirer (${agreement.client_tag}). Transaction closed.`,
        actionType: 'COMPLETED',
        buttonText: null
      };
    }

    return null;
  };

  // Actions
  const createAgreement = (data) => {
    const creator = getCurrentUser();
    if (!creator.is_verified) {
      showToast("Verification Required", "You must verify your email and account before creating an escrow agreement.", "error");
      return false;
    }

    const counterparty = findUserByTag(data.counterparty_tag);
    if (!counterparty) {
      showToast("User Tag Not Found", `No user found with tag ${data.counterparty_tag}. Make sure to include @.`, "error");
      return false;
    }

    if (!counterparty.is_verified) {
      showToast("Counterparty Unverified", `User ${data.counterparty_tag} has not verified their email yet. Escrow requires both parties to be verified.`, "error");
      return false;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `KRD-2026-${uniqueNum}`;
    const amount = parseFloat(data.total_amount) || 500;
    const equivalentZec = +(amount / EXCHANGE_RATES.ZEC_USD).toFixed(2);
    const netUsd = +(amount * 0.995).toFixed(2);
    const netNgn = +(netUsd * EXCHANGE_RATES.USD_NGN).toFixed(2);

    const isClientCreator = creator.role === 'client';
    const clientTag = isClientCreator ? creator.user_tag : counterparty.user_tag;
    const freelancerTag = isClientCreator ? counterparty.user_tag : creator.user_tag;

    const newAgreement = {
      id: newId,
      creator_tag: creator.user_tag,
      client_tag: clientTag,
      freelancer_tag: freelancerTag,
      title: data.title || "Software Engineering Escrow Agreement",
      description: data.description || "Milestone based software delivery agreement",
      category: data.category || "Full-Stack Development",
      total_amount: amount,
      currency: data.currency || "USD",
      equivalent_zec: equivalentZec,
      status: "Awaiting acceptance",
      created_at: new Date().toISOString(),
      deadline: data.deadline || "2026-12-15",
      dispute_terms: {
        model: "Direct Peer-to-Peer Consensus",
        description: "Direct Hirer & Talent mutual agreement. Hirer approves release to Talent or requests revisions; mutual refund returns funds to Hirer.",
        objection_window_days: parseInt(data.objection_window_days) || 7,
        evidence_standard: "Verifiable code repository & hosted URL"
      },
      milestones: [
        {
          id: `ms-${uniqueNum}-01`,
          title: data.milestone_title || "Milestone 1 Deliverables",
          deliverable: data.milestone_deliverable || "Completed code repository, live deployment, and documentation",
          amount: amount,
          due_date: data.deadline || "2026-12-15",
          status: "Awaiting acceptance",
          submission_url: "",
          repo_url: "",
          submission_notes: "",
          submitted_at: null,
          attachments: []
        }
      ],
      authorizations: [
        { party: "client", tag: clientTag, name: clientTag, approved: isClientCreator, signed_at: isClientCreator ? new Date().toISOString() : null },
        { party: "freelancer", tag: freelancerTag, name: freelancerTag, approved: !isClientCreator, signed_at: !isClientCreator ? new Date().toISOString() : null }
      ],
      escrow: {
        is_funded: false,
        funded_at: null,
        pool: "Zcash Orchard Shielded Pool",
        tx_hash: null,
        shielded_memo: `${newId}::ESCROW_DEPOSIT_${amount}USD`,
        deposit_asset: "ZEC (Shielded)",
        deposit_amount: equivalentZec,
        usd_value: amount,
        is_simulated: true
      },
      payout: {
        target_currency: "NGN",
        bank_name: (isClientCreator ? counterparty : creator).bank_details?.bank_name || "Guaranty Trust Bank (GTBank)",
        account_number: (isClientCreator ? counterparty : creator).bank_details?.account_number || "0149928371",
        account_name: (isClientCreator ? counterparty : creator).bank_details?.account_name || (isClientCreator ? counterparty.name : creator.name),
        gross_amount_usd: amount,
        protocol_fee_usd: amount * 0.005,
        net_usd: netUsd,
        fx_rate: EXCHANGE_RATES.USD_NGN,
        estimated_local_amount: netNgn,
        status: "PENDING_FUNDING",
        provider_reference: `POL-QTE-2026-${uniqueNum}`
      }
    };

    setAgreements(prev => [newAgreement, ...prev]);
    setSelectedAgreementId(newId);
    syncAgreementToSupabase(newAgreement);

    addLog(newId, creator.user_tag, "Agreement Created", `Created agreement ${newId} ($${amount}) tagging ${counterparty.user_tag}`, "creation");
    showToast("Agreement Created", `Tagged ${counterparty.user_tag} to ${newId}. Visible immediately on their dashboard.`, "success");
    setActiveView('details');
    return true;
  };

  const acceptAgreement = (agreementId) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const isClient = actor.user_tag === agr.client_tag;
      const updatedAuths = agr.authorizations.map(a => {
        if ((isClient && a.party === 'client') || (!isClient && a.party === 'freelancer')) {
          return { ...a, approved: true, signed_at: new Date().toISOString() };
        }
        return a;
      });
      const updated = {
        ...agr,
        status: "Awaiting funding",
        authorizations: updatedAuths,
        milestones: agr.milestones.map(m => ({ ...m, status: "Awaiting funding" }))
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Agreement Accepted", "Accepted project scope, milestone deliverables, and payment terms", "acceptance");
    showToast("Agreement Accepted", "Agreement accepted! Hirer can now fund the shielded escrow.", "success");
  };

  const fundEscrow = (agreementId) => {
    const actor = getCurrentUser();
    const randomHex = Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const txHash = `0x${randomHex}`;
    
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updated = {
        ...agr,
        status: "Active",
        milestones: agr.milestones.map(m => ({ ...m, status: "Active" })),
        escrow: {
          ...agr.escrow,
          is_funded: true,
          funded_at: new Date().toISOString(),
          tx_hash: txHash,
        },
        payout: {
          ...agr.payout,
          status: "READY_FOR_SETTLEMENT"
        }
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Escrow Funded (Shielded Zcash)", `12.5 ZEC secured in Orchard pool. Tx: ${txHash.slice(0, 16)}...`, "funding");
    showToast("Escrow Secured", "Shielded Zcash deposit confirmed. Talent is authorized to begin work.", "success");
  };

  const submitMilestone = (agreementId, milestoneId, submissionData) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updated = {
        ...agr,
        status: "Submitted",
        milestones: agr.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            status: "Submitted",
            submission_url: submissionData.url,
            repo_url: submissionData.repo,
            submission_notes: submissionData.notes,
            submitted_at: new Date().toISOString(),
            attachments: submissionData.attachments || []
          };
        })
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Milestone Deliverables Submitted", `Live preview and repository delivered for review.`, "submission");
    showToast("Deliverables Submitted", "Deliverables submitted! Hirer has been notified to review and authorize payout.", "success");
  };

  const approveMilestone = (agreementId, milestoneId) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updatedAuths = agr.authorizations.map(a => 
        a.party === 'client' ? { ...a, approved: true, signed_at: new Date().toISOString() } : a
      );
      const updated = {
        ...agr,
        status: "Released",
        authorizations: updatedAuths,
        milestones: agr.milestones.map(m => m.id === milestoneId ? { ...m, status: "Approved", approved_at: new Date().toISOString() } : m)
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Milestone Approved & Released", "Hirer approved deliverables. Payment release authorized for Pollar bank clearing.", "approval");
    showToast("Milestone Approved", "Payment release authorized! Ready for Pollar bank payout.", "success");
  };

  const requestRevision = (agreementId, revisionNotes) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updated = {
        ...agr,
        status: "Active",
        milestones: agr.milestones.map(m => ({ ...m, status: "Active", revision_requested: true, revision_notes: revisionNotes }))
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Revision Requested", `Hirer requested modifications: ${revisionNotes}`, "revision");
    showToast("Revision Requested", "Talent notified of revision requests. Work status returned to Active.", "info");
  };

  const issueMutualRefund = (agreementId, reason) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updated = {
        ...agr,
        status: "Refunded",
        milestones: agr.milestones.map(m => ({ ...m, status: "Refunded" })),
        payout: {
          ...agr.payout,
          status: "REFUNDED_TO_HIRER",
          refund_reason: reason
        }
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    addLog(agreementId, actor.user_tag, "Mutual Refund Executed", `Escrow refunded to Hirer. Reason: ${reason}`, "refund");
    showToast("Refund Executed", "Escrow deposit released and refunded to Hirer's shielded wallet.", "warning");
  };

  const executePollarPayout = (agreementId) => {
    const actor = getCurrentUser();
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const updated = {
        ...agr,
        status: "Released",
        payout: {
          ...agr.payout,
          status: "PAYOUT_COMPLETED",
          completed_at: new Date().toISOString(),
          transaction_ref: `POL-NGN-${Math.floor(100000 + Math.random()*900000)}`
        }
      };
      syncAgreementToSupabase(updated);
      return updated;
    }));

    const targetAgr = agreements.find(a => a.id === agreementId);
    const amountLocal = targetAgr?.payout?.estimated_local_amount?.toLocaleString() || "836,048.75";
    const bank = targetAgr?.payout?.bank_name || "GTBank";
    const acct = targetAgr?.payout?.account_number || "0149928371";

    addLog(agreementId, actor.user_tag, "Pollar Bank Payout Completed", `₦${amountLocal} disbursed to ${bank} (${acct})`, "payout");
    showToast("Payout Disbursed", `₦${amountLocal} NGN successfully disbursed to ${bank}!`, "success");
  };

  const login = (identifier, password) => {
    if (!identifier) {
      showToast("Identifier Required", "Please enter your user tag or email.", "error");
      return false;
    }
    const clean = identifier.trim().toLowerCase();
    const found = Object.entries(profiles).find(([key, user]) => 
      user.user_tag?.toLowerCase() === clean || 
      user.email?.toLowerCase() === clean ||
      (user.user_tag?.replace('@', '').toLowerCase() === clean.replace('@', ''))
    );

    if (!found) {
      showToast("Account Not Found", `No profile found matching "${identifier}".`, "error");
      return false;
    }

    const [roleKey, user] = found;
    if (roleKey === 'admin') {
      if (password === 'AdminSecure2026!') {
        setCurrentRole('admin');
        setIsAuthenticated(true);
        try { localStorage.setItem(STORAGE_KEY_AUTH, 'true'); } catch (e) {}
        window.location.hash = '#/admin';
        return true;
      }
    }

    if (password === 'Password123!' || password === user.password || !password) {
      setCurrentRole(roleKey);
      setIsAuthenticated(true);
      try { localStorage.setItem(STORAGE_KEY_AUTH, 'true'); } catch (e) {}
      showToast("Welcome Back", `Signed in as ${user.name} (${user.user_tag})`, "success");
      return true;
    } else {
      showToast("Incorrect Password", "Use seed password: Password123!", "error");
      return false;
    }
  };

  const signUp = ({ name, email, user_tag, role, password, company_or_title }) => {
    const cleanTag = user_tag.startsWith('@') ? user_tag : `@${user_tag}`;
    const roleKey = role === 'client' ? 'client' : 'freelancer';

    const newProfile = {
      id: `usr-${Date.now()}`,
      user_tag: cleanTag,
      name: name,
      email: email,
      role: roleKey,
      role_label: roleKey === 'client' ? 'Hirer (Client)' : 'Talent (Freelancer)',
      company: roleKey === 'client' ? (company_or_title || 'Independent Hirer') : undefined,
      title: roleKey === 'freelancer' ? (company_or_title || 'Professional Talent') : undefined,
      location: 'Global',
      is_verified: true,
      verified_at: new Date().toISOString(),
      password: password || 'Password123!',
      avatar: roleKey === 'client' ? USERS.client.avatar : USERS.freelancer.avatar,
      shielded_z_address: `u1${cleanTag.replace('@', '')}${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
      viewing_key: `zxviews${Array.from({length: 50}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
      pollar_id: `POL-${cleanTag.replace('@', '').toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random()*9000)}`,
      bank_details: roleKey === 'freelancer' ? {
        bank_name: "Guaranty Trust Bank (GTBank)",
        account_number: "0149928371",
        account_name: name.toUpperCase(),
        currency: "NGN",
        bvn_verified: true
      } : undefined
    };

    setProfiles(prev => ({
      ...prev,
      [roleKey]: newProfile
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').insert({
        user_tag: cleanTag,
        email: email,
        full_name: name,
        role: roleKey,
        company_or_title: company_or_title,
        is_verified: true,
        verified_at: new Date().toISOString(),
        shielded_z_address: newProfile.shielded_z_address,
        pollar_id: newProfile.pollar_id,
        bank_name: newProfile.bank_details?.bank_name,
        bank_account_number: newProfile.bank_details?.account_number,
        bank_account_name: newProfile.bank_details?.account_name
      }).catch(e => console.warn('Supabase profile insert:', e));
    }

    setCurrentRole(roleKey);
    setIsAuthenticated(true);
    try { localStorage.setItem(STORAGE_KEY_AUTH, 'true'); } catch (e) {}
    showToast("Account Created", `Welcome to Kordia! Tag ${cleanTag} active.`, "success");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {}
    showToast("Signed Out", "You have signed out of your workspace.", "info");
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_AGREEMENTS);
      localStorage.removeItem(STORAGE_KEY_PROFILES);
      localStorage.removeItem(STORAGE_KEY_LOGS);
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {}
    setAgreements(INITIAL_AGREEMENTS);
    setProfiles(USERS);
    setActivityLogs(INITIAL_ACTIVITY_LOG);
    setCurrentRole('client');
    setIsAuthenticated(true);
    setSelectedAgreementId('KRD-2026-9042');
    setActiveView('dashboard');
    showToast("Demo Data Reset", "Reset to original peer-to-peer demonstration state.", "info");
  };

  return (
    <AgreementContext.Provider
      value={{
        agreements,
        profiles,
        activityLogs,
        currentRole,
        selectedAgreementId,
        activeView,
        toastMessage,
        isAuthenticated,
        login,
        signUp,
        logout,
        setCurrentRole,
        setSelectedAgreementId,
        setActiveView,
        getCurrentUser,
        getActiveAgreement,
        getUserAgreements,
        getAgreementNextAction,
        findUserByTag,
        searchVerifiedUsers,
        verifyUserEmail,
        toggleUserVerification,
        createAgreement,
        acceptAgreement,
        fundEscrow,
        submitMilestone,
        approveMilestone,
        requestRevision,
        issueMutualRefund,
        executePollarPayout,
        resetDemoData,
        showToast,
        addLog
      }}
    >
      {children}
    </AgreementContext.Provider>
  );
}

export function useAgreement() {
  const context = useContext(AgreementContext);
  if (!context) {
    throw new Error('useAgreement must be used within an AgreementProvider');
  }
  return context;
}
