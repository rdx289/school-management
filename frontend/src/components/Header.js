// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.dateTime}>{dateStr} · {timeStr}</div>
      </div>
      <div style={styles.right}>
        <div style={styles.userChip}>
          <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name || user?.username}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '64px',
    background: 'rgba(13,15,26,0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(99,120,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  left: {},
  title: { fontSize: '1.1rem', fontWeight: '700', color: '#eef0ff', lineHeight: 1 },
  dateTime: { fontSize: '0.72rem', color: '#4a5270', marginTop: '3px' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(99,120,255,0.08)',
    border: '1px solid rgba(99,120,255,0.2)',
    borderRadius: '40px',
    padding: '6px 14px 6px 6px',
  },
  avatar: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: 'rgba(99,120,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', fontWeight: '700', color: '#6378ff',
  },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.8rem', fontWeight: '600', color: '#eef0ff', lineHeight: 1 },
  userRole: { fontSize: '0.68rem', color: '#8892b0', textTransform: 'capitalize', marginTop: '2px' },
};

export default Header;
