// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = {
  admin: [
    { path: '/dashboard',  icon: '⊞', label: 'Dashboard' },
    { path: '/students',   icon: '🎓', label: 'Students' },
    { path: '/teachers',   icon: '👩‍🏫', label: 'Teachers' },
    { path: '/classes',    icon: '🏫', label: 'Classes' },
    { path: '/attendance', icon: '✓',  label: 'Attendance' },
    { path: '/exams',      icon: '📝', label: 'Exams & Results' },
    { path: '/fees',       icon: '💳', label: 'Fees' },
    { path: '/notices',    icon: '📢', label: 'Notice Board' },
    { path: '/reports',    icon: '📊', label: 'Reports' },
  ],
  teacher: [
    { path: '/dashboard',  icon: '⊞', label: 'Dashboard' },
    { path: '/students',   icon: '🎓', label: 'Students' },
    { path: '/attendance', icon: '✓',  label: 'Attendance' },
    { path: '/exams',      icon: '📝', label: 'Exams & Results' },
    { path: '/notices',    icon: '📢', label: 'Notice Board' },
  ],
  student: [
    { path: '/dashboard',  icon: '⊞', label: 'Dashboard' },
    { path: '/attendance', icon: '✓',  label: 'My Attendance' },
    { path: '/exams',      icon: '📝', label: 'My Results' },
    { path: '/fees',       icon: '💳', label: 'My Fees' },
    { path: '/notices',    icon: '📢', label: 'Notice Board' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>E</div>
        <div>
          <div style={styles.logoText}>EduSync</div>
          <div style={styles.logoSub}>School Management</div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={styles.roleSection}>
        <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || user?.username}</div>
          <span style={{ ...styles.roleBadge, background: ROLE_COLORS[user?.role] }}>
            {user?.role}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>NAVIGATION</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        <span>⎋</span>
        <span>Sign Out</span>
      </button>
    </aside>
  );
};

const ROLE_COLORS = {
  admin:   'rgba(99,120,255,0.25)',
  teacher: 'rgba(0,212,170,0.25)',
  student: 'rgba(255,107,157,0.25)',
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: 0, top: 0,
    background: '#0d0f1a',
    borderRight: '1px solid rgba(99,120,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 16px',
    zIndex: 100,
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 20px 16px',
    borderBottom: '1px solid rgba(99,120,255,0.1)',
  },
  logoIcon: {
    width: '40px', height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6378ff, #00d4aa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '900', color: 'white',
    flexShrink: 0,
  },
  logoText: { fontSize: '1.1rem', fontWeight: '800', color: '#eef0ff' },
  logoSub: { fontSize: '0.7rem', color: '#4a5270', fontWeight: '500' },
  roleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
  },
  avatar: {
    width: '38px', height: '38px',
    borderRadius: '50%',
    background: 'rgba(99,120,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: '700', color: '#6378ff',
    border: '2px solid rgba(99,120,255,0.3)',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '0.875rem', fontWeight: '600', color: '#eef0ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '0.68rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#eef0ff',
    marginTop: '3px',
  },
  divider: { height: '1px', background: 'rgba(99,120,255,0.1)', margin: '0 16px 8px' },
  nav: { flex: 1, padding: '4px 12px' },
  navLabel: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#4a5270',
    letterSpacing: '0.12em',
    padding: '8px 8px 4px',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#8892b0',
    textDecoration: 'none',
    marginBottom: '2px',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    background: 'rgba(99,120,255,0.15)',
    color: '#6378ff',
    fontWeight: '600',
    borderLeft: '3px solid #6378ff',
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: '#8892b0',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    margin: '8px 0 0',
    transition: 'color 0.15s',
  },
};

export default Sidebar;
