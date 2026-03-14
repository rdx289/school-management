// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import { classesAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', section: 'A', capacity: 40, room_number: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classesAPI.getAll();
      setClasses(res.data.data);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await classesAPI.create(form);
      toast.success('Class created!');
      setShowModal(false);
      setForm({ name: '', section: 'A', capacity: 40, room_number: '' });
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class? Students assigned to it will be unassigned.')) return;
    try {
      await classesAPI.delete(id);
      toast.success('Class deleted');
      fetchClasses();
    } catch { toast.error('Failed to delete class'); }
  };

  // Group by class name
  const grouped = classes.reduce((acc, c) => {
    const key = c.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <>
      <Header title="Classes & Sections" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Classes & Sections</h2>
            <div className="page-subtitle">{classes.length} sections across {Object.keys(grouped).length} grades</div>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Class</button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />)}
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏫</div><div>No classes created yet</div></div>
        ) : (
          <div className="grid grid-3">
            {classes.map(cls => (
              <div key={cls.id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,120,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '12px' }}>
                    🏫
                  </div>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls.id)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>✕</button>
                  )}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#eef0ff' }}>{cls.name}</h3>
                <div style={{ color: '#6378ff', fontSize: '0.875rem', fontWeight: '600', marginTop: '2px' }}>Section {cls.section}</div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#4a5270', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Students</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#eef0ff' }}>{cls.student_count || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#4a5270', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capacity</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#eef0ff' }}>{cls.capacity}</div>
                  </div>
                </div>

                {/* Capacity bar */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ height: '4px', background: 'rgba(99,120,255,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(((cls.student_count || 0) / cls.capacity) * 100, 100)}%`,
                      background: (cls.student_count / cls.capacity) > 0.9 ? '#ff4d6d' : '#6378ff',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#4a5270', marginTop: '4px' }}>
                    {Math.round(((cls.student_count || 0) / cls.capacity) * 100)}% capacity used
                  </div>
                </div>

                {cls.room_number && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#8892b0' }}>
                    🚪 Room {cls.room_number}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Add New Class</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Class / Grade Name *</label>
                  <input className="form-control" placeholder="e.g. Grade 5" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Section *</label>
                    <select className="form-control" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))}>
                      {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input type="number" className="form-control" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} min="1" max="100" />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Room Number</label>
                    <input className="form-control" placeholder="e.g. R-201" value={form.room_number} onChange={e => setForm(p => ({ ...p, room_number: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Class'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Classes;
