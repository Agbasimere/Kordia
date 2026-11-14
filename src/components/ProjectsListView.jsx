import React, { useState } from 'react';
import { 
  FolderPlus, Plus, Search, Filter, ArrowRight, CheckCircle2, 
  Clock, ShieldCheck, ExternalLink, Calendar, Users, Landmark
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';

export default function ProjectsListView({ onOpenDetails }) {
  const { 
    agreements, 
    currentRole, 
    getCurrentUser, 
    setActiveModal, 
    setSelectedAgreementId,
    setActiveView,
    formatCurrency
  } = useAgreement();

  const user = getCurrentUser();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [search, setSearch] = useState('');

  const userProjects = agreements.filter(a => {
    if (currentRole === 'client') {
      return a.client_tag?.toLowerCase() === user.user_tag?.toLowerCase() || a.creator_tag?.toLowerCase() === user.user_tag?.toLowerCase();
    }
    return a.freelancer_tag?.toLowerCase() === user.user_tag?.toLowerCase();
  }).filter(a => {
    if (filter === 'active') return a.status !== 'Released' && a.status !== 'Refunded';
    if (filter === 'completed') return a.status === 'Released';
    return true;
  }).filter(a => {
    if (!search) return true;
    return a.title?.toLowerCase().includes(search.toLowerCase()) || 
           a.id?.toLowerCase().includes(search.toLowerCase()) ||
           a.client_tag?.toLowerCase().includes(search.toLowerCase()) ||
           a.freelancer_tag?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: '1280px', margin: '0 auto' }} className="animate-in fade-in duration-150">
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Escrow Agreements
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            {currentRole === 'client' ? 'Client Projects & Hires' : 'Talent Work & Contracts'}
          </h1>
        </div>

        {currentRole === 'client' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveModal('create_project')}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
              }}
              className="hover:bg-slate-800"
            >
              <Plus size={16} />
              <span>Create New Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--kordia-border)', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '7px 12px', width: 'min(300px, 100%)' }}>
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or tag..."
            style={{ border: 0, outline: 0, background: 'transparent', fontSize: '12px', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'active', 'completed'].map((f) => (
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
                padding: '5px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {userProjects.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--kordia-border)', padding: '50px 20px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#F1F5F9', color: '#64748B', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <FolderPlus size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>No Projects Found</h3>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
            {currentRole === 'client' 
              ? 'Start your first agreement to collaborate with protected escrow.' 
              : 'Incoming agreements created and shared by hirers will appear here.'}
          </p>
          {currentRole === 'client' && (
            <button
              type="button"
              onClick={() => setActiveModal('create_project')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: '#0F172A', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, border: 0, cursor: 'pointer' }}
            >
              Create Agreement
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {userProjects.map((proj, idx) => {
            const partnerTag = proj.client_tag === user.user_tag ? proj.freelancer_tag : proj.client_tag;
            const isFinished = proj.status === 'Released';

            return (
              <div 
                key={proj.id} 
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--kordia-border)',
                  borderRadius: '18px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
                className="hover:border-slate-400 hover:shadow-md"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8' }}>{proj.id}</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isFinished ? '#ECFDF5' : '#F1F5F9',
                      color: isFinished ? '#059669' : '#0F172A'
                    }}>
                      {isFinished ? 'Completed' : proj.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {proj.title}
                  </h3>

                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {proj.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '14px' }}>
                    <Users size={14} color="#0F172A" />
                    <span style={{ fontSize: '11px', color: '#475569' }}>
                      Counterparty: <b style={{ color: '#0F172A' }}>{partnerTag}</b>
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <b style={{ fontSize: '15px', color: '#0F172A' }}>${proj.total_amount?.toFixed(2)} USD</b>
                    <small style={{ color: '#059669', display: 'block', fontSize: '10px' }}>
                      {formatCurrency(proj.total_amount, 'USDC')} via Pollar
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgreementId(proj.id);
                      onOpenDetails(proj.id);
                    }}
                    style={{
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    className="hover:border-slate-800 hover:text-black"
                  >
                    <span>View Agreement</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
