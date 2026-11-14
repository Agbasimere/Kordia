import React, { useState } from 'react';
import { 
  X, Check, Bell, MessageSquare, Smartphone, Send, CheckCircle2, 
  Clock, ArrowUpRight, ShieldCheck, ChevronRight, AlertCircle, Settings
} from 'lucide-react';
import { useAgreement } from '../context/AgreementContext';

export default function NotificationModal({ isOpen, onClose }) {
  const { 
    notifications, 
    respondToInvite, 
    approveMilestoneFromAlert, 
    markAllNotificationsAsRead, 
    linkedSocial, 
    updateLinkedSocial, 
    sendSocialTestAlert,
    unreadNotificationsCount 
  } = useAgreement();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState(linkedSocial.whatsapp || '+234 803 123 4567');
  const [telegramInput, setTelegramInput] = useState(linkedSocial.telegram || '@amara_dev');
  const [whatsappEnabled, setWhatsappEnabled] = useState(linkedSocial.whatsapp_enabled ?? true);
  const [telegramEnabled, setTelegramEnabled] = useState(linkedSocial.telegram_enabled ?? true);

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleSaveChannels = (e) => {
    e.preventDefault();
    updateLinkedSocial({
      whatsapp: whatsappInput,
      whatsapp_enabled: whatsappEnabled,
      telegram: telegramInput,
      telegram_enabled: telegramEnabled
    });
    setShowChannelSettings(false);
  };

  return (
    <div className="alertsPopover animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header matching Image 2 */}
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A', fontFamily: 'Manrope, sans-serif' }}>
            Alerts
          </h3>
          {unreadNotificationsCount > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '999px'
            }}>
              {unreadNotificationsCount}
            </span>
          )}
        </div>

        {/* Filter Tabs matching Image 2 ("All" | "Unread") + Channel Settings Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => { setFilter('all'); setShowChannelSettings(false); }}
              style={{
                border: 0,
                background: filter === 'all' && !showChannelSettings ? '#FFFFFF' : 'transparent',
                color: filter === 'all' && !showChannelSettings ? '#0F172A' : '#64748B',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: filter === 'all' && !showChannelSettings ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => { setFilter('unread'); setShowChannelSettings(false); }}
              style={{
                border: 0,
                background: filter === 'unread' && !showChannelSettings ? '#FFFFFF' : 'transparent',
                color: filter === 'unread' && !showChannelSettings ? '#0F172A' : '#64748B',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: filter === 'unread' && !showChannelSettings ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Unread
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowChannelSettings(!showChannelSettings)}
            title="Linked Channels (WhatsApp / Telegram)"
            style={{
              border: '1px solid #E2E8F0',
              background: showChannelSettings ? '#F1F5F9' : '#FFFFFF',
              color: showChannelSettings ? '#0F172A' : '#64748B',
              padding: '5px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Settings size={15} />
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Linked Notification Channels Banner */}
      <div style={{
        background: '#F8FAFC',
        borderBottom: '1px solid #EEF2F6',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Linked Alerts:</span>
          {linkedSocial.whatsapp_enabled && (
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Smartphone size={10} />
              <span>WhatsApp</span>
            </span>
          )}
          {linkedSocial.telegram_enabled && (
            <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Send size={10} />
              <span>Telegram</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowChannelSettings(!showChannelSettings)}
          style={{
            border: 0,
            background: 'transparent',
            color: '#0F172A',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline'
          }}
        >
          {showChannelSettings ? 'Close Setup' : 'Manage Channels'}
        </button>
      </div>

      {/* Scrollable Container For Both Channel Settings & Alerts */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', minHeight: '120px' }}>
        
        {/* Linked Channels Setup Form (Scrollable) */}
        {showChannelSettings && (
          <form onSubmit={handleSaveChannels} style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <b style={{ fontSize: '12px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Direct Social Media Notifications
            </b>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>
              Link your WhatsApp number and Telegram handle to receive instant invites and milestone completions directly on your phone so you never miss a step.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Smartphone size={12} color="#10B981" />
                    <span>WhatsApp Number</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={whatsappEnabled} 
                    onChange={(e) => setWhatsappEnabled(e.target.checked)} 
                  />
                </label>
                <input
                  type="text"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="+234 803 123 4567"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Send size={12} color="#0F172A" />
                    <span>Telegram Username</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={telegramEnabled} 
                    onChange={(e) => setTelegramEnabled(e.target.checked)} 
                  />
                </label>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  placeholder="@username"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                Save Channels
              </button>
              <button
                type="button"
                onClick={() => sendSocialTestAlert('whatsapp')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Test Ping
              </button>
            </div>
          </form>
        )}

        {/* Notifications List (Matching Image 2) */}
        <div>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No unread alerts at this time.
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div 
                key={item.id} 
                className={`alertItem ${item.requires_action && item.status === 'pending' ? 'actionable' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <b style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!item.read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />}
                    <span>{item.title}</span>
                  </b>
                  <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {item.time}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                  {item.subtitle}
                </p>

                {/* Action Buttons right inside notification card (Matching Image 2: [Decline] [Accept]) */}
                {item.requires_action && item.status === 'pending' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => respondToInvite(item.id, false)}
                      className="alertBtnSecondary"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.action_type === 'milestone_approval') {
                          approveMilestoneFromAlert(item.id, item.agreement_id);
                        } else {
                          respondToInvite(item.id, true);
                        }
                      }}
                      className="alertBtnPrimary"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      {/* Footer matching Image 2 */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF'
      }}>
        <button
          type="button"
          onClick={markAllNotificationsAsRead}
          style={{
            border: 0,
            background: 'transparent',
            color: '#0F172A',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0
          }}
        >
          Mark all as read
        </button>

        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
          Real-time webhook active
        </span>
      </div>

    </div>
  );
}
