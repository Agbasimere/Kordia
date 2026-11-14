import React, { useState } from 'react';
import { 
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Landmark, 
  Wallet, ShieldCheck, CheckCircle2, Search, Filter, Plus, ArrowUp
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';
import { EXCHANGE_RATES } from '../data/mockData';

export default function TransactionsListView() {
  const { 
    activityLogs, 
    getCurrentUser, 
    currentRole,
    currentBalance, 
    formatCurrency, 
    setActiveModal 
  } = useAgreement();

  const user = getCurrentUser();
  const [filter, setFilter] = useState('all');

  const transactions = activityLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'funding') return log.type === 'funding';
    if (filter === 'payout') return log.type === 'payout';
    if (filter === 'transfer') return log.type === 'transfer';
    return true;
  });

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1280px', margin: '0 auto' }} className="animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Settlement Ledger
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            Transactions &amp; Off-Ramp History
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {currentRole === 'client' && (
            <button
              type="button"
              onClick={() => setActiveModal('fund')}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                border: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="hover:bg-slate-800"
            >
              <Plus size={14} />
              <span>Deposit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveModal('withdraw')}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowUp size={14} />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--kordia-border)', borderRadius: '16px', padding: '18px 20px' }}>
          <small style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Current Balance</small>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            {formatCurrency(currentBalance)}
          </strong>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--kordia-border)', borderRadius: '16px', padding: '18px 20px' }}>
          <small style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Settlement Currency</small>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: '#059669', fontFamily: 'Manrope, sans-serif' }}>
            USDC on Stellar
          </strong>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--kordia-border)', borderRadius: '16px', padding: '18px 20px' }}>
          <small style={{ color: '#64748B', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Pollar Settlement Rail</small>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            100% Active
          </strong>
        </div>
      </div>

      {/* Transaction Feed */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--kordia-border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <b style={{ fontSize: '15px', color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            Activity &amp; Settlement Trail
          </b>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'funding', 'payout', 'transfer'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  border: '1px solid #E2E8F0',
                  background: filter === f ? '#0F172A' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#64748B',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {transactions.map(item => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #F1F5F9',
                background: '#F8FAFC'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: item.type === 'funding' ? '#ECFDF5' : '#F1F5F9',
                  color: item.type === 'funding' ? '#059669' : '#0F172A',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  {item.type === 'funding' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div>
                  <b style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>{item.action}</b>
                  <small style={{ fontSize: '11px', color: '#64748B' }}>{item.details}</small>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0F172A', fontWeight: 700, display: 'block' }}>
                  {item.actor}
                </span>
                <small style={{ fontSize: '10px', color: '#94A3B8' }}>
                  {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
