// src/pages/Exams.js
import React, { useState, useEffect } from 'react';
import { examsAPI, classesAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const EXAM_TYPES = ['unit_test', 'midterm', 'final', 'practical', 'other'];

const Exams = () => {
  const { isAdmin, isTeacher } = useAuth();
  const toast = useToast();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', exam_type: 'unit_test', class_id: '', subject_id: '', exam_date: '', total_marks: 100, passing_marks: 35 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    examsAPI.getAll().then(r => setExams(r.data.data)).catch(() => {}).finally(() => setLoading(false));
    classesAPI.getAll().then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await examsAPI.create(form);
      toast.success('Exam scheduled!');
      setShowModal(false);
      examsAPI.getAll().then(r => setExams(r.data.data));
    } catch { toast.error('Failed to create exam'); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Header title="Exams & Results" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div><h2 className="page-title">Exams & Results</h2><div className="page-subtitle">{exams.length} exams scheduled</div></div>
          {(isAdmin || isTeacher) && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Schedule Exam</button>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Exam Name</th><th>Type</th><th>Class</th><th>Subject</th><th>Date</th><th>Total Marks</th><th>Pass Marks</th></tr></thead>
              <tbody>
                {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(7)].map((__, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} /></td>)}</tr>)
                  : exams.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📝</div><div>No exams scheduled</div></div></td></tr>
                  : exams.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: '600', fontSize: '0.875rem' }}>{e.name}</td>
                      <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{e.exam_type.replace('_', ' ')}</span></td>
                      <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{e.class_name ? `${e.class_name} ${e.section}` : 'All'}</td>
                      <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{e.subject_name || '—'}</td>
                      <td>
                        <span style={{ color: new Date(e.exam_date) >= new Date() ? '#00d4aa' : '#8892b0', fontSize: '0.875rem' }}>
                          {new Date(e.exam_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{e.total_marks}</td>
                      <td style={{ color: '#8892b0' }}>{e.passing_marks}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h3>Schedule Exam</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Exam Name *</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Exam Type</label>
                    <select className="form-control" value={form.exam_type} onChange={e => setForm(p => ({ ...p, exam_type: e.target.value }))}>
                      {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Class</label>
                    <select className="form-control" value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}>
                      <option value="">All Classes</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Exam Date *</label><input type="date" className="form-control" value={form.exam_date} onChange={e => setForm(p => ({ ...p, exam_date: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Total Marks</label><input type="number" className="form-control" value={form.total_marks} onChange={e => setForm(p => ({ ...p, total_marks: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Passing Marks</label><input type="number" className="form-control" value={form.passing_marks} onChange={e => setForm(p => ({ ...p, passing_marks: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Schedule Exam'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Exams;
