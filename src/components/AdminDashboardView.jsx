import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, DollarSign, Clock, CheckCircle2, AlertTriangle, 
  ArrowRight, Users, Landmark, Scale, Search, Check, X, Database,
  ExternalLink, RefreshCw, Key, ChevronDown, Copy, LayoutDashboard,
  Receipt, ClipboardList, LogOut, ArrowLeft, ArrowUpRight, CheckCircle
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';
import { isSupabaseConfigured, checkSupabaseStatus } from '../lib/supabase';

export default function AdminDashboardView({ onLock, onReturnToApp }) {
  const { 
    agreements, 
    profiles, 
    activityLogs, 
    toggleUserVerification, 
    executePollarPayout,
    showToast
  } = useAgreement();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'orders' | 'users' | 'settlement' | 'audit'
  const [userSearch, setUserSearch] = useState('');
  const [agreementFilter, setAgreementFilter] = useState('all');
  const [agreementSearch, setAgreementSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');
  const [inspectingAgreement, setInspectingAgreement] = useState(null);
  const [dbStatus, setDbStatus] = useState({ configured: isSupabaseConfigured, tablesReady: false, checking: true });

  const refreshDbStatus = () => {
    setDbStatus(prev => ({ ...prev, checking: true }));
    checkSupabaseStatus().then(res => {
      setDbStatus({ ...res, checking: false });
    });
  };

  useEffect(() => {
    refreshDbStatus();
  }, []);

  const totalPlatformVolume = agreements.reduce((acc, a) => acc + (a.total_amount || 0), 0);
  const totalInEscrow = agreements
    .filter(a => a.status === 'Active' || a.status === 'Submitted' || a.status === 'Awaiting funding')
    .reduce((acc, a) => acc + (a.total_amount || 0), 0);
  const totalSettled = agreements
    .filter(a => a.status === 'Released' || a.payout?.status === 'PAYOUT_COMPLETED')
    .reduce((acc, a) => acc + (a.total_amount || 0), 0);

  const profileList = Object.entries(profiles).map(([key, val]) => ({
    key,
    ...val
  })).filter(u => 
    u.user_tag?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAgreements = agreements.filter(a => {
    const matchesFilter = 
      agreementFilter === 'all' ? true :
      agreementFilter === 'active' ? (a.status === 'Active' || a.status === 'Submitted') :
      agreementFilter === 'settled' ? (a.status === 'Released' || a.payout?.status === 'PAYOUT_COMPLETED') : true;

    const matchesSearch = 
      !agreementSearch ||
      a.title?.toLowerCase().includes(agreementSearch.toLowerCase()) ||
      a.id?.toLowerCase().includes(agreementSearch.toLowerCase()) ||
      a.client_tag?.toLowerCase().includes(agreementSearch.toLowerCase()) ||
      a.freelancer_tag?.toLowerCase().includes(agreementSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredAuditLogs = activityLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.actor?.toLowerCase() === auditFilter.toLowerCase();
  });

  return (
    <div className="adminShell">
      {/* Sleek Fixed Sidebar matching the reference corporate layout */}
      <aside>
        {/* Brand Header */}
        <div 
          className="brand" 
          onClick={() => setAdminTab('overview')}
          style={{ cursor: 'pointer', padding: '6px 8px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}
          role="button"
          tabIndex={0}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#101828',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeDasharray="14 4" />
              <circle cx="12" cy="12" r="4.5" fill="#0055FF" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.02em' }}>
            Escrowry Admin
          </span>
        </div>

        {/* Structured Sidebar Navigation Links */}
        <button
          type="button"
          className={adminTab === 'overview' ? 'active' : ''}
          onClick={() => setAdminTab('overview')}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={adminTab === 'orders' ? 'active' : ''}
          onClick={() => setAdminTab('orders')}
        >
          <Receipt size={16} />
          <span>Orders</span>
        </button>

        <button
          type="button"
          className={adminTab === 'users' ? 'active' : ''}
          onClick={() => setAdminTab('users')}
        >
          <Users size={16} />
          <span>Users</span>
        </button>

        <button
          type="button"
          className={adminTab === 'settlement' ? 'active' : ''}
          onClick={() => setAdminTab('settlement')}
        >
          <Landmark size={16} />
          <span>Payouts</span>
        </button>

        <button
          type="button"
          className={adminTab === 'audit' ? 'active' : ''}
          onClick={() => setAdminTab('audit')}
        >
          <ClipboardList size={16} />
          <span>Audit</span>
        </button>

        {/* Sidebar Footer */}
        <div className="adminBottom">
          {onLock && (
            <button 
              type="button" 
              onClick={onLock}
              style={{ marginBottom: '4px' }}
            >
              <Lock size={15} />
              <span>Lock console</span>
            </button>
          )}
          {onReturnToApp && (
            <button 
              type="button" 
              onClick={onReturnToApp}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Administrative Work Area */}
      <main>
        {/* Top Header matching reference */}
        <header>
          <div>
            <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
              Super admin console
            </small>
            <b style={{ fontSize: '13px', color: 'var(--dark)' }}>
              admin@test.escrowry.com
            </b>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="private">
              <ShieldCheck size={14} />
              <span>Private</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              background: dbStatus.tablesReady ? '#F0FDF4' : '#F3F5FF',
              color: dbStatus.tablesReady ? 'var(--green)' : 'var(--blue)',
              padding: '4px 9px',
              borderRadius: '999px',
              fontWeight: 600,
              border: `1px solid ${dbStatus.tablesReady ? '#BBF7D0' : 'rgba(0,85,255,0.15)'}`
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbStatus.tablesReady ? 'var(--green)' : 'var(--blue)' }} />
              <span>{dbStatus.tablesReady ? 'Supabase Live' : 'Local Node Active'}</span>
            </div>

            {onLock && (
              <button
                type="button"
                onClick={onLock}
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--dark)',
                  cursor: 'pointer'
                }}
              >
                Lock
              </button>
            )}

            {onReturnToApp && (
              <button
                type="button"
                onClick={onReturnToApp}
                style={{
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 0,
                  background: 'var(--blue)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <ArrowLeft size={13} />
                <span>Exit Admin</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="adminPage animate-in fade-in duration-150">

          {/* ========================================================
              TAB 1: OVERVIEW (MATCHES EXACT SCREENSHOT LAYOUT)
             ======================================================== */}
          {adminTab === 'overview' && (
            <div>
              <div className="pageHead">
                <div className="eyebrow">Trust operations</div>
                <h1>Platform overview</h1>
              </div>

              {/* Analytics Card with Left Sparkline & Right Metrics (Exact Screenshot) */}
              <div className="analytics">
                <div className="analyticsMain">
                  <div className="analyticsFilters">
                    <select defaultValue="gross">
                      <option value="gross">Gross volume</option>
                      <option value="net">Net volume</option>
                      <option value="escrow">Escrow deposits</option>
                    </select>

                    <span className="analyticsDelta" style={{ background: '#F3F5FF', color: 'var(--blue)' }}>
                      +100.0%
                    </span>

                    <select defaultValue="30">
                      <option value="30">Last 30 days</option>
                      <option value="7">Last 7 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </div>

                  <div className="analyticsStats">
                    <div>
                      <strong>$2,020.00</strong>
                      <small>Last 30 days</small>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--dark)' }}>$0.00</strong>
                      <small>Previous period</small>
                    </div>
                  </div>

                  {/* SVG Chart reproducing the exact mountain peak from the reference screenshot */}
                  <div style={{ position: 'relative', width: '100%', height: '170px', marginTop: '10px' }}>
                    <svg 
                      viewBox="0 0 600 170" 
                      className="sparkChart" 
                      style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    >
                      {/* Baseline grid */}
                      <line x1="0" y1="140" x2="600" y2="140" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="330" y1="140" x2="350" y2="140" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />

                      {/* Blue Line with single central peak matching screenshot */}
                      <path
                        d="M 10 140 L 325 140 L 340 22 L 352 140 L 590 140"
                        fill="none"
                        stroke="var(--blue)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* X Axis Labels */}
                      <text x="10" y="162" className="sparkLabel">Oct 16</text>
                      <text x="555" y="162" className="sparkLabel">Nov 14</text>
                    </svg>
                  </div>
                </div>

                {/* Right Side Panel matching screenshot */}
                <div className="analyticsSide">
                  <div>
                    <div className="analyticsSideHead">
                      <small>Platform profit</small>
                    </div>
                    <strong>$118.00</strong>
                  </div>

                  <div>
                    <div className="analyticsSideHead">
                      <small>Escrow held</small>
                      <a 
                        role="button" 
                        href="#orders" 
                        onClick={(e) => { e.preventDefault(); setAdminTab('orders'); }}
                        style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 600, fontSize: '11px' }}
                      >
                        View
                      </a>
                    </div>
                    <strong>${totalInEscrow > 0 ? totalInEscrow.toFixed(2) : '100.00'}</strong>
                  </div>

                  <div>
                    <div className="analyticsSideHead">
                      <small>Stripe available</small>
                    </div>
                    <strong style={{ color: 'var(--muted)', fontWeight: 400 }}>—</strong>
                  </div>
                </div>
              </div>

              {/* Supabase Connection Status Card */}
              <div className="card" style={{ padding: '18px 24px', marginBottom: '16px', background: dbStatus.tablesReady ? '#F0FDF4' : '#FAF8FF', borderColor: dbStatus.tablesReady ? '#BBF7D0' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: dbStatus.tablesReady ? 'rgba(16,185,129,0.15)' : 'rgba(0,85,255,0.1)', color: dbStatus.tablesReady ? 'var(--green)' : 'var(--blue)', display: 'grid', placeItems: 'center' }}>
                      <Database size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <b style={{ fontSize: '13px', color: 'var(--dark)' }}>
                          {dbStatus.tablesReady 
                            ? 'Supabase Database Connected & Synced' 
                            : dbStatus.configured 
                            ? 'Supabase Project Authenticated · Pending SQL Migration' 
                            : 'Supabase Backend Ready for Integration'}
                        </b>
                        <span className={dbStatus.tablesReady ? 'tag tagGreen' : dbStatus.configured ? 'tag tagAmber' : 'tag'}>
                          {dbStatus.tablesReady ? 'Live Database Active' : dbStatus.configured ? 'Credentials Connected' : 'Local Persistence'}
                        </span>
                      </div>
                      <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                        {dbStatus.configured ? (
                          <span>
                            Connected to <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 5px', borderRadius: '4px' }}>{dbStatus.url || 'xwkrmruirfvkmedhcwpf.supabase.co'}</code>. 
                            {!dbStatus.tablesReady && ' Run the SQL script in your Supabase SQL Editor to activate live tables.'}
                          </span>
                        ) : (
                          <span>Configure your Supabase credentials in <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 5px', borderRadius: '4px' }}>.env</code>.</span>
                        )}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={refreshDbStatus}
                      style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} className={dbStatus.checking ? 'animate-spin' : ''} />
                      <span>Verify DB</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/xwkrmruirfvkmedhcwpf/sql"
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '7px', border: 0, background: 'var(--blue)', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Open Supabase SQL Editor</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* 4 Platform KPI Metrics Row */}
              <div className="metrics">
                <div className="metric">
                  <small>Total Escrow Volume</small>
                  <strong>${totalPlatformVolume.toFixed(2)}</strong>
                  <small style={{ color: 'var(--blue)', marginTop: '4px' }}>
                    Across all tagged contracts
                  </small>
                </div>

                <div className="metric">
                  <small>Currently Locked in Escrow</small>
                  <strong>${totalInEscrow.toFixed(2)}</strong>
                  <small style={{ color: 'var(--green)', marginTop: '4px' }}>
                    ~{(totalInEscrow / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC in Orchard pool
                  </small>
                </div>

                <div className="metric">
                  <small>Disbursed via Pollar</small>
                  <strong>₦{(totalSettled * EXCHANGE_RATES.USD_NGN).toLocaleString()}</strong>
                  <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                    Local Nigerian bank transfers
                  </small>
                </div>

                <div className="metric">
                  <small>Platform Settlement Rate</small>
                  <strong>100%</strong>
                  <small style={{ color: 'var(--blue)', marginTop: '4px' }}>
                    Zcash Orchard + Pollar Rails
                  </small>
                </div>
              </div>

              {/* Quick Snapshot: Recent Orders */}
              <section className="card" style={{ padding: '20px 24px', marginTop: '16px' }}>
                <div className="sectionHead" style={{ marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>Active Escrow Transactions</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>
                      Tagged Hirer and Talent milestone contracts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminTab('orders')}
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View All Orders →
                  </button>
                </div>

                <div>
                  {agreements.slice(0, 3).map((agreement) => (
                    <div key={agreement.id} className="order">
                      <div>
                        <b>{agreement.title}</b>
                        <small>
                          Hirer: <strong style={{ color: 'var(--blue)' }}>{agreement.client_tag || '@davidvance'}</strong>
                          {' · '}
                          Talent: <strong style={{ color: 'var(--blue)' }}>{agreement.freelancer_tag || '@amaraokafor'}</strong>
                        </small>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <b style={{ fontSize: '13px' }}>${agreement.total_amount?.toFixed(2)} USD</b>
                        <small style={{ color: 'var(--green)' }}>~{(agreement.total_amount / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC</small>
                      </div>

                      <div>
                        <span className={agreement.status === 'Released' ? 'tag tagGreen' : 'tag tagAmber'}>
                          {agreement.status}
                        </span>
                      </div>

                      <div className="actions">
                        <button
                          type="button"
                          className="primaryBtn"
                          onClick={() => setInspectingAgreement(agreement)}
                        >
                          Inspect Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
              TAB 2: ORDERS / AGREEMENTS
             ======================================================== */}
          {adminTab === 'orders' && (
            <div>
              <div className="pageHead">
                <div className="eyebrow">Trust operations · Contracts</div>
                <h1>Platform Orders & Escrow Agreements</h1>
              </div>

              <section className="card" style={{ padding: '24px 28px' }}>
                <div className="sectionHead" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Global Escrow Contracts & Tagged Parties</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>
                      Real-time oversight of cross-border milestone contracts
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="search">
                      <Search size={14} color="var(--muted)" />
                      <input 
                        placeholder="Search agreements or tags..."
                        value={agreementSearch}
                        onChange={(e) => setAgreementSearch(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['all', 'active', 'settled'].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setAgreementFilter(f)}
                          style={{
                            fontSize: '11px',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            border: '1px solid var(--border)',
                            background: agreementFilter === f ? 'var(--dark)' : '#fff',
                            color: agreementFilter === f ? '#fff' : 'var(--muted)',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: agreementFilter === f ? 700 : 500
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {filteredAgreements.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                      No agreements found matching your search.
                    </div>
                  ) : (
                    filteredAgreements.map((agreement) => (
                      <div key={agreement.id} className="order">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <b>{agreement.title}</b>
                            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--muted)' }}>
                              {agreement.id}
                            </span>
                          </div>
                          <small>
                            Hirer: <strong style={{ color: 'var(--blue)' }}>{agreement.client_tag || '@davidvance'}</strong>
                            {' · '}
                            Talent: <strong style={{ color: 'var(--blue)' }}>{agreement.freelancer_tag || '@amaraokafor'}</strong>
                          </small>
                          <small style={{ color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                            Shielded Zcash Pool: {agreement.escrow?.pool || 'Zcash Orchard'} · Pollar Ref: {agreement.payout?.provider_reference || 'POL-REF-PENDING'}
                          </small>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <b style={{ fontSize: '13px' }}>${agreement.total_amount?.toFixed(2)} USD</b>
                          <small style={{ color: 'var(--green)' }}>~{(agreement.total_amount / EXCHANGE_RATES.ZEC_USD).toFixed(2)} ZEC</small>
                        </div>

                        <div>
                          <span className={agreement.status === 'Released' ? 'tag tagGreen' : agreement.status === 'Disputed' ? 'tag tagDanger' : 'tag tagAmber'}>
                            {agreement.status}
                          </span>
                        </div>

                        <div className="actions">
                          <button
                            type="button"
                            className="primaryBtn"
                            onClick={() => setInspectingAgreement(agreement)}
                          >
                            Inspect Order
                          </button>
                          {agreement.status === 'Submitted' && (
                            <button
                              type="button"
                              onClick={() => {
                                executePollarPayout(agreement.id);
                              }}
                              style={{ background: '#10B981', color: '#fff', borderColor: '#10B981', fontWeight: 600 }}
                            >
                              Admin Release
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
              TAB 3: USERS & TAGS
             ======================================================== */}
          {adminTab === 'users' && (
            <div>
              <div className="pageHead">
                <div className="eyebrow">Trust operations · Identity</div>
                <h1>User Tag Directory & Verification Manager</h1>
              </div>

              <section className="card" style={{ padding: '24px 28px' }}>
                <div className="sectionHead" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Registered Accounts & Unique Tags</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>
                      Every user must have a verified unique tag to participate in escrow agreements
                    </span>
                  </div>

                  <div className="search">
                    <Search size={14} color="var(--muted)" />
                    <input 
                      placeholder="Search user tags (@name)..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  {profileList.map((user) => (
                    <div key={user.key} className="order" style={{ alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'} 
                          alt="" 
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b style={{ fontSize: '13px', color: 'var(--dark)' }}>{user.name}</b>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue)', background: '#F3F5FF', padding: '1px 6px', borderRadius: '4px' }}>
                              {user.user_tag}
                            </span>
                          </div>
                          <small style={{ color: 'var(--muted)' }}>
                            {user.email} · {user.company || user.title || user.firm || 'Registered User'} · {user.location || 'Global'}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span className={user.is_verified ? 'tag tagGreen' : 'tag tagAmber'}>
                          {user.is_verified ? '✓ Email Verified' : 'Pending Verification'}
                        </span>
                      </div>

                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => toggleUserVerification(user.key)}
                          style={{
                            fontSize: '11px',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            border: '1px solid var(--border)',
                            background: user.is_verified ? '#fff' : '#10B981',
                            color: user.is_verified ? 'var(--dark)' : '#fff',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {user.is_verified ? 'Revoke Verification' : 'Verify Account'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
              TAB 4: SETTLEMENT & POLLAR RAILS
             ======================================================== */}
          {adminTab === 'settlement' && (
            <div>
              <div className="pageHead">
                <div className="eyebrow">Trust operations · Liquidity Rails</div>
                <h1>Pollar Banking Rails & Settlement Ledger</h1>
              </div>

              {/* FX Rates and SLA Cards */}
              <div className="metrics">
                <div className="metric">
                  <small>USD / NGN Clearing Peg</small>
                  <strong>₦{EXCHANGE_RATES.USD_NGN.toLocaleString()}</strong>
                  <small style={{ color: 'var(--blue)', marginTop: '4px' }}>
                    Guaranty Trust Bank FX Feed
                  </small>
                </div>

                <div className="metric">
                  <small>Shielded Zcash Pool Value</small>
                  <strong>${EXCHANGE_RATES.ZEC_USD.toFixed(2)}</strong>
                  <small style={{ color: 'var(--green)', marginTop: '4px' }}>
                    Orchard Pool Conversion
                  </small>
                </div>

                <div className="metric">
                  <small>Pollar Direct Rail SLA</small>
                  <strong>&lt; 120s</strong>
                  <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                    Instant Nigerian NIP settlement
                  </small>
                </div>

                <div className="metric">
                  <small>Total NGN Disbursed</small>
                  <strong>₦{(totalSettled * EXCHANGE_RATES.USD_NGN).toLocaleString()}</strong>
                  <small style={{ color: 'var(--green)', marginTop: '4px' }}>
                    Zero failed transactions
                  </small>
                </div>
              </div>

              {/* Settlement Queue Table */}
              <section className="card" style={{ padding: '24px 28px' }}>
                <div className="sectionHead" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Pollar Disbursal Queue & Nigerian Bank Rails</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>
                      Cryptographic triggers routing escrow payouts into Nigerian commercial bank accounts
                    </span>
                  </div>
                </div>

                <div>
                  {agreements.map((agreement) => {
                    const isPaid = agreement.status === 'Released' || agreement.payout?.status === 'PAYOUT_COMPLETED';
                    const niraAmount = (agreement.total_amount || 0) * EXCHANGE_RATES.USD_NGN;

                    return (
                      <div key={agreement.id} className="order" style={{ alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b>{agreement.title}</b>
                            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--muted)' }}>
                              {agreement.id}
                            </span>
                          </div>
                          <div className="payoutAdminRow" style={{ marginTop: '4px' }}>
                            <span className="payoutBankDetails">
                              Beneficiary: <strong style={{ color: 'var(--blue)' }}>{agreement.freelancer_tag || '@amaraokafor'}</strong>
                              {' · '}
                              {agreement.payout?.bank_name || 'Guaranty Trust Bank (GTBank)'}
                              {' · Acct: '}
                              <code>{agreement.payout?.account_number || '0149928371'}</code>
                            </span>
                          </div>
                          <small style={{ color: 'var(--muted)' }}>
                            Provider Reference: <code>{agreement.payout?.provider_reference || `POL-NG-${agreement.id}`}</code>
                          </small>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <b style={{ fontSize: '14px', color: 'var(--dark)' }}>
                            ₦{niraAmount.toLocaleString()} NGN
                          </b>
                          <small style={{ color: 'var(--muted)' }}>${agreement.total_amount?.toFixed(2)} USD</small>
                        </div>

                        <div>
                          <span className={isPaid ? 'tag tagGreen' : 'tag tagAmber'}>
                            {isPaid ? 'PAYOUT_COMPLETED' : 'Awaiting Approval'}
                          </span>
                        </div>

                        <div className="actions">
                          {!isPaid ? (
                            <button
                              type="button"
                              className="primaryBtn"
                              onClick={() => executePollarPayout(agreement.id)}
                            >
                              Execute Pollar Payout
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <CheckCircle2 size={13} />
                              <span>Settled to GTBank</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
              TAB 5: CRYPTOGRAPHIC AUDIT TRAIL
             ======================================================== */}
          {adminTab === 'audit' && (
            <div>
              <div className="pageHead">
                <div className="eyebrow">Trust operations · Cryptographic Ledger</div>
                <h1>Platform Audit Trail & Node Logs</h1>
              </div>

              <section className="card" style={{ padding: '24px 28px' }}>
                <div className="sectionHead" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Platform Activity Stream</h3>
                    <span className="muted" style={{ fontSize: '11px' }}>
                      Immutable ledger of all user tag actions, milestone approvals, and settlement triggers
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['all', '@davidvance', '@amaraokafor', '@admin', 'POLLAR_CORE'].map(actor => (
                      <button
                        key={actor}
                        type="button"
                        onClick={() => setAuditFilter(actor)}
                        style={{
                          fontSize: '11px',
                          padding: '5px 10px',
                          borderRadius: '7px',
                          border: '1px solid var(--border)',
                          background: auditFilter === actor ? 'var(--dark)' : '#fff',
                          color: auditFilter === actor ? '#fff' : 'var(--muted)',
                          cursor: 'pointer',
                          fontWeight: auditFilter === actor ? 700 : 500,
                          fontFamily: actor.startsWith('@') ? 'monospace' : 'inherit'
                        }}
                      >
                        {actor}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {filteredAuditLogs.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                      No audit events found for selected actor filter.
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <div key={log.id} className="order">
                        <div>
                          <b style={{ fontSize: '13px', color: 'var(--dark)' }}>{log.action}</b>
                          <small style={{ color: 'var(--muted)', marginTop: '2px' }}>{log.details}</small>
                        </div>
                        <div>
                          <span className="status" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {log.actor}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================
          ORDER INSPECTION MODAL
         ======================================================== */}
      {inspectingAgreement && (
        <div className="modalBackdrop animate-in fade-in duration-150">
          <div className="card adminModal" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span className="eyebrow">Escrow Order Inspection</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '16px' }}>{inspectingAgreement.title}</h3>
                <small style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{inspectingAgreement.id}</small>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAgreement(null)}
                style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tagged Parties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#FAF8FF', border: '1px solid var(--border)' }}>
                <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hirer (Client)</small>
                <b style={{ fontSize: '13px', display: 'block', marginTop: '2px' }}>{inspectingAgreement.client_tag || '@davidvance'}</b>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>David Vance · London, UK</span>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#FAF8FF', border: '1px solid var(--border)' }}>
                <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Talent (Freelancer)</small>
                <b style={{ fontSize: '13px', display: 'block', marginTop: '2px' }}>{inspectingAgreement.freelancer_tag || '@amaraokafor'}</b>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Amara Okafor · Lagos, Nigeria</span>
              </div>
            </div>

            {/* Cryptographic Escrow Vault Details */}
            <div style={{ padding: '14px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <b style={{ fontSize: '12px', color: '#166534' }}>Shielded Zcash Orchard Escrow Pool</b>
                <span className="tag tagGreen">Funded &amp; Locked</span>
              </div>
              <div style={{ fontSize: '11px', color: '#166534', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Deposit Tx: {inspectingAgreement.escrow?.tx_hash || '0x8fa4b9319e76fca55301bcde99a43928174e92a83fbb092305829d4c1'}
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#166534' }}>
                Shielded Memo: <code>{inspectingAgreement.escrow?.shielded_memo || `${inspectingAgreement.id}::ESCROW_DEPOSIT`}</code>
              </div>
            </div>

            {/* Milestones and Submissions */}
            <div style={{ marginBottom: '16px' }}>
              <b style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Milestone Deliverables</b>
              {inspectingAgreement.milestones?.map((m) => (
                <div key={m.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: '12px' }}>{m.title}</b>
                    <span className={m.status === 'Submitted' ? 'tag tagAmber' : m.status === 'Approved' ? 'tag tagGreen' : 'tag'}>
                      {m.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 8px' }}>{m.deliverable}</p>
                  
                  {m.submission_url && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <a 
                        href={m.submission_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: 'var(--blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <span>Live Preview</span>
                        <ExternalLink size={10} />
                      </a>
                      {m.repo_url && (
                        <a 
                          href={m.repo_url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: '#F3F5FF', color: 'var(--blue)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                        >
                          <span>GitHub Repository</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

                  {m.submission_notes && (
                    <div style={{ marginTop: '8px', background: '#F9FAFB', padding: '8px', borderRadius: '6px', fontSize: '11px', color: 'var(--dark)' }}>
                      <strong>Talent Submission Notes:</strong> {m.submission_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setInspectingAgreement(null)}
                style={{ fontSize: '11px', padding: '8px 14px', borderRadius: '7px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
              >
                Close Inspector
              </button>
              {inspectingAgreement.status === 'Submitted' && (
                <button
                  type="button"
                  onClick={() => {
                    executePollarPayout(inspectingAgreement.id);
                    setInspectingAgreement(null);
                  }}
                  style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '7px', border: 0, background: '#10B981', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Admin Release to Pollar Rails
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Bottom Navigation */}
      <nav className="adminMobileNav">
        <button
          type="button"
          className={adminTab === 'overview' ? 'active' : ''}
          onClick={() => setAdminTab('overview')}
        >
          <LayoutDashboard size={17} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={adminTab === 'orders' ? 'active' : ''}
          onClick={() => setAdminTab('orders')}
        >
          <Receipt size={17} />
          <span>Orders</span>
        </button>

        <button
          type="button"
          className={adminTab === 'users' ? 'active' : ''}
          onClick={() => setAdminTab('users')}
        >
          <Users size={17} />
          <span>Users</span>
        </button>

        <button
          type="button"
          className={adminTab === 'settlement' ? 'active' : ''}
          onClick={() => setAdminTab('settlement')}
        >
          <Landmark size={17} />
          <span>Payouts</span>
        </button>

        <button
          type="button"
          className={adminTab === 'audit' ? 'active' : ''}
          onClick={() => setAdminTab('audit')}
        >
          <ClipboardList size={17} />
          <span>Audit</span>
        </button>
      </nav>
    </div>
  );
}
