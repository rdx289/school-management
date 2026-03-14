// src/pages/Students.js
import React, { useState, useEffect, useCallback } from 'react';
import { studentsAPI, classesAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const GENDERS = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const emptyForm = {
  name: '', dob: '', gender: 'male', class_id: '', phone: '', email: '',
  address: '', parent_name: '', parent_phone: '', parent_email: '',
  admission_date: '', blood_group: '', photo: null,
};

const Students = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll({ page: pagination.page, limit: 10, search, class_id: filterClass });
      setStudents(res.data.data);
      setPagination(p => ({ ...p, ...res.data.pagination }));
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [pagination.page, search, filterClass]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { classesAPI.getAll().then(r => setClasses(r.data.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    try {
      if (editingId) {
        await studentsAPI.update(editingId, fd);
        toast.success('Student updated!');
      } else {
        await studentsAPI.create(fd);
        toast.success('Student added!');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, dob: s.dob?.split('T')[0] || '', gender: s.gender, class_id: s.class_id, phone: s.phone || '', email: s.email || '', address: s.address || '', parent_name: s.parent_name || '', parent_phone: s.parent_phone || '', parent_email: s.parent_email || '', admission_date: s.admission_date?.split('T')[0] || '', blood_group: s.blood_group || '', photo: null });
    setEditingId(s.id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await studentsAPI.delete(deleteConfirm.id);
      toast.success('Student removed');
      setDeleteConfirm(null);
      fetchStudents();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <Header title="Student Management" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Students</h2>
            <div className="page-subtitle">{pagination.total} students enrolled</div>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); }}>
              + Add Student
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <span className="search-icon">⌕</span>
            <input placeholder="Search by name, ID or parent..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Admission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>{[...Array(8)].map((__, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} /></td>)}</tr>
                  ))
                ) : students.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🎓</div><div>No students found</div></div></td></tr>
                ) : students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar">
                          {s.photo ? <img src={`http://localhost:5000/uploads/students/${s.photo}`} alt="" /> : s.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#8892b0' }}>{s.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6378ff' }}>{s.student_id}</span></td>
                    <td>{s.class_name ? `${s.class_name} ${s.section}` : '—'}</td>
                    <td><span className={`badge badge-${s.gender === 'male' ? 'info' : s.gender === 'female' ? 'warning' : 'muted'}`}>{s.gender}</span></td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{s.parent_name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8892b0' }}>{s.parent_phone || ''}</div>
                    </td>
                    <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{s.phone || '—'}</td>
                    <td style={{ color: '#8892b0', fontSize: '0.8rem' }}>{s.admission_date ? new Date(s.admission_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowDetail(s)}>View</button>
                        {isAdmin && <>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(s)}>Del</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-control" value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-control" value={form.blood_group} onChange={e => setForm(p => ({ ...p, blood_group: e.target.value }))}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Name</label>
                    <input className="form-control" value={form.parent_name} onChange={e => setForm(p => ({ ...p, parent_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Phone</label>
                    <input className="form-control" value={form.parent_phone} onChange={e => setForm(p => ({ ...p, parent_phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admission Date</label>
                    <input type="date" className="form-control" value={form.admission_date} onChange={e => setForm(p => ({ ...p, admission_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Photo</label>
                    <input type="file" className="form-control" accept="image/*" onChange={e => setForm(p => ({ ...p, photo: e.target.files[0] }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : (editingId ? 'Update Student' : 'Add Student')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Student Profile</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div className="avatar avatar-lg" style={{ fontSize: '1.5rem', background: 'rgba(99,120,255,0.2)', color: '#6378ff' }}>
                  {showDetail.photo ? <img src={`http://localhost:5000/uploads/students/${showDetail.photo}`} alt="" /> : showDetail.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#eef0ff', marginBottom: '4px' }}>{showDetail.name}</h3>
                  <div style={{ fontFamily: 'monospace', color: '#6378ff', fontSize: '0.875rem', marginBottom: '12px' }}>{showDetail.student_id}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                    {[
                      ['Class', `${showDetail.class_name || '—'} ${showDetail.section || ''}`],
                      ['Gender', showDetail.gender || '—'],
                      ['DOB', showDetail.dob ? new Date(showDetail.dob).toLocaleDateString() : '—'],
                      ['Blood Group', showDetail.blood_group || '—'],
                      ['Phone', showDetail.phone || '—'],
                      ['Email', showDetail.email || '—'],
                      ['Parent', showDetail.parent_name || '—'],
                      ['Parent Phone', showDetail.parent_phone || '—'],
                      ['Admission', showDetail.admission_date ? new Date(showDetail.admission_date).toLocaleDateString() : '—'],
                      ['Address', showDetail.address || '—'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: '0.7rem', color: '#4a5270', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                        <div style={{ color: '#eef0ff', marginTop: '2px' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3>Confirm Delete</h3><button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button></div>
            <div className="modal-body">
              <p style={{ color: '#8892b0', marginBottom: '20px' }}>Remove <strong style={{ color: '#eef0ff' }}>{deleteConfirm.name}</strong> from the system? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Students;
