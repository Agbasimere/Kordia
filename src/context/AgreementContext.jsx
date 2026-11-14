import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_AGREEMENTS, 
  INITIAL_ACTIVITY_LOG, 
  USERS, 
  EXCHANGE_RATES, 
  SEED_CREDENTIALS 
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  executePollarTestnetFunding, 
  executePollarTestnetWithdrawal, 
  executePollarTestnetPayout, 
  POLLAR_TESTNET_CONFIG 
} from '../lib/blockchainServices';

const AgreementContext = createContext();

const STORAGE_KEY_AGREEMENTS = 'kordia_agreements_v7';
const STORAGE_KEY_PROFILES = 'kordia_profiles_v7';
const STORAGE_KEY_LOGS = 'kordia_activity_logs_v7';
const STORAGE_KEY_ROLE = 'kordia_active_role_v7';
const STORAGE_KEY_AUTH = 'kordia_authenticated_v8';
const STORAGE_KEY_NOTIFS = 'kordia_notifications_v7';
const STORAGE_KEY_BALANCES = 'kordia_balances_v7';
const STORAGE_KEY_SOCIAL = 'kordia_social_v7';
const STORAGE_KEY_REVIEWS = 'kordia_reviews_v7';

const INITIAL_NOTIFICATIONS = [
  // Talent Notifications (@amaraokafor / Freelancer)
  {
    id: "notif-1",
    recipient_tag: "@amaraokafor",
    target_role: "freelancer",
    type: "invite",
    title: "Approval needed",
    subtitle: "You've been invited to 'Brand Identity Design' by @davidvance",
    agreement_id: "KRD-2026-9042",
    time: "5h ago",
    requires_action: true,
    action_type: "invite",
    read: false,
    status: "pending"
  },
  {
    id: "notif-3",
    recipient_tag: "@amaraokafor",
    target_role: "freelancer",
    type: "withdrawal",
    title: "Stellar payment settled",
    subtitle: "$500.00 USDC routed to Pollar Stellar wallet GAYQK...LAATS4",
    time: "30m ago",
    requires_action: false,
    read: true
  },
  {
    id: "notif-4",
    recipient_tag: "@amaraokafor",
    target_role: "freelancer",
    type: "review",
    title: "New review received",
    subtitle: "5.0 ★ from @davidvance: 'Excellent delivery and clean code!'",
    time: "1d ago",
    requires_action: false,
    read: true
  },
  {
    id: "notif-5",
    recipient_tag: "@amaraokafor",
    target_role: "freelancer",
    type: "system",
    title: "Pollar Stellar Wallet active",
    subtitle: "Stellar Testnet (GAYQK...LAATS4) - 100% USDC trustline verified",
    time: "2d ago",
    requires_action: false,
    read: true
  },

  // Hirer Notifications (@davidvance / Client)
  {
    id: "notif-h1",
    recipient_tag: "@davidvance",
    target_role: "client",
    type: "milestone",
    title: "Milestone inspection required",
    subtitle: "Website Redesign milestone deliverables submitted by @amaraokafor",
    agreement_id: "KRD-2026-9042",
    time: "15m ago",
    requires_action: true,
    action_type: "milestone_approval",
    read: false,
    status: "pending"
  },
  {
    id: "notif-h2",
    recipient_tag: "@davidvance",
    target_role: "client",
    type: "funding",
    title: "Escrow deposit confirmed",
    subtitle: "$2,480.00 funded into Pollar escrow vault for Brand Identity Design",
    time: "2h ago",
    requires_action: false,
    read: false
  },
  {
    id: "notif-h3",
    recipient_tag: "@davidvance",
    target_role: "client",
    type: "invite",
    title: "Agreement accepted by talent",
    subtitle: "@amaraokafor accepted project terms for 'Brand Identity Design'",
    agreement_id: "KRD-2026-9042",
    time: "4h ago",
    requires_action: false,
    read: true
  }
];

const INITIAL_REVIEWS = {
  "@amaraokafor": [
    {
      id: "rev-1",
      author_tag: "@davidvance",
      author_name: "David Vance",
      author_company: "Apex Design Studio Ltd",
      rating: 5,
      date: "2026-11-13",
      comment: "Amara delivered pristine Next.js code ahead of schedule. Fully responsive and automated tests passing with 98% Lighthouse performance."
    },
    {
      id: "rev-2",
      author_tag: "@acme_labs",
      author_name: "Marcus Brody",
      author_company: "Acme Digital Co.",
      rating: 5,
      date: "2026-10-28",
      comment: "Brilliant smart contract audit and frontend integration. Fast communicator and reliable with milestone escrow releases."
    }
  ],
  "@davidvance": [
    {
      id: "rev-3",
      author_tag: "@amaraokafor",
      author_name: "Amara Okafor",
      author_title: "Senior Full-Stack Engineer",
      rating: 5,
      date: "2026-11-12",
      comment: "Prompt milestone funding into Kordia Pollar protected vault and clear requirements. A truly professional client to collaborate with."
    }
  ]
};

export function AgreementProvider({ children }) {
  // Profiles state
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
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved !== null) return saved === 'true';
      return false; // Default: unauthenticated so all visitors see the Landing Page first
    } catch (e) {
      return false;
    }
  });

  // Agreements state
  const [agreements, setAgreements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGREEMENTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Balances state
  const [balances, setBalances] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BALANCES);
      return saved ? JSON.parse(saved) : {
        client: 0.00,
        freelancer: 0.00
      };
    } catch (e) {
      return { client: 0.00, freelancer: 0.00 };
    }
  });

  // Role-specific Pollar Wallets (separating Talent vs Hirer accounts)
  const [roleWallets, setRoleWallets] = useState(() => {
    try {
      const saved = localStorage.getItem('kordia_role_wallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {
      freelancer: 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU', // Talent's verified 56-character Stellar testnet wallet
      client: null // Hirer is not connected yet
    };
  });

  const getRoleWallet = (role) => {
    const r = role || currentRole;
    return roleWallets[r] || null;
  };

  const linkWalletToRole = (role, address) => {
    const r = role || currentRole;
    setRoleWallets(prev => {
      const updated = { ...prev, [r]: address };
      try { localStorage.setItem('kordia_role_wallets', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const disconnectRoleWallet = (role) => {
    const r = role || currentRole;
    setRoleWallets(prev => {
      const updated = { ...prev, [r]: null };
      try { localStorage.setItem('kordia_role_wallets', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    try {
      const saved = localStorage.getItem('kordia_pollar_wallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed[r];
        localStorage.setItem('kordia_pollar_wallets', JSON.stringify(parsed));
      }
    } catch (e) {}
  };

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Linked Social Media for Direct Push Notifications (WhatsApp & Telegram)
  const [linkedSocial, setLinkedSocial] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOCIAL);
      return saved ? JSON.parse(saved) : {
        whatsapp: "+234 803 123 4567",
        whatsapp_enabled: true,
        telegram: "@amara_dev",
        telegram_enabled: true,
        sms_enabled: false
      };
    } catch (e) {
      return {
        whatsapp: "+234 803 123 4567",
        whatsapp_enabled: true,
        telegram: "@amara_dev",
        telegram_enabled: true,
        sms_enabled: false
      };
    }
  });

  // Proof of Trust Reviews
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object') return parsed;
      }
      return {};
    } catch (e) {
      return {};
    }
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'client' || saved === 'freelancer' || saved === 'admin') {
        return saved;
      }
      return 'client'; // Default to hirer dashboard for creating & testing
    } catch (e) {
      return 'client';
    }
  });

  const [selectedAgreementId, setSelectedAgreementId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'projects' | 'transactions' | 'notifications' | 'profile' | 'settings' | 'details' | 'create'
  const [toastMessage, setToastMessage] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD'); // 'USD' | 'USDC'
  const [isLandingOpen, setIsLandingOpen] = useState(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      return savedAuth !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'fund' | 'withdraw' | 'transfer' | 'tag' | 'profile' | 'create_project' | 'invite' | null

  // Persistence
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_AGREEMENTS, JSON.stringify(agreements)); } catch (e) {}
  }, [agreements]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles)); } catch (e) {}
  }, [profiles]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs)); } catch (e) {}
  }, [activityLogs]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(balances)); } catch (e) {}
  }, [balances]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications)); } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_SOCIAL, JSON.stringify(linkedSocial)); } catch (e) {}
  }, [linkedSocial]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews)); } catch (e) {}
  }, [reviews]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_ROLE, currentRole); } catch (e) {}
  }, [currentRole]);

  const showToast = (title, message, type = 'info') => {
    setToastMessage({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
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
    return profiles[currentRole] || profiles.freelancer;
  };

  const getCurrentBalance = () => {
    return balances[currentRole] ?? 0.00;
  };

  const getActiveAgreement = () => {
    return agreements.find(a => a.id === selectedAgreementId) || agreements[0] || null;
  };

  const findUserByTag = (tag) => {
    if (!tag) return null;
    const clean = tag.trim().toLowerCase();
    return Object.values(profiles).find(u => u.user_tag?.toLowerCase() === clean);
  };

  // Currency Formatter (USD and USDC on Stellar Testnet)
  const formatCurrency = (usdAmount, currency = displayCurrency) => {
    const num = Number(usdAmount) || 0;
    if (currency === 'USDC') {
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Live On-Chain Balance from Stellar Horizon Testnet
  const [onChainBalance, setOnChainBalance] = useState({ xlm: 10000, usdc: 0, loading: false });

  const fetchLiveStellarBalance = async (walletAddress) => {
    const addr = walletAddress || getRoleWallet(currentRole) || (currentRole === 'client' ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB' : 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU');
    if (!addr || addr.length !== 56 || !addr.startsWith('G')) return;

    setOnChainBalance(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${addr}`);
      if (res.ok) {
        const data = await res.json();
        let xlm = 0;
        let usdc = 0;
        data.balances?.forEach(b => {
          if (b.asset_type === 'native') {
            xlm = parseFloat(b.balance) || 0;
          } else if (b.asset_code === 'USDC') {
            usdc = parseFloat(b.balance) || 0;
          }
        });
        setOnChainBalance({ xlm, usdc, loading: false });
      } else {
        setOnChainBalance({ xlm: 0, usdc: 0, loading: false });
      }
    } catch (e) {
      setOnChainBalance(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveStellarBalance();
  }, [currentRole, roleWallets]);

  // Fund Account (Pollar Protected Escrow / Stellar Testnet)
  const fundAccount = async (amount, method = 'Pollar Stellar Deposit (USDC)') => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return { success: false, error: 'Invalid amount' };

    const user = getCurrentUser();
    const depositorWallet = getRoleWallet(currentRole) || (currentRole === 'client' ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB' : 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU');
    const result = await executePollarTestnetFunding({
      agreementId: selectedAgreementId || 'WALLET',
      amountUsd: num,
      depositorTag: user.user_tag,
      depositorWallet,
      method
    });

    setBalances(prev => {
      const updated = {
        ...prev,
        [currentRole]: (prev[currentRole] || 0) + num
      };
      try { localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Refresh live on-chain balance
    fetchLiveStellarBalance(depositorWallet);

    addLog('POLLAR-FUND', user.user_tag, 'Wallet Funded (Pollar Stellar)', `Deposited $${num.toFixed(2)} USDC via ${method} (Tx: ${result.tx_hash.slice(0, 12)}...)`, 'funding');
    
    // Add notification with Pollar reference
    const newNotif = {
      id: `notif-${Date.now()}`,
      recipient_tag: user.user_tag,
      target_role: currentRole,
      type: "funding",
      title: "Wallet Funded via Pollar Stellar",
      subtitle: `$${num.toFixed(2)} USDC credited to Pollar wallet · Ref: ${result.reference}`,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast("Pollar Stellar Deposit", `$${num.toFixed(2)} USDC credited to your Stellar wallet (Ref: ${result.reference}).`, "success");
    return result;
  };

  // Withdraw Funds via Pollar Stellar Testnet (Transfer to External Stellar Address)
  const withdrawFunds = async (amount, destinationAddress, memo) => {
    const num = parseFloat(amount);
    const current = balances[currentRole] || 0;
    if (!num || num <= 0 || num > current) {
      showToast("Insufficient Balance", `Cannot withdraw $${num}. Your available balance is $${current.toFixed(2)}.`, "error");
      return false;
    }

    const user = getCurrentUser();
    const sourceWallet = getRoleWallet(currentRole);
    const dest = destinationAddress || 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB';

    const result = await executePollarTestnetWithdrawal({
      userTag: user.user_tag,
      sourceWallet,
      amountUsd: num,
      destinationAddress: dest,
      memo
    });

    setBalances(prev => ({
      ...prev,
      [currentRole]: current - num
    }));

    addLog('POLLAR-WITHDRAW', user.user_tag, 'Stellar Withdrawal Processed (Pollar)', `Withdrew $${num.toFixed(2)} USDC to Stellar wallet ${dest.slice(0, 8)}...${dest.slice(-6)} · Pollar Ref: ${result.provider_reference}`, 'payout');

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipient_tag: user.user_tag,
      target_role: currentRole,
      type: "withdrawal",
      title: "Stellar Withdrawal Dispatched (Pollar)",
      subtitle: `$${num.toFixed(2)} USDC sent to Stellar wallet ${dest.slice(0, 8)}... · Tx: ${result.tx_hash.slice(0, 12)}...`,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast("Pollar Stellar Withdrawal", `$${num.toFixed(2)} USDC sent to ${dest.slice(0, 6)}... on Stellar Testnet!`, "success");
    return true;
  };

  // Transfer Funds (Pollar Multi-Chain Rails)
  const transferToChain = (amount, destinationChain, destinationAddress) => {
    const num = parseFloat(amount);
    const current = balances[currentRole] || 0;
    if (!num || num <= 0 || num > current) {
      showToast("Insufficient Balance", "Amount exceeds available balance.", "error");
      return false;
    }

    setBalances(prev => ({
      ...prev,
      [currentRole]: current - num
    }));

    const user = getCurrentUser();
    const pseudoTx = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    const pRef = `POL-XFER-${Math.floor(100000 + Math.random() * 900000)}`;
    
    addLog('POLLAR-TRANSFER', user.user_tag, 'Pollar Multi-Chain Transfer', `Transferred $${num.toFixed(2)} to ${destinationChain} (${destinationAddress.slice(0, 10)}...) · Ref: ${pRef}`, 'transfer');

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipient_tag: user.user_tag,
      target_role: currentRole,
      type: "transfer",
      title: "Pollar Transfer Dispatched",
      subtitle: `$${num.toFixed(2)} sent to ${destinationChain} network: ${pseudoTx.slice(0, 16)}...`,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast("Pollar Transfer Dispatched", `$${num.toFixed(2)} sent to ${destinationChain} (Ref: ${pRef}).`, "success");
    return true;
  };

  // Interactive Notification Actions (Image 2)
  const respondToInvite = (notificationId, accept = true) => {
    const targetNotif = notifications.find(n => n.id === notificationId);
    const agrId = targetNotif?.agreement_id || selectedAgreementId;
    const actor = getCurrentUser();

    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        return {
          ...n,
          status: accept ? 'accepted' : 'declined',
          read: true,
          subtitle: accept ? `${n.subtitle} (Accepted)` : `${n.subtitle} (Declined)`
        };
      }
      return n;
    }));

    if (accept) {
      if (agrId) {
        setAgreements(prev => prev.map(agr => {
          if (agr.id === agrId) {
            return { ...agr, status: 'Active' };
          }
          return agr;
        }));

        // Log in Agreement History Ledger
        addLog(agrId, actor.user_tag, "Agreement Accepted & Signed", `${actor.name || actor.user_tag} accepted the project terms and escrow agreement.`, "acceptance");

        // Notify the Hirer specifically!
        const matchingAgr = agreements.find(a => a.id === agrId);
        const hirerTag = matchingAgr?.client_tag || matchingAgr?.creator_tag || '@davidvance';
        const hirerNotice = {
          id: `notif-${Date.now()}-accept`,
          recipient_tag: hirerTag,
          target_role: "client",
          type: "invite",
          title: "Agreement Accepted by Talent",
          subtitle: `${actor.user_tag} has accepted the agreement '${matchingAgr?.title || 'Milestone Project'}'. Work is active.`,
          agreement_id: agrId,
          time: "Just now",
          requires_action: false,
          read: false
        };
        setNotifications(prev => [hirerNotice, ...prev]);
      }
      showToast("Project Accepted", "You have joined the project agreement.", "success");
      if (linkedSocial.telegram_enabled) {
        showToast("Telegram Notice Sent", `Confirmation ping dispatched to ${linkedSocial.telegram}`, "info");
      }
    } else {
      if (agrId) {
        addLog(agrId, actor.user_tag, "Agreement Declined", `${actor.name || actor.user_tag} declined the project invitation.`, "rejection");
      }
      showToast("Invite Declined", "Project invitation was declined.", "info");
    }
  };

  const approveMilestoneFromAlert = (notificationId, agreementId) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        return { ...n, status: 'approved', read: true, subtitle: `${n.subtitle} (Approved & Released)` };
      }
      return n;
    }));

    // Release escrow on the agreement
    if (agreementId) {
      executePollarPayout(agreementId);
    }
  };

  const markAllNotificationsAsRead = () => {
    const user = getCurrentUser();
    setNotifications(prev => prev.map(n => {
      if (n.recipient_tag && n.recipient_tag.toLowerCase() === user.user_tag?.toLowerCase()) {
        return { ...n, read: true };
      }
      if (n.target_role && n.target_role === user.role) {
        return { ...n, read: true };
      }
      return n;
    }));
    showToast("Alerts Cleared", "All alerts marked as read.", "info");
  };

  // Update Linked Social Accounts (WhatsApp & Telegram)
  const updateLinkedSocial = (data) => {
    setLinkedSocial(prev => ({ ...prev, ...data }));
    showToast("Notification Channels Updated", "WhatsApp & Telegram notification preferences saved.", "success");
  };

  const sendSocialTestAlert = (channel = 'whatsapp') => {
    const user = getCurrentUser();
    if (channel === 'whatsapp') {
      showToast("WhatsApp Message Sent", `Test ping sent to ${linkedSocial.whatsapp}: "Kordia: You have a new project milestone alert for ${user.user_tag}"`, "success");
    } else {
      showToast("Telegram Ping Sent", `Bot alert pushed to ${linkedSocial.telegram}: "Kordia Bot: Milestone verified onchain for ${user.user_tag}"`, "info");
    }
  };

  // Proof of Trust Reviews
  const submitReview = (targetTag, rating, comment) => {
    const user = getCurrentUser();
    const newRev = {
      id: `rev-${Date.now()}`,
      author_tag: user.user_tag,
      author_name: user.name,
      author_title: user.title || user.company,
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment
    };

    setReviews(prev => ({
      ...prev,
      [targetTag]: [newRev, ...(prev[targetTag] || [])]
    }));

    const newNotif = {
      id: `notif-${Date.now()}`,
      type: "review",
      title: "New Review Received",
      subtitle: `${rating} ★ from ${user.user_tag}: "${comment.slice(0, 45)}..."`,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast("Review Published", `Proof of trust review added for ${targetTag}.`, "success");
  };

  // Execute Pollar Escrow Release & Disburse Directly to Talent's Pollar Stellar Wallet
  const executePollarPayout = async (agreementId) => {
    const agreement = agreements.find(a => a.id === agreementId);
    if (!agreement) return;

    const talentTag = agreement.freelancer_tag || "@amaraokafor";
    const payoutAmountUsd = agreement.total_amount || 500.0;
    const talentWallet = getRoleWallet('freelancer') || agreement.payout?.recipient_wallet || "GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU";

    const result = await executePollarTestnetPayout({
      agreementId,
      amountUsd: payoutAmountUsd,
      beneficiaryTag: talentTag,
      beneficiaryWallet: talentWallet
    });

    // Credit talent balance directly in dashboard
    setBalances(prev => ({
      ...prev,
      freelancer: (prev.freelancer || 0) + payoutAmountUsd
    }));

    setAgreements(prev => prev.map(a => {
      if (a.id === agreementId) {
        return {
          ...a,
          status: 'Released',
          payout: {
            ...a.payout,
            status: 'PAYOUT_COMPLETED',
            disbursed_to_balance: true,
            settled_at: new Date().toISOString(),
            target_asset: "USDC",
            chain: "STELLAR",
            recipient_wallet: talentWallet,
            amount_usd: payoutAmountUsd,
            tx_hash: result?.tx_hash,
            provider_reference: result?.provider_reference || `POL-PAY-${Math.floor(100000 + Math.random() * 900000)}`
          }
        };
      }
      return a;
    }));

    addLog(agreementId, "POLLAR_RAILS", "Escrow Released to Pollar Stellar Wallet", `$${payoutAmountUsd.toFixed(2)} USDC settled directly on Stellar Testnet to talent wallet (${talentWallet.slice(0, 8)}...${talentWallet.slice(-4)}) · Ref: ${result?.provider_reference}`, 'payout');

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipient_tag: talentTag,
      target_role: "freelancer",
      type: "milestone",
      title: "Milestone Paid to Stellar Wallet!",
      subtitle: `$${payoutAmountUsd.toFixed(2)} USDC released from escrow to your Stellar wallet ${talentWallet.slice(0, 6)}... for '${agreement.title}'.`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: false,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast("Escrow Payout Disbursed", `$${payoutAmountUsd.toFixed(2)} USDC sent to Talent's Stellar wallet!`, "success");
  };

  // Lifecycle Helpers & Actions for Agreement Detail & Timeline
  const getAgreementNextAction = (agreement, user) => {
    if (!agreement || !user) return null;
    const isClient = user.user_tag?.toLowerCase() === agreement.client_tag?.toLowerCase();
    const isFreelancer = user.user_tag?.toLowerCase() === agreement.freelancer_tag?.toLowerCase();
    const otherTag = isClient ? agreement.freelancer_tag : agreement.client_tag;
    const status = agreement.status;

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
          : `Proposal dispatched to ${otherTag}. Once accepted, the transaction proceeds to protected Pollar escrow funding.`,
        actionType: isMyTurn ? 'ACCEPT_TERMS' : 'WAITING',
        buttonText: isMyTurn ? "Sign & Accept Agreement" : null
      };
    }

    if (status === 'Awaiting funding') {
      const isMyTurn = isClient;
      return {
        stepNumber: 2,
        stepTotal: 5,
        stepName: "Protected Escrow Deposit",
        isMyTurn,
        turnTag: agreement.client_tag,
        headline: isMyTurn ? "Your Action: Deposit Escrow Funds (Pollar Escrow Vault)" : `Waiting on Hirer (${agreement.client_tag}) to Deposit Escrow`,
        description: isMyTurn 
          ? `Lock $${agreement.total_amount?.toFixed(2)} into the protected Pollar escrow vault so the talent can safely begin.` 
          : `Agreement accepted! Once ${agreement.client_tag} funds the escrow vault, you are authorized to begin building.`,
        actionType: isMyTurn ? 'FUND_ESCROW' : 'WAITING',
        buttonText: isMyTurn ? `Fund Protected Escrow ($${agreement.total_amount?.toFixed(2)})` : null
      };
    }

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
          ? "Escrow funds are secured in the Pollar vault. When ready, submit your deliverables for hirer inspection." 
          : `Escrow is locked. Talent is currently executing milestones. You will receive an inspection notice once deliverables are submitted.`,
        actionType: isMyTurn ? 'SUBMIT_WORK' : 'WAITING',
        buttonText: isMyTurn ? "Submit Deliverables" : null
      };
    }

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
          ? "Talent has submitted deliverables. Inspect work and approve payout release or request revisions." 
          : `Deliverables submitted! Hirer is reviewing the deployment. Upon approval, funds will disburse directly to your Pollar Stellar wallet.`,
        actionType: isMyTurn ? 'REVIEW_APPROVE' : 'WAITING',
        buttonText: isMyTurn ? `Approve & Authorize Payout ($${agreement.total_amount?.toFixed(2)})` : null
      };
    }

    if (status === 'Approved' || status === 'Released') {
      return {
        stepNumber: 5,
        stepTotal: 5,
        stepName: "Agreement Completed",
        isMyTurn: false,
        turnTag: "Completed",
        headline: "Agreement Successful · Funds Disbursed",
        description: `Milestone deliverables approved! $${Number(agreement.total_amount || 500).toFixed(2)} USDC has been disbursed directly to talent (${agreement.freelancer_tag})'s Pollar Stellar wallet. Available to transfer or hold on Stellar.`,
        actionType: 'COMPLETED',
        buttonText: null
      };
    }

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

    return {
      stepNumber: 1,
      stepTotal: 5,
      stepName: "Milestone Details",
      isMyTurn: false,
      turnTag: agreement.client_tag,
      headline: agreement.title,
      description: agreement.description,
      actionType: 'INFO',
      buttonText: null
    };
  };

  const getUserAgreements = (role = currentRole) => {
    const user = profiles[role] || profiles.freelancer;
    return agreements.filter(a => {
      if (role === 'client') {
        return a.client_tag?.toLowerCase() === user.user_tag?.toLowerCase() || a.creator_tag?.toLowerCase() === user.user_tag?.toLowerCase();
      }
      return a.freelancer_tag?.toLowerCase() === user.user_tag?.toLowerCase();
    });
  };

  const acceptAgreement = (agreementId) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      const nextStatus = agr.escrow?.is_funded ? "Active" : "Awaiting funding";
      return { 
        ...agr, 
        status: nextStatus,
        authorizations: (agr.authorizations || []).map(auth => 
          auth.tag?.toLowerCase() === actor.user_tag?.toLowerCase()
            ? { ...auth, approved: true, signed_at: new Date().toISOString() }
            : auth
        )
      };
    }));

    // Record in Agreement History Ledger
    addLog(agreementId, actor.user_tag, "Agreement Accepted & Signed", `${actor.name || actor.user_tag} accepted project terms, milestone deliverables, and escrow scope.`, "acceptance");

    // Notify the Hirer specifically!
    const hirerTag = matchingAgr?.client_tag || matchingAgr?.creator_tag || '@davidvance';
    const hirerNotice = {
      id: `notif-${Date.now()}-accept`,
      recipient_tag: hirerTag,
      target_role: "client",
      type: "invite",
      title: "Agreement Accepted by Talent",
      subtitle: `${actor.user_tag} accepted '${matchingAgr?.title || 'Milestone Agreement'}'. Proceed to fund escrow.`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: true,
      action_type: "fund_escrow",
      read: false
    };
    setNotifications(prev => [hirerNotice, ...prev]);

    showToast("Agreement Accepted", "Agreement terms digitally signed. Escrow funding authorized.", "success");
  };

  const fundEscrow = async (agreementId) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    const amount = matchingAgr?.total_amount || 500;
    const clientWallet = getRoleWallet('client') || 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB';

    const result = await executePollarTestnetFunding({
      agreementId,
      amountUsd: amount,
      depositorTag: actor.user_tag,
      depositorWallet: clientWallet,
      method: "Pollar Escrow Vault (Stellar USDC)"
    });

    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      return {
        ...agr,
        status: "Active",
        escrow: {
          ...agr.escrow,
          is_funded: true,
          funded_at: new Date().toISOString(),
          tx_hash: result.tx_hash,
          pollar_reference: result.reference
        }
      };
    }));

    setBalances(prev => ({
      ...prev,
      client: Math.max(0, (prev.client || 0) - amount)
    }));

    addLog(agreementId, actor.user_tag, "Escrow Capital Funded on Stellar (Pollar)", `$${amount.toFixed(2)} USDC locked in Pollar Escrow Vault (Tx: ${result.tx_hash.slice(0, 12)}...).`, "funding");

    // Notify talent specifically
    const talentTag = matchingAgr?.freelancer_tag || '@amaraokafor';
    const talentNotice = {
      id: `notif-${Date.now()}-fund`,
      recipient_tag: talentTag,
      target_role: "freelancer",
      type: "funding",
      title: "Escrow Deposit Secured on Stellar",
      subtitle: `${actor.user_tag} locked $${matchingAgr?.total_amount || 500} USDC into Pollar escrow for '${matchingAgr?.title || 'Milestone Project'}'. Work may begin.`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: true,
      action_type: "submit_work",
      read: false
    };
    setNotifications(prev => [talentNotice, ...prev]);

    showToast("Escrow Funded", "Escrow capital locked on Stellar Testnet.", "success");
  };

  const approveMilestone = (agreementId, milestoneId) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      return {
        ...agr,
        status: "Released",
        milestones: (agr.milestones || []).map(m => m.id === milestoneId ? { ...m, status: "Approved" } : m)
      };
    }));

    addLog(agreementId, actor.user_tag, "Milestone Deliverables Approved", `Hirer approved milestone deliverables for '${matchingAgr?.title || 'Project'}'. Authorized Pollar settlement release.`, "approval");

    executePollarPayout(agreementId);
    showToast("Milestone Approved", "Milestone approved and payout released!", "success");
  };

  const submitMilestone = (agreementId, milestoneId, data) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      return { 
        ...agr, 
        status: "Submitted",
        milestones: (agr.milestones || []).map(m => m.id === milestoneId ? {
          ...m,
          status: "Submitted",
          submission_url: data?.url || m.submission_url,
          repo_url: data?.repo || m.repo_url,
          submission_notes: data?.notes || m.submission_notes,
          attachments: data?.attachments || m.attachments,
          submitted_at: new Date().toISOString()
        } : m)
      };
    }));

    const fileCount = data?.attachments?.length || 0;
    const fileText = fileCount > 0 ? ` (${fileCount} file(s) attached via Supabase)` : '';
    addLog(agreementId, actor.user_tag, "Milestone Deliverables Submitted", `Submitted deliverables: ${data?.url || 'Preview URL'}${fileText}${data?.notes ? ` - ${data.notes.slice(0, 80)}` : ''}`, "submission");

    // Send notification specifically to Hirer
    const hirerTag = matchingAgr?.client_tag || matchingAgr?.creator_tag || '@davidvance';
    const hirerNotice = {
      id: `notif-${Date.now()}-submit`,
      recipient_tag: hirerTag,
      target_role: "client",
      type: "milestone",
      title: "Deliverables submitted for review",
      subtitle: `${actor.user_tag} submitted deliverables for '${matchingAgr?.title || 'Milestone Project'}'. Inspect and approve release.`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: true,
      action_type: "milestone_approval",
      read: false,
      status: "pending"
    };
    setNotifications(prev => [hirerNotice, ...prev]);

    showToast("Deliverables Submitted", "Deliverables submitted for hirer inspection.", "success");
  };

  const requestRevision = (agreementId, notes) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      return { ...agr, status: "Active" };
    }));

    addLog(agreementId, actor.user_tag, "Revision Requested", `Hirer requested adjustments: "${notes}"`, "revision");

    // Send notification specifically to Talent
    const talentTag = matchingAgr?.freelancer_tag || '@amaraokafor';
    const talentNotice = {
      id: `notif-${Date.now()}-rev`,
      recipient_tag: talentTag,
      target_role: "freelancer",
      type: "revision",
      title: "Revision Requested",
      subtitle: `${actor.user_tag} requested adjustments on '${matchingAgr?.title || 'Milestone Project'}': "${notes.slice(0, 80)}"`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: true,
      action_type: "submit_work",
      read: false
    };
    setNotifications(prev => [talentNotice, ...prev]);

    showToast("Revision Requested", "Talent notified of revision requests.", "info");
  };

  const issueMutualRefund = (agreementId, reason) => {
    const actor = getCurrentUser();
    const matchingAgr = agreements.find(a => a.id === agreementId);
    setAgreements(prev => prev.map(agr => {
      if (agr.id !== agreementId) return agr;
      return { ...agr, status: "Refunded" };
    }));
    addLog(agreementId, actor.user_tag, "Mutual Refund Executed", `Escrow refunded to hirer: "${reason}"`, "refund");
    
    // Notify counterparty
    const counterpartyTag = actor.role === 'client' ? matchingAgr?.freelancer_tag : matchingAgr?.client_tag;
    const targetRole = actor.role === 'client' ? 'freelancer' : 'client';
    const refundNotice = {
      id: `notif-${Date.now()}-refund`,
      recipient_tag: counterpartyTag,
      target_role: targetRole,
      type: "system",
      title: "Mutual Refund Executed",
      subtitle: `Escrow for '${matchingAgr?.title || 'Project'}' was mutually refunded. Reason: ${reason.slice(0, 60)}`,
      agreement_id: agreementId,
      time: "Just now",
      requires_action: false,
      read: false
    };
    setNotifications(prev => [refundNotice, ...prev]);

    showToast("Refund Executed", "Escrow refunded to hirer.", "warning");
  };

  // Create Project / Agreement
  const createAgreement = ({ title, description, category, freelancer_tag, amount, milestones, dispute_terms }) => {
    const user = getCurrentUser();
    const newId = `KRD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = parseFloat(amount) || 500.0;
    const targetTag = freelancer_tag?.startsWith('@') ? freelancer_tag : `@${freelancer_tag}`;
    const isClient = user.role === 'client' || currentRole === 'client';
    const clientTag = isClient ? user.user_tag : (targetTag || "@davidvance");
    const freelancerTag = isClient ? (targetTag || "@amaraokafor") : user.user_tag;

    const newAgreement = {
      id: newId,
      title: title || "New Milestone Agreement",
      description: description || "Milestone project agreement on Kordia.",
      category: category || "Design & Engineering",
      creator_tag: user.user_tag,
      client_tag: clientTag,
      freelancer_tag: freelancerTag,
      total_amount: totalAmount,
      currency: "USD",
      status: "Awaiting acceptance",
      created_at: new Date().toISOString(),
      deadline: "2026-12-15",
      milestones: milestones || [
        {
          id: `ms-${newId}-1`,
          title: "Milestone 1: Deliverables & Scope",
          deliverable: description || "Production deliverables as per specifications.",
          amount: totalAmount,
          due_date: "2026-12-10",
          status: "Pending"
        }
      ],
      escrow: {
        is_funded: false,
        funded_at: null,
        pool: "Pollar Escrow Vault",
        tx_hash: null,
        memo: `${newId}::ESCROW_DEPOSIT`,
        deposit_asset: "USDC",
        deposit_amount: totalAmount
      },
      payout: {
        target_asset: "USDC",
        chain: "STELLAR",
        network: "testnet",
        recipient_wallet: getRoleWallet('freelancer') || "GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU",
        recipient_tag: freelancerTag,
        gross_amount_usd: totalAmount,
        protocol_fee_usd: +(totalAmount * 0.005).toFixed(2),
        net_usd: +(totalAmount * 0.995).toFixed(2),
        status: "PENDING",
        trustline_status: "VERIFIED_100_PERCENT"
      }
    };

    setAgreements(prev => [newAgreement, ...prev]);
    setSelectedAgreementId(newId);
    setActiveView('details');
    setActiveModal(null);

    const invitedRoleLabel = isClient ? "Talent" : "Hirer";
    addLog(newId, user.user_tag, `Project Created & ${invitedRoleLabel} Invited`, `Tagged ${targetTag} to ${title} ($${totalAmount.toFixed(2)})`, 'creation');

    // Notify counterparty
    const inviteNotif = {
      id: `notif-${Date.now()}`,
      type: "invite",
      title: "Project Invitation",
      subtitle: `You were invited to '${title}' by ${user.user_tag}`,
      agreement_id: newId,
      time: "Just now",
      requires_action: true,
      action_type: "invite",
      read: false,
      status: "pending"
    };
    setNotifications(prev => [inviteNotif, ...prev]);

    // Social push notice
    if (linkedSocial.whatsapp_enabled) {
      showToast("WhatsApp Notice Dispatched", `Project invite sent to ${targetTag}'s linked WhatsApp.`, "success");
    } else {
      showToast("Project Created", `Agreement ${newId} initialized. ${invitedRoleLabel} ${targetTag} invited.`, "success");
    }
    return newAgreement;
  };

  // Auth Functions
  const login = (identifier, password) => {
    const clean = identifier.trim().toLowerCase();
    const found = Object.entries(profiles).find(([k, u]) => 
      u.email?.toLowerCase() === clean || 
      u.user_tag?.toLowerCase() === clean ||
      u.user_tag?.toLowerCase() === `@${clean}`
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
      setIsLandingOpen(false);
      return true;
    } else {
      showToast("Incorrect Password", "Use seed password: Password123!", "error");
      return false;
    }
  };

  const signUp = ({ name, email, user_tag, role, work_title, password, stellar_wallet }) => {
    const cleanTag = user_tag.startsWith('@') ? user_tag : `@${user_tag}`;
    const roleKey = role === 'client' ? 'client' : 'freelancer';

    const newProfile = {
      id: `usr-${Date.now()}`,
      user_tag: cleanTag,
      name: name,
      email: email,
      role: roleKey,
      role_label: roleKey === 'client' ? 'Hirer (Employer)' : 'Talent (Freelancer)',
      company: roleKey === 'client' ? (work_title || 'Private Employer') : undefined,
      title: roleKey === 'freelancer' ? (work_title || 'Graphic Designer') : undefined,
      location: roleKey === 'freelancer' ? 'Lagos, Nigeria' : 'London, UK',
      is_verified: true,
      verified_at: new Date().toISOString(),
      password: password || 'Password123!',
      avatar: roleKey === 'client' ? USERS.client.avatar : USERS.freelancer.avatar,
      wallet_details: {
        chain: "STELLAR",
        network: "testnet",
        public_key: stellar_wallet || (roleKey === 'client' ? 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB' : 'GBBXZY3DLLBAD2AZ25YPQ7X3YXOA63VREVME473CZRSSHQFXGALLYLNU'),
        custody: "Custodial (Pollar Embedded)",
        asset: "USDC",
        trustline_active: true
      }
    };

    setProfiles(prev => ({
      ...prev,
      [roleKey]: newProfile
    }));

    setBalances(prev => ({
      ...prev,
      [roleKey]: roleKey === 'freelancer' ? 2480.00 : 4250.00
    }));

    setCurrentRole(roleKey);
    setIsAuthenticated(true);
    setIsLandingOpen(false);
    try { localStorage.setItem(STORAGE_KEY_AUTH, 'true'); } catch (e) {}

    showToast("Account Created", `Welcome to Kordia! Tag ${cleanTag} active.`, "success");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try { localStorage.removeItem(STORAGE_KEY_AUTH); } catch (e) {}
    setIsLandingOpen(true);
    showToast("Signed Out", "You have signed out.", "info");
  };

  const getUserNotifications = () => {
    const user = getCurrentUser();
    if (!user) return notifications;
    return notifications.filter(n => {
      // 1. Explicit user tag match
      if (n.recipient_tag) {
        return n.recipient_tag.toLowerCase() === user.user_tag?.toLowerCase();
      }
      // 2. Explicit target role match
      if (n.target_role) {
        return n.target_role === user.role || n.target_role === currentRole;
      }
      // 3. Fallback heuristics for legacy notices
      if (n.action_type === 'invite' || n.subtitle?.toLowerCase().includes('invited to')) {
        return user.role === 'freelancer' || currentRole === 'freelancer';
      }
      if (n.action_type === 'milestone_approval' || n.title?.toLowerCase().includes('deliverables submitted') || n.title?.toLowerCase().includes('deliverables inspection')) {
        return user.role === 'client' || currentRole === 'client';
      }
      return true;
    });
  };

  const resetAllData = () => {
    setAgreements([]);
    setBalances({ client: 0.00, freelancer: 0.00 });
    setActivityLogs([]);
    setNotifications([]);
    setReviews({});
    setSelectedAgreementId(null);
    try {
      localStorage.setItem(STORAGE_KEY_AGREEMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify({ client: 0.00, freelancer: 0.00 }));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify({}));
    } catch (e) {}
    showToast("Workspace Reset", "All agreements, balances, and history cleared for clean testing.", "info");
    setActiveView('projects');
  };

  const userNotifications = getUserNotifications();
  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  return (
    <AgreementContext.Provider
      value={{
        agreements,
        profiles,
        balances,
        currentBalance: getCurrentBalance(),
        onChainBalance,
        fetchLiveStellarBalance,
        notifications: userNotifications,
        allNotifications: notifications,
        unreadNotificationsCount,
        linkedSocial,
        reviews,
        activityLogs,
        currentRole,
        selectedAgreementId,
        activeView,
        displayCurrency,
        toastMessage,
        isAuthenticated,
        isLandingOpen,
        isAlertsOpen,
        activeModal,
        setIsLandingOpen,
        setIsAlertsOpen,
        setActiveModal,
        setDisplayCurrency,
        formatCurrency,
        login,
        signUp,
        logout,
        resetAllData,
        setCurrentRole,
        setSelectedAgreementId,
        setActiveView,
        getCurrentUser,
        getActiveAgreement,
        findUserByTag,
        fundAccount,
        withdrawFunds,
        transferToChain,
        respondToInvite,
        approveMilestoneFromAlert,
        markAllNotificationsAsRead,
        updateLinkedSocial,
        sendSocialTestAlert,
        submitReview,
        createAgreement,
        executePollarPayout,
        getAgreementNextAction,
        getUserAgreements,
        acceptAgreement,
        fundEscrow,
        approveMilestone,
        submitMilestone,
        requestRevision,
        issueMutualRefund,
        showToast,
        addLog,
        roleWallets,
        getRoleWallet,
        linkWalletToRole,
        disconnectRoleWallet
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
