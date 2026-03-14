// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6378ff', '#00d4aa', '#ff6b9d', '#ffb347'];

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card" style={{ '--accent-color': color, '--icon-bg': `${color}22` }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-change positive">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
      <div style={{ color: '#8892b0', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: '600' }}>₹{p.value?.toLocaleString()}</div>)}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const res = await dashboardAPI.getStats();
          setStats(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const attendancePie = stats ? [
    { name: 'Present', value: stats.attendance_today?.present || 0 },
    { name: 'Absent', value: stats.attendance_today?.absent || 0 },
  ] : [];

  return (
    <>
      <Header title="Dashboard" />
      <div className="page-content fade-in">
        {/* Welcome banner */}
        <div style={styles.welcomeBanner}>
          <div>
            <div style={styles.welcomeText}>Good {getGreeting()}, {user?.name || user?.username}! 👋</div>
            <div style={styles.welcomeSub}>Here's what's happening at your school today.</div>
          </div>
          <div style={styles.welcomeDate}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '28px' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '18px' }} />)}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-4" style={{ marginBottom: '28px' }}>
              <StatCard icon="🎓" label="Total Students" value={stats?.students?.total?.toLocaleString()} sub={`${stats?.students?.male || 0} boys · ${stats?.students?.female || 0} girls`} color="#6378ff" />
              <StatCard icon="👩‍🏫" label="Total Teachers" value={stats?.teachers?.total} color="#00d4aa" />
              <StatCard icon="💰" label="Fee Collected" value={stats?.fees?.collected ? `₹${(stats.fees.collected/1000).toFixed(1)}K` : '₹0'} sub={`₹${((stats?.fees?.pending || 0)/1000).toFixed(1)}K pending`} color="#ffb347" />
              <StatCard icon="✓" label="Today's Attendance" value={stats?.attendance_today?.present || 0} sub={`${stats?.attendance_today?.absent || 0} absent today`} color="#ff6b9d" />
            </div>

            {/* Charts row */}
            <div className="grid grid-2" style={{ marginBottom: '28px', gridTemplateColumns: '2fr 1fr' }}>
              {/* Monthly fee chart */}
              <div className="card">
                <h3 style={styles.chartTitle}>Monthly Fee Collection</h3>
                <div style={styles.chartSub}>Current academic year revenue</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats?.monthly_fees || []}>
                    <defs>
                      <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6378ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6378ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,255,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickFormatter={v => `₹${v/1000}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="amount" stroke="#6378ff" strokeWidth={2} fill="url(#feeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance pie */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={styles.chartTitle}>Today's Attendance</h3>
                <div style={styles.chartSub}>{stats?.attendance_today?.total_marked || 0} students marked</div>
                <PieChart width={160} height={160} style={{ marginTop: '10px' }}>
                  <Pie data={attendancePie} cx={80} cy={80} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {attendancePie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  {attendancePie.map((entry, i) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#8892b0' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                      {entry.name}: <strong style={{ color: '#eef0ff' }}>{entry.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Class-wise students bar chart */}
            <div className="grid grid-2" style={{ marginBottom: '28px' }}>
              <div className="card">
                <h3 style={styles.chartTitle}>Students per Class</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(stats?.class_wise_students || []).map(c => ({ name: `${c.name} ${c.section}`, count: c.student_count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Bar dataKey="count" fill="#6378ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Upcoming exams */}
              <div className="card">
                <h3 style={styles.chartTitle}>Upcoming Exams</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {(stats?.upcoming_exams || []).length === 0 && (
                    <div style={{ color: '#4a5270', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>No upcoming exams</div>
                  )}
                  {(stats?.upcoming_exams || []).map(exam => (
                    <div key={exam.id} style={styles.examItem}>
                      <div style={styles.examDate}>
                        <div style={styles.examDay}>{new Date(exam.exam_date).getDate()}</div>
                        <div style={styles.examMon}>{new Date(exam.exam_date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div style={styles.examInfo}>
                        <div style={styles.examName}>{exam.name}</div>
                        <div style={styles.examMeta}>{exam.class_name} {exam.section} · {exam.subject_name}</div>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{exam.exam_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent notices */}
            <div className="card">
              <h3 style={{ ...styles.chartTitle, marginBottom: '16px' }}>Recent Notices</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(stats?.recent_notices || []).map(n => (
                  <div key={n.id} style={styles.noticeItem}>
                    <span style={{ ...styles.noticePriority, background: PRIORITY_COLORS[n.priority] }} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.noticeTitle}>{n.title}</div>
                      <div style={styles.noticeContent}>{n.content.substring(0, 100)}{n.content.length > 100 ? '...' : ''}</div>
                    </div>
                    <div style={styles.noticeDate}>{new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const PRIORITY_COLORS = { low: '#4a5270', normal: '#6378ff', high: '#ffb347', urgent: '#ff4d6d' };

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const styles = {
  welcomeBanner: {
    background: 'linear-gradient(135deg, rgba(99,120,255,0.15), rgba(0,212,170,0.08))',
    border: '1px solid rgba(99,120,255,0.2)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeText: { fontSize: '1.2rem', fontWeight: '700', color: '#eef0ff' },
  welcomeSub: { fontSize: '0.875rem', color: '#8892b0', marginTop: '4px' },
  welcomeDate: { fontSize: '0.8rem', color: '#4a5270' },
  chartTitle: { fontSize: '1rem', fontWeight: '700', color: '#eef0ff' },
  chartSub: { fontSize: '0.75rem', color: '#8892b0', marginTop: '2px', marginBottom: '8px' },
  examItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px', borderRadius: '10px',
    background: 'rgba(99,120,255,0.05)',
    border: '1px solid rgba(99,120,255,0.1)',
  },
  examDate: {
    width: '40px', textAlign: 'center',
    background: 'rgba(99,120,255,0.15)', borderRadius: '8px', padding: '4px',
    flexShrink: 0,
  },
  examDay: { fontSize: '1rem', fontWeight: '800', color: '#6378ff', lineHeight: 1 },
  examMon: { fontSize: '0.65rem', color: '#8892b0', marginTop: '2px' },
  examInfo: { flex: 1 },
  examName: { fontSize: '0.875rem', fontWeight: '600', color: '#eef0ff' },
  examMeta: { fontSize: '0.72rem', color: '#8892b0', marginTop: '2px' },
  noticeItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '12px', borderRadius: '10px',
    background: 'rgba(99,120,255,0.04)',
    border: '1px solid rgba(99,120,255,0.08)',
  },
  noticePriority: { width: '4px', minHeight: '40px', borderRadius: '2px', flexShrink: 0, marginTop: '2px' },
  noticeTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#eef0ff' },
  noticeContent: { fontSize: '0.78rem', color: '#8892b0', marginTop: '3px', lineHeight: '1.5' },
  noticeDate: { fontSize: '0.72rem', color: '#4a5270', whiteSpace: 'nowrap' },
};

export default Dashboard;
