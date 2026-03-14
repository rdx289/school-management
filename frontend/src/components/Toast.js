// src/components/Toast.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const COLORS = {
    success: { border: '#00d4aa', icon: '#00d4aa', bg: 'rgba(0,212,170,0.1)' },
    error:   { border: '#ff4d6d', icon: '#ff4d6d', bg: 'rgba(255,77,109,0.1)' },
    warning: { border: '#ffb347', icon: '#ffb347', bg: 'rgba(255,179,71,0.1)' },
    info:    { border: '#6378ff', icon: '#6378ff', bg: 'rgba(99,120,255,0.1)' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id} style={{
              background: '#13162a',
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.border}`,
              borderRadius: '10px',
              padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: '10px',
              minWidth: '280px', maxWidth: '380px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.25s ease',
              fontSize: '0.875rem', fontWeight: '500',
              color: '#eef0ff',
            }}>
              <span style={{ color: c.icon, fontWeight: '700', fontSize: '14px' }}>{ICONS[t.type]}</span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
