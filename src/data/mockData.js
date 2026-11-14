// Kordia PRD Mock Data and Constants
// Version 1.1 · Two-Party Peer Escrow (Hirer & Talent), Verified Tags & P2P Settlement

export const SEED_CREDENTIALS = {
  hirer: {
    role: "client",
    user_tag: "@davidvance",
    email: "david@apexdesign.co.uk",
    password: "Password123!",
    name: "David Vance",
    company: "Apex Design Studio Ltd"
  },
  talent: {
    role: "freelancer",
    user_tag: "@amaraokafor",
    email: "amara.okafor@devhub.ng",
    password: "Password123!",
    name: "Amara Okafor",
    title: "Senior Full-Stack & Smart Contract Engineer"
  },
  admin: {
    role: "admin",
    user_tag: "@admin",
    email: "admin@kordia.work",
    password: "AdminSecure2026!",
    name: "Kordia Protocol Admin",
    company: "Kordia Global Escrow Node"
  }
};

export const USERS = {
  client: {
    id: "usr-client-01",
    user_tag: "@davidvance",
    name: "David Vance",
    company: "Apex Design Studio Ltd",
    role: "client",
    role_label: "Hirer (Client)",
    location: "London, United Kingdom",
    email: "david@apexdesign.co.uk",
    password: "Password123!",
    is_verified: true,
    verified_at: "2026-11-01T12:00:00Z",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    shielded_z_address: "u1apex93kd84920kmd01928472910kdjs8839201928374652019283746589",
    viewing_key: "zxviews10928374650192837465201928374658920192837465019283746520",
    pollar_id: "POL-UK-9921",
    total_spent: "$4,250.00",
    active_agreements: 1
  },
  freelancer: {
    id: "usr-free-02",
    user_tag: "@amaraokafor",
    name: "Amara Okafor",
    title: "Senior Full-Stack & Smart Contract Engineer",
    role: "freelancer",
    role_label: "Talent (Freelancer)",
    location: "Lagos, Nigeria",
    email: "amara.okafor@devhub.ng",
    password: "Password123!",
    is_verified: true,
    verified_at: "2026-11-02T14:30:00Z",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    shielded_z_address: "u1amara01928374650192837465lagos091827364510293847561029384756",
    viewing_key: "zxviews29182736451029384756102938475619283746501928374652019283",
    pollar_id: "POL-NG-8840",
    bank_details: {
      bank_name: "Guaranty Trust Bank (GTBank)",
      account_number: "0149928371",
      account_name: "AMARA BLESSING OKAFOR",
      currency: "NGN",
      bvn_verified: true
    },
    total_earned: "$8,950.00",
    active_agreements: 1
  },
  admin: {
    id: "usr-admin-00",
    user_tag: "@admin",
    name: "Kordia Protocol Admin",
    company: "Kordia Global Escrow Node",
    role: "admin",
    role_label: "Platform Admin",
    location: "Global Distributed Node",
    email: "admin@kordia.work",
    password: "AdminSecure2026!",
    is_verified: true,
    verified_at: "2026-09-01T00:00:00Z",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    pollar_id: "POL-GLOBAL-0001",
    total_volume_overseen: "$184,200.00"
  }
};

export const INITIAL_AGREEMENTS = [
  {
    id: "KRD-2026-9042",
    title: "Apex E-Commerce Platform & Checkout Integration",
    description: "Build and deploy a privacy-compliant modern web storefront with product catalog, cart persistence, and mobile-optimized checkout for international clients.",
    category: "Full-Stack Web Development",
    creator_tag: "@davidvance",
    client_tag: "@davidvance",
    freelancer_tag: "@amaraokafor",
    client_id: "usr-client-01",
    freelancer_id: "usr-free-02",
    total_amount: 500.0,
    currency: "USD",
    equivalent_zec: 12.50,
    status: "Submitted", // 'Awaiting acceptance' | 'Awaiting funding' | 'Active' | 'Submitted' | 'Approved' | 'Released' | 'Refunded'
    created_at: "2026-11-12T09:40:00Z",
    deadline: "2026-11-25",
    dispute_terms: {
      model: "Direct Peer-to-Peer Consensus",
      description: "Direct Hirer & Talent mutual agreement. Hirer approves release to Talent or requests revisions; mutual refund returns funds to Hirer.",
      objection_window_days: 7,
      evidence_standard: "Verifiable deployed URL, Git commit history, test logs"
    },
    milestones: [
      {
        id: "ms-9042-01",
        title: "Milestone 1: Production Frontend & Responsive UI",
        deliverable: "Next.js + Tailwind web application with responsive layout, product showcase, and live Vercel URL.",
        amount: 500.0,
        due_date: "2026-11-20",
        status: "Submitted",
        submission_url: "https://apex-store-staging.vercel.app",
        repo_url: "https://github.com/amara-okafor/apex-commerce-mvp",
        submission_notes: "Deployed to Vercel production preview. 100% responsive across iPhone 15, iPad, and 4K displays. All 18 automated Cypress & Jest test suites passing. Audit score 98/100 on Lighthouse.",
        submitted_at: "2026-11-14T07:15:00Z",
        attachments: [
          { name: "Lighthouse_Audit_Performance_99.pdf", size: "1.4 MB", type: "pdf" },
          { name: "Integration_Verification_Report.pdf", size: "840 KB", type: "pdf" }
        ]
      }
    ],
    authorizations: [
      { party: "client", tag: "@davidvance", name: "David Vance (Hirer)", approved: false, signed_at: null },
      { party: "freelancer", tag: "@amaraokafor", name: "Amara Okafor (Talent)", approved: true, signed_at: "2026-11-12T10:15:00Z" }
    ],
    escrow: {
      is_funded: true,
      funded_at: "2026-11-12T10:30:00Z",
      pool: "Zcash Orchard Shielded Pool",
      tx_hash: "0x8fa4b9319e76fca55301bcde99a43928174e92a83fbb092305829d4c1",
      shielded_memo: "KRD-2026-9042::ESCROW_DEPOSIT_500USD_APEX",
      deposit_asset: "ZEC (Shielded)",
      deposit_amount: 12.50,
      usd_value: 500.00,
      is_simulated: true
    },
    payout: {
      target_currency: "NGN",
      bank_name: "Guaranty Trust Bank (GTBank)",
      account_number: "0149928371",
      account_name: "AMARA BLESSING OKAFOR",
      gross_amount_usd: 500.0,
      protocol_fee_usd: 2.50,
      net_usd: 497.50,
      fx_rate: 1680.50,
      estimated_local_amount: 836048.75,
      status: "PENDING",
      provider_reference: "POL-NGN-LIVE-SIM",
      quote_expires_at: "2026-11-14T11:45:00Z"
    }
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: "act-01",
    timestamp: "2026-11-14T07:15:00Z",
    agreement_id: "KRD-2026-9042",
    actor: "@amaraokafor",
    action: "Milestone Deliverables Submitted",
    details: "Deployed live preview to Vercel staging. 18 test suites passing.",
    type: "submission"
  },
  {
    id: "act-02",
    timestamp: "2026-11-12T10:30:00Z",
    agreement_id: "KRD-2026-9042",
    actor: "@davidvance",
    action: "Shielded Escrow Funded",
    details: "12.50 ZEC locked into Zcash Orchard shielded pool with encrypted memo.",
    type: "funding"
  },
  {
    id: "act-03",
    timestamp: "2026-11-12T10:15:00Z",
    agreement_id: "KRD-2026-9042",
    actor: "@amaraokafor",
    action: "Agreement Accepted & Signed",
    details: "Amara Okafor accepted project terms and milestone delivery scope.",
    type: "acceptance"
  },
  {
    id: "act-04",
    timestamp: "2026-11-12T09:40:00Z",
    agreement_id: "KRD-2026-9042",
    actor: "@davidvance",
    action: "Agreement Created & Counterparty Tagged",
    details: "David Vance tagged @amaraokafor to $500.00 Web App Agreement.",
    type: "creation"
  }
];

export const EXCHANGE_RATES = {
  ZEC_USD: 40.00,
  USD_NGN: 1680.50,
  USD_KES: 130.25,
  USD_GHS: 15.80,
  USDC_USD: 1.00
};
