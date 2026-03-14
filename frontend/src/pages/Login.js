// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@school.edu', password: 'password', color: '#6378ff' },
  { role: 'Teacher', email: 'john@school.edu', password: 'password', color: '#00d4aa' },
  { role: 'Student', email: 'alice@student.edu', password: 'password', color: '#ff6b9d' },
];

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.username}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const fillDemo = (acc) => setForm({ email: acc.email, password: acc.password });

  return (
    <div style={styles.wrapper}>
      {/* Background effects */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgGrid} />

      <div style={styles.container}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.brandLogo}>
            <span style={styles.brandIcon}>E</span>
            <span style={styles.brandName}>EduSync</span>
          </div>
          <h1 style={styles.headline}>
            School Management<br />
            <span style={styles.headlineAccent}>Reimagined.</span>
          </h1>
          <p style={styles.tagline}>
            A complete platform for administrators, teachers, and students. Manage everything from one unified dashboard.
          </p>

          <div style={styles.featureList}>
            {['Student & Teacher Management', 'Attendance Tracking', 'Exam & Results', 'Fee Collection & Reports'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div style={styles.statsRow}>
            {[['1200+', 'Students'], ['80+', 'Teachers'], ['50+', 'Classes']].map(([v, l]) => (
              <div key={l} style={styles.statItem}>
                <div style={styles.statVal}>{v}</div>
                <div style={styles.statLab}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - login form */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Sign In</h2>
              <p style={styles.cardSub}>Access your school portal</p>
            </div>

            {/* Demo accounts */}
            <div style={styles.demoSection}>
              <div style={styles.demoLabel}>Quick Demo Access</div>
              <div style={styles.demoGrid}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button key={acc.role} onClick={() => fillDemo(acc)} style={{ ...styles.demoBtn, borderColor: acc.color, color: acc.color }}>
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.divider}><span>or enter credentials</span></div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@school.edu"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={styles.eyeBtn}
                  >{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '8px', padding: '12px', fontSize: '0.95rem' }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <p style={styles.hint}>Default password for demo: <code style={styles.code}>password</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0f1a',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgOrb1: {
    position: 'absolute', top: '-20%', left: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,120,255,0.12), transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-20%', right: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,170,0.1), transparent 70%)',
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(99,120,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,120,255,0.04) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    maxWidth: '960px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
  },
  leftPanel: {},
  brandLogo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
  brandIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6378ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', fontWeight: '900', color: 'white',
  },
  brandName: { fontSize: '1.4rem', fontWeight: '800', color: '#eef0ff' },
  headline: { fontSize: '2.6rem', fontWeight: '800', lineHeight: '1.2', color: '#eef0ff', marginBottom: '16px' },
  headlineAccent: { background: 'linear-gradient(90deg, #6378ff, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  tagline: { fontSize: '0.95rem', color: '#8892b0', lineHeight: '1.7', marginBottom: '28px' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#8892b0' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#6378ff', flexShrink: 0 },
  statsRow: { display: 'flex', gap: '32px' },
  statItem: {},
  statVal: { fontSize: '1.6rem', fontWeight: '800', color: '#6378ff' },
  statLab: { fontSize: '0.75rem', color: '#4a5270', marginTop: '2px' },
  rightPanel: {},
  card: {
    background: '#13162a',
    border: '1px solid rgba(99,120,255,0.2)',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  cardHeader: { marginBottom: '24px' },
  cardTitle: { fontSize: '1.6rem', fontWeight: '800', color: '#eef0ff' },
  cardSub: { color: '#8892b0', fontSize: '0.875rem', marginTop: '4px' },
  demoSection: { marginBottom: '20px' },
  demoLabel: { fontSize: '0.72rem', color: '#4a5270', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  demoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  demoBtn: {
    padding: '8px',
    background: 'transparent',
    border: '1px solid',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px',
    color: '#4a5270', fontSize: '0.75rem',
    margin: '20px 0',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  eyeBtn: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px',
  },
  hint: { marginTop: '16px', fontSize: '0.75rem', color: '#4a5270', textAlign: 'center' },
  code: { background: 'rgba(99,120,255,0.15)', color: '#6378ff', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' },
};

export default Login;
