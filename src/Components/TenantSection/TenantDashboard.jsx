import React, { useState, useEffect } from 'react';
import {
  Home, MapPin, DollarSign, Calendar, AlertCircle, User, Phone,
  Building2, CheckCircle, Clock, FileText, Star, Menu, X,
  Shield, Zap, Hammer, Camera, TrendingUp, AlertTriangle,
  Download, Mail, ChevronDown, ChevronUp, Bed, Key, RefreshCw
} from 'lucide-react';

// ─── Token helper ─────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('usertoken') ||
  localStorage.getItem('token') ||
  localStorage.getItem('authToken') ||
  sessionStorage.getItem('token') ||
  null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

const inr = (n) =>
  n != null ? '₹' + Number(n).toLocaleString('en-IN') : '₹0';

const conditionStyle = (c) => {
  switch (c?.toLowerCase()) {
    case 'good':      return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    case 'fair':      return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    case 'poor':      return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    default:          return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  }
};

// ─── Reusable components ──────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(12px)',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 4px 24px rgba(30,58,138,0.07)',
    ...style
  }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { size: 18, color: '#fff' })}
    </div>
    <h3 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 17, color: '#0f172a' }}>{label}</h3>
  </div>
);

const InfoRow = ({ label, value, accent = '#1d4ed8' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
  </div>
);

const StatCard = ({ icon, label, value, sub, accent }) => (
  <Card style={{ padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 20, color: accent })}
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: accent, fontFamily: 'Sora,sans-serif', lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  </Card>
);

// ─── Collapsible Section ──────────────────────────────────────────────────────
const Collapsible = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 17, color: '#fff' })}
          </div>
          <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
      </button>
      {open && <div style={{ padding: '0 24px 24px' }}>{children}</div>}
    </Card>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TenancyDashboard = () => {
  const [tenancyData, setTenancyData] = useState(null);
  const [allTenancies, setAllTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTenancyIdx, setSelectedTenancyIdx] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('Authentication required. Please login first.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('https://api.gharzoreality.com/api/tenancies/tenant/my-tenancies', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setAllTenancies(data.data);
        setTenancyData(data.data[0]);
      } else {
        setError(data.message || 'No tenancy data found.');
      }
    } catch (e) {
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const switchTenancy = (idx) => {
    setSelectedTenancyIdx(idx);
    setTenancyData(allTenancies[idx]);
  };

  // ── Derived ──
  const property  = tenancyData?.propertyId;
  const financials = tenancyData?.financials;
  const agreement  = tenancyData?.agreement;
  const tenantInfo = tenancyData?.tenantInfo;
  const occupancy  = tenancyData?.occupancy;
  const landlord   = tenancyData?.landlordId;
  const notice     = tenancyData?.notice;
  const ratings    = tenancyData?.ratings;
  const roomId     = tenancyData?.roomId;

  const daysLeft = () => {
    if (!agreement?.endDate) return 0;
    return Math.max(0, Math.ceil((new Date(agreement.endDate) - new Date()) / 86400000));
  };

  const monthlyTotal = () => (financials?.monthlyRent || 0) + (financials?.maintenanceCharges || 0);

  const statusColors = {
    active:      { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    terminated:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' },
    pending:     { bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  };
  const sc = statusColors[(tenancyData?.status || '').toLowerCase()] || statusColors.pending;

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#faf5ff,#fff7ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 52, height: 52, border: '4px solid #dbeafe', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>Loading your tenancy...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eff6ff,#faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Card style={{ padding: 40, textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={28} color="#dc2626" />
        </div>
        <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 8 }}>Oops!</p>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>{error}</p>
        <button onClick={fetchData} style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </Card>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .td-root { font-family: 'DM Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .tab-btn:hover { background: rgba(255,255,255,0.25) !important; }
        @media (max-width: 768px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .checklist-grid { grid-template-columns: 1fr !important; }
          .agreement-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
        a { color: inherit; text-decoration: none; }
      `}</style>

      <div className="td-root" style={{ minHeight: '100vh', background: 'linear-gradient(150deg,#eff6ff 0%,#faf5ff 45%,#fff7ed 100%)' }}>

        {/* ── Header ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 16px rgba(30,58,138,0.07)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={18} color="#fff" />
              </div>
              <div>
                <p style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 18, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GharZo</p>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: -2 }}>Tenant Portal</p>
              </div>
            </div>

            {/* Tenancy Switcher — if multiple */}
            {allTenancies.length > 1 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {allTenancies.map((t, i) => (
                  <button key={t._id} onClick={() => switchTenancy(i)} className="tab-btn"
                    style={{ padding: '5px 14px', borderRadius: 99, border: `1.5px solid ${i === selectedTenancyIdx ? '#1d4ed8' : '#e2e8f0'}`, background: i === selectedTenancyIdx ? '#eff6ff' : 'transparent', color: i === selectedTenancyIdx ? '#1d4ed8' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                    {t.propertyId?.title || `Tenancy ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{tenancyData?.status || 'Active'}</span>
              </div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 60px' }}>

          {/* ── Notice Alert ── */}
          {notice?.isUnderNotice && (
            <div className="fade-up" style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 16, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, color: '#92400e', marginBottom: 10, fontSize: 15 }}>⚠️ Notice Issued</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {[['Given By', notice.noticeGivenBy], ['Notice Date', fmt(notice.noticeDate)], ['Vacate By', fmt(notice.vacateByDate)]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ fontSize: 11, color: '#b45309', fontWeight: 700 }}>{l}</p>
                      <p style={{ fontSize: 13, color: '#78350f', fontWeight: 700 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {notice.reason && <p style={{ fontSize: 12, color: '#92400e', marginTop: 8 }}>Reason: {notice.reason}</p>}
              </div>
            </div>
          )}

          {/* ── Stats Row ── */}
          <div className="stats-grid fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            <StatCard icon={<DollarSign />} label="Monthly Rent" value={inr(financials?.monthlyRent)} sub={`Due on ${financials?.rentDueDay || '—'}th`} accent="#16a34a" />
            <StatCard icon={<Clock />}      label="Days Left"    value={daysLeft()}                    sub={`Ends ${fmt(agreement?.endDate)}`}           accent="#7c3aed" />
            <StatCard icon={<TrendingUp />} label="Monthly Cost" value={inr(monthlyTotal())}           sub="Rent + Maintenance"                           accent="#ea580c" />
            <StatCard icon={<Shield />}     label="Deposit Paid" value={inr(financials?.securityDeposit)} sub="Security deposit"                         accent="#0369a1" />
          </div>

          {/* ── Main Grid ── */}
          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

            {/* ── Left Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Property Card */}
              <Card className="fade-up" style={{ overflow: 'hidden' }}>
                {property?.images?.[0]?.url ? (
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={property.images[0].url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.55),transparent)' }} />
                    <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
                      <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 4 }}>{property.title}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.85)' }}>
                        <MapPin size={13} />
                        <span style={{ fontSize: 12 }}>{property.location?.address}</span>
                      </div>
                    </div>
                    {/* image dots */}
                    {property.images.length > 1 && (
                      <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', gap: 5 }}>
                        {property.images.map((_, i) => (
                          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)' }} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 100, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={40} color="rgba(255,255,255,0.4)" />
                  </div>
                )}

                <div style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    {[
                      { icon: <MapPin size={13} color="#ec4899" />, val: `${property?.location?.locality || ''}, ${property?.location?.city || ''}` },
                      { icon: <Building2 size={13} color="#3b82f6" />, val: property?.location?.state },
                      { icon: <Key size={13} color="#7c3aed" />, val: `Room #${roomId?.roomNumber || '—'}` },
                      { icon: <Bed size={13} color="#f97316" />, val: `Bed: ${tenancyData?.bedNumber || '—'}` },
                    ].map(({ icon, val }, i) => val && (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 99, padding: '4px 12px' }}>
                        {icon}
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{val}</span>
                      </div>
                    ))}
                    {roomId?.roomType && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 99, padding: '4px 12px' }}>
                        <Building2 size={13} color="#1d4ed8" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>{roomId.roomType}</span>
                      </div>
                    )}
                  </div>

                  {/* Tenancy ID + Number */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {tenancyData?.tenancyNumber && (
                      <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '6px 14px' }}>
                        <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>Tenancy #: </span>
                        <span style={{ fontSize: 11, color: '#6d28d9', fontFamily: 'monospace' }}>{tenancyData.tenancyNumber}</span>
                      </div>
                    )}
                    {tenancyData?.createdAt && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 14px' }}>
                        <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>Since: </span>
                        <span style={{ fontSize: 11, color: '#166534' }}>{fmt(tenancyData.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Financial Summary */}
              <Collapsible title="Financial Summary" icon={<DollarSign />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: <DollarSign size={16} color="#16a34a" />, label: 'Monthly Rent', sub: `Due on ${financials?.rentDueDay || '—'}th`, val: inr(financials?.monthlyRent), color: '#16a34a' },
                    { icon: <Hammer size={16} color="#7c3aed" />,     label: 'Maintenance',  sub: 'Monthly',                                    val: inr(financials?.maintenanceCharges), color: '#7c3aed' },
                    { icon: <Shield size={16} color="#0369a1" />,     label: 'Security Deposit', sub: 'One time',                              val: inr(financials?.securityDeposit), color: '#0369a1' },
                    { icon: <AlertCircle size={16} color="#dc2626" />,label: 'Late Fee',     sub: `Grace: ${financials?.gracePeriodDays || 0} days`, val: `${inr(financials?.lateFeePerDay)}/day`, color: '#dc2626' },
                  ].map(({ icon, label, sub, val, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{label}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</p>
                        </div>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 18, color, fontFamily: 'Sora,sans-serif' }}>{val}</p>
                    </div>
                  ))}

                  <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>Total Monthly</p>
                    <p style={{ fontWeight: 900, fontSize: 24, background: 'linear-gradient(135deg,#16a34a,#059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Sora,sans-serif' }}>{inr(monthlyTotal())}</p>
                  </div>
                </div>
              </Collapsible>

              {/* Agreement Details */}
              <Collapsible title="Agreement Details" icon={<FileText />}>
                <div className="agreement-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '18px 16px' }}>
                    <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Duration</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: '#1d4ed8', fontFamily: 'Sora,sans-serif' }}>{agreement?.durationMonths || '—'} <span style={{ fontSize: 14 }}>months</span></p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{fmt(agreement?.startDate)} → {fmt(agreement?.endDate)}</p>
                  </div>
                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '18px 16px' }}>
                    <p style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Renewal</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed', fontFamily: 'Sora,sans-serif' }}>{agreement?.renewalOption ? '✓ Yes' : '✗ No'}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Auto Renew: {agreement?.autoRenew ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 0 }}>
                  <InfoRow label="Signed by Landlord" value={agreement?.signedByLandlord ? '✓ Yes' : '✗ Pending'} />
                  <InfoRow label="Signed by Tenant"   value={agreement?.signedByTenant   ? '✓ Yes' : '✗ Pending'} />
                  <InfoRow label="Notice Period"       value={`${tenancyData?.noticePeriodDays || 0} days`} />
                  {agreement?.specialConditions?.length > 0 && (
                    <div style={{ paddingTop: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Special Conditions</p>
                      {agreement.specialConditions.map((c, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', marginBottom: 4 }}>• {c}</p>
                      ))}
                    </div>
                  )}
                </div>
              </Collapsible>

              {/* Move-in / Move-out Checklist */}
              {(occupancy?.moveInChecklist?.length > 0 || occupancy?.moveOutChecklist?.length > 0) && (
                <Collapsible title="Property Condition Report" icon={<Camera />} defaultOpen={false}>
                  {/* Move In */}
                  {occupancy?.moveInChecklist?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                        <p style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Move-In · {fmt(occupancy.moveInDate)}</p>
                        <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 99, padding: '2px 12px', fontSize: 11, fontWeight: 700 }}>Move In</span>
                      </div>
                      <div className="checklist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {occupancy.moveInChecklist.map((item, i) => {
                          const cs = conditionStyle(item.condition);
                          return (
                            <div key={i} style={{ background: '#fafafa', border: `1px solid ${cs.border}`, borderRadius: 12, padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{item.item}</p>
                                <span style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{item.condition}</span>
                              </div>
                              {item.notes && <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>"{item.notes}"</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Move Out */}
                  {occupancy?.moveOutChecklist?.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                        <p style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Move-Out · {fmt(occupancy.moveOutDate)}</p>
                        <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 99, padding: '2px 12px', fontSize: 11, fontWeight: 700 }}>Move Out</span>
                      </div>
                      <div className="checklist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {occupancy.moveOutChecklist.map((item, i) => {
                          const cs = conditionStyle(item.condition);
                          return (
                            <div key={i} style={{ background: '#fafafa', border: `1px solid ${cs.border}`, borderRadius: 12, padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{item.item}</p>
                                <span style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{item.condition}</span>
                              </div>
                              {item.notes && <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>"{item.notes}"</p>}
                              {item.condition?.toLowerCase() === 'poor' && (
                                <div style={{ marginTop: 8, background: '#fef2f2', borderRadius: 8, padding: '6px 10px', display: 'flex', gap: 6 }}>
                                  <AlertCircle size={13} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                                  <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Requires attention before vacating</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Collapsible>
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Landlord Card */}
              <Card style={{ padding: '22px 22px' }}>
                <SectionTitle icon={<User />} label="Landlord" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 11, color: '#b45309', fontWeight: 700, marginBottom: 2 }}>Name</p>
                    <p style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{landlord?.name || '—'}</p>
                  </div>

                  {landlord?.phone && (
                    <a href={`tel:${landlord.phone}`} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'opacity 0.2s' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={15} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>Call Landlord</p>
                        <p style={{ fontWeight: 800, color: '#1d4ed8', fontSize: 14 }}>{landlord.phone}</p>
                      </div>
                    </a>
                  )}

                  {landlord?.email && (
                    <a href={`mailto:${landlord.email}`} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={15} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>Email Landlord</p>
                        <p style={{ fontWeight: 700, color: '#15803d', fontSize: 13, wordBreak: 'break-all' }}>{landlord.email}</p>
                      </div>
                    </a>
                  )}
                </div>
              </Card>

              {/* Tenant Info */}
              <Card style={{ padding: '22px 22px' }}>
                <SectionTitle icon={<User />} label="Tenant Info" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {tenantInfo?.emergencyContact?.name && (
                    <>
                      <InfoRow label="Emergency Contact" value={tenantInfo.emergencyContact.name} />
                      <InfoRow label="Relation"          value={tenantInfo.emergencyContact.relation} />
                      {tenantInfo.emergencyContact.phone && (
                        <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Emergency Phone</span>
                          <a href={`tel:${tenantInfo.emergencyContact.phone}`} style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginTop: 2 }}>
                            📞 {tenantInfo.emergencyContact.phone}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {tenantInfo?.idProof?.type && (
                    <InfoRow label="ID Proof" value={tenantInfo.idProof.type} />
                  )}
                  {tenantInfo?.employmentDetails?.designation && (
                    <InfoRow label="Designation" value={tenantInfo.employmentDetails.designation} />
                  )}
                  {tenantInfo?.employmentDetails?.companyName && (
                    <InfoRow label="Company" value={tenantInfo.employmentDetails.companyName} />
                  )}
                  {tenantInfo?.policeVerification?.isVerified && (
                    <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>Police Verification</p>
                        <p style={{ fontWeight: 800, color: '#15803d', fontSize: 13 }}>✓ Verified</p>
                        {tenantInfo.policeVerification.verifiedOn && (
                          <p style={{ fontSize: 11, color: '#4ade80', marginTop: 2 }}>{fmt(tenantInfo.policeVerification.verifiedOn)}</p>
                        )}
                      </div>
                      <Shield size={22} color="#16a34a" />
                    </div>
                  )}
                </div>
              </Card>

              {/* Ratings */}
              {ratings?.byTenant?.rating > 0 && (
                <Card style={{ padding: '22px 22px' }}>
                  <SectionTitle icon={<Star />} label="Your Rating" />
                  <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fde68a', borderRadius: 14, padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} color={i < ratings.byTenant.rating ? '#f59e0b' : '#d1d5db'} fill={i < ratings.byTenant.rating ? '#f59e0b' : 'none'} />
                      ))}
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#b45309', marginLeft: 6 }}>{ratings.byTenant.rating}/5</span>
                    </div>
                    {ratings.byTenant.review && (
                      <p style={{ fontSize: 13, color: '#78350f', fontStyle: 'italic', lineHeight: 1.6 }}>"{ratings.byTenant.review}"</p>
                    )}
                    {ratings.byTenant.givenAt && (
                      <p style={{ fontSize: 11, color: '#a16207', marginTop: 8 }}>Rated on {fmt(ratings.byTenant.givenAt)}</p>
                    )}
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card style={{ padding: '22px 22px' }}>
                <SectionTitle icon={<Zap />} label="Quick Actions" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* <button className="action-btn" style={{ width: '100%', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(30,58,138,0.25)' }}>
                    <Download size={15} /> Download Agreement
                  </button> */}
                  {landlord?.phone && (
                    <a href={`tel:${landlord.phone}`} className="action-btn" style={{ width: '100%', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', cursor: 'pointer' }}>
                      <Phone size={15} color="#1d4ed8" /> Call Landlord
                    </a>
                  )}
                  {landlord?.email && (
                    <a href={`mailto:${landlord.email}`} className="action-btn" style={{ width: '100%', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', cursor: 'pointer' }}>
                      <Mail size={15} color="#16a34a" /> Email Landlord
                    </a>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Powered by <span style={{ fontWeight: 800, color: '#1d4ed8' }}>GharZo</span> · Tenant Portal</p>
          </div>
        </main>
      </div>
    </>
  );
};

export default TenancyDashboard;