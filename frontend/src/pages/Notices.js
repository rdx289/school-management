// src/pages/Notices.js
import React, { useState, useEffect } from 'react';
import { noticesAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const PRIORITY_STYLES = {
  low:    { badge: 'badge-muted',   bar: '#4a5270', label: 'Low' },
  normal: { badge: 'badge-info',    bar: '#6378ff', label: 'Normal' },
  high:   { badge: 'badge-warning', bar: '#ffb347', label: 'High' },
  urgent: { badge: 'badge-danger',  bar: '#ff4d6d', label: 'Urgent' },
};

const Notices = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', audience: 'all', expiry_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticesAPI.getAll();
      setNotices(res.data.data);
    } catch { toast.error('Failed to load notices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await noticesAPI.create(form);
      toast.success('Notice posted successfully!');
      setShowModal(false);
      setForm({ title: '', content: '', priority: 'normal', audience: 'all', expiry_date: '' });
      fetchNotices();
    } catch { toast.error('Failed to post notice'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await noticesAPI.delete(id);
      toast.success('Notice removed');
      fetchNotices();
    } catch { toast.error('Failed to delete notice'); }
  };

  const filtered = filterPriority ? notices.filter(n => n.priority === filterPriority) : notices;

  return (
    <>
      <Header title="Notice Board" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Notice Board</h2>
            <div className="page-subtitle">{notices.length} active notices</div>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Post Notice
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['', 'urgent', 'high', 'normal', 'low'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              padding: '6px 16px', borderRadius: '20px', border: '1px solid',
              borderColor: filterPriority === p ? '#6378ff' : 'rgba(99,120,255,0.2)',
              background: filterPriority === p ? 'rgba(99,120,255,0.15)' : 'transparent',
              color: filterPriority === p ? '#6378ff' : '#8892b0',
              fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}>
              {p || 'All'} {p && `(${notices.filter(n => n.priority === p).length})`}
            </button>
          ))}
        </div>

        {/* Notice cards grid */}
        {loading ? (
          <div className="grid grid-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📢</div>
            <div>No notices found</div>
          </div>
        ) : (
          <div className="grid grid-2">
            {filtered.map(notice => {
              const ps = PRIORITY_STYLES[notice.priority] || PRIORITY_STYLES.normal;
              return (
                <div key={notice.id} className="card" style={{ cursor: 'pointer', position: 'relative', borderLeft: `4px solid ${ps.bar}`, borderRadius: '14px', transition: 'all 0.2s' }}
                  onClick={() => setSelected(notice)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#eef0ff', lineHeight: '1.4' }}>{notice.title}</h3>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge ${ps.badge}`}>{ps.label}</span>
                        <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{notice.audience}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(notice.id); }} style={{ flexShrink: 0, padding: '4px 10px' }}>✕</button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#8892b0', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {notice.content}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#4a5270' }}>
                    <span>By {notice.posted_by_name || 'Admin'}</span>
                    <span>{new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {notice.expiry_date && (
                    <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#ffb347' }}>
                      Expires: {new Date(notice.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Notice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Post New Notice</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Notice title..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-control" rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required placeholder="Write the notice content..." style={{ resize: 'vertical', minHeight: '120px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-control" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Audience</label>
                    <select className="form-control" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
                      <option value="all">All</option>
                      <option value="students">Students Only</option>
                      <option value="teachers">Teachers Only</option>
                      <option value="parents">Parents Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date (optional)</label>
                    <input type="date" className="form-control" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
                  </div>
                </div>

                {/* Preview badge */}
                {form.priority && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(99,120,255,0.06)', borderRadius: '8px', fontSize: '0.8rem', color: '#8892b0' }}>
                    Preview: <span className={`badge ${PRIORITY_STYLES[form.priority]?.badge}`}>{form.priority}</span>
                    <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{form.audience}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Posting...' : '📢 Post Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div style={{ flex: 1, marginRight: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{selected.title}</h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <span className={`badge ${PRIORITY_STYLES[selected.priority]?.badge}`}>{selected.priority}</span>
                  <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{selected.audience}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#8892b0', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{selected.content}</p>
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4a5270' }}>
                <span>Posted by {selected.posted_by_name || 'Admin'}</span>
                <span>{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              {selected.expiry_date && (
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ffb347' }}>
                  Expires: {new Date(selected.expiry_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notices;
