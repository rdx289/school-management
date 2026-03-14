// src/pages/Teachers.js
import React, { useState, useEffect, useCallback } from 'react';
import { teachersAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', phone: '', subject: '', qualification: '', joining_date: '', gender: 'male', dob: '', salary: '', address: '' };

const Teachers = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teachersAPI.getAll({ page: pagination.page, limit: 10, search });
      setTeachers(res.data.data);
      setPagination(p => ({ ...p, ...res.data.pagination }));
    } catch { toast.error('Failed to load teachers'); }
    finally { setLoading(false); }
  }, [pagination.page, search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      if (editingId) { await teachersAPI.update(editingId, fd); toast.success('Teacher updated!'); }
      else { await teachersAPI.create(fd); toast.success('Teacher added! Default password: Teacher@123'); }
      setShowModal(false); setForm(emptyForm); setEditingId(null); fetchTeachers();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, email: t.email, phone: t.phone || '', subject: t.subject || '', qualification: t.qualification || '', joining_date: t.joining_date?.split('T')[0] || '', gender: t.gender || 'male', dob: t.dob?.split('T')[0] || '', salary: t.salary || '', address: t.address || '' });
    setEditingId(t.id); setShowModal(true);
  };

  return (
    <>
      <Header title="Teacher Management" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Teachers</h2>
            <div className="page-subtitle">{pagination.total} teachers on staff</div>
          </div>
          {isAdmin && <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }}>+ Add Teacher</button>}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div className="search-bar" style={{ flex: '1' }}>
            <span className="search-icon">⌕</span>
            <input placeholder="Search teachers..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Teacher</th><th>ID</th><th>Subject</th><th>Qualification</th><th>Phone</th><th>Joining Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(7)].map((__, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} /></td>)}</tr>)
                  : teachers.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">👩‍🏫</div><div>No teachers found</div></div></td></tr>
                  : teachers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}>
                            {t.photo ? <img src={`http://localhost:5000/uploads/teachers/${t.photo}`} alt="" /> : t.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{t.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#8892b0' }}>{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00d4aa' }}>{t.teacher_id}</span></td>
                      <td><span className="badge badge-success">{t.subject || '—'}</span></td>
                      <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{t.qualification || '—'}</td>
                      <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{t.phone || '—'}</td>
                      <td style={{ color: '#8892b0', fontSize: '0.8rem' }}>{t.joining_date ? new Date(t.joining_date).toLocaleDateString() : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {isAdmin && <>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(t)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(t)}>Del</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '660px' }}>
            <div className="modal-header"><h3>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required disabled={!!editingId} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input className="form-control" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" className="form-control" value={form.joining_date} onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary</label>
                    <input type="number" className="form-control" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Photo</label>
                    <input type="file" className="form-control" accept="image/*" onChange={e => setForm(p => ({ ...p, photo: e.target.files[0] }))} />
                  </div>
                </div>
                {!editingId && <p style={{ fontSize: '0.75rem', color: '#8892b0', marginTop: '12px' }}>ℹ Default login password will be: <code style={{ color: '#6378ff' }}>Teacher@123</code></p>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Teacher')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>Confirm Delete</h3><button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button></div>
            <div className="modal-body">
              <p style={{ color: '#8892b0', marginBottom: '20px' }}>Remove <strong style={{ color: '#eef0ff' }}>{deleteConfirm.name}</strong>?</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={async () => { await teachersAPI.delete(deleteConfirm.id); toast.success('Teacher removed'); setDeleteConfirm(null); fetchTeachers(); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Teachers;
