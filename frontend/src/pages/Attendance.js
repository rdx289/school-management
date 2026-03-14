// src/pages/Attendance.js
import React, { useState, useEffect } from 'react';
import { attendanceAPI, studentsAPI, classesAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];
const STATUS_COLORS = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-muted' };

const Attendance = () => {
  const { isAdmin, isTeacher } = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    classesAPI.getAll().then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      studentsAPI.getAll({ class_id: selectedClass, limit: 100 }).then(r => {
        setStudents(r.data.data);
        const init = {};
        r.data.data.forEach(s => { init[s.id] = 'present'; });
        setAttendance(init);
      }).catch(() => {});
    }
  }, [selectedClass]);

  useEffect(() => {
    if (activeTab === 'history') {
      setLoading(true);
      attendanceAPI.getAll({ class_id: selectedClass, date }).then(r => {
        setHistory(r.data.data);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [activeTab, selectedClass, date]);

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass) { toast.warning('Please select a class'); return; }
    if (!students.length) { toast.warning('No students in this class'); return; }
    setSubmitting(true);
    try {
      const records = students.map(s => ({ student_id: s.id, status: attendance[s.id] || 'present', remarks: '' }));
      await attendanceAPI.mark({ date, class_id: selectedClass, attendance: records });
      toast.success(`Attendance saved for ${students.length} students!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Header title="Attendance" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Attendance Management</h2>
            <div className="page-subtitle">Mark and track student attendance</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(99,120,255,0.08)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
          {['mark', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#6378ff' : 'transparent',
              color: activeTab === tab ? 'white' : '#8892b0',
              fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
              {tab === 'mark' ? '✓ Mark Attendance' : '📋 History'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: '200px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: '180px' }} value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {activeTab === 'mark' && (
          <div className="card" style={{ padding: 0 }}>
            {/* Actions bar */}
            {students.length > 0 && (isAdmin || isTeacher) && (
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(99,120,255,0.1)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#8892b0', marginRight: '8px' }}>Mark all:</span>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} className={`btn btn-sm`} onClick={() => handleMarkAll(s)} style={{
                    background: s === 'present' ? 'rgba(0,212,170,0.15)' : s === 'absent' ? 'rgba(255,77,109,0.15)' : s === 'late' ? 'rgba(255,179,71,0.15)' : 'rgba(136,146,176,0.15)',
                    color: s === 'present' ? '#00d4aa' : s === 'absent' ? '#ff4d6d' : s === 'late' ? '#ffb347' : '#8892b0',
                    border: 'none', textTransform: 'capitalize',
                  }}>{s}</button>
                ))}
                <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto' }}>
                  {submitting ? 'Saving...' : '💾 Save Attendance'}
                </button>
              </div>
            )}
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>ID</th>{STATUS_OPTIONS.map(s => <th key={s} style={{ textTransform: 'capitalize' }}>{s}</th>)}</tr>
                </thead>
                <tbody>
                  {!selectedClass ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🏫</div><div>Select a class to mark attendance</div></div></td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🎓</div><div>No students in this class</div></div></td></tr>
                  ) : students.map((s, idx) => (
                    <tr key={s.id}>
                      <td style={{ color: '#4a5270', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ fontSize: '0.8rem' }}>{s.name[0]}</div>
                          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{s.name}</span>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6378ff' }}>{s.student_id}</span></td>
                      {STATUS_OPTIONS.map(status => (
                        <td key={status}>
                          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input
                              type="radio"
                              name={`att-${s.id}`}
                              value={status}
                              checked={attendance[s.id] === status}
                              onChange={() => setAttendance(p => ({ ...p, [s.id]: status }))}
                              style={{ accentColor: '#6378ff' }}
                              disabled={!isAdmin && !isTeacher}
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Student</th><th>ID</th><th>Class</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loading ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(5)].map((__, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} /></td>)}</tr>)
                    : history.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">📋</div><div>No attendance records found</div></div></td></tr>
                    : history.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>{r.student_name}</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6378ff' }}>{r.student_code}</span></td>
                        <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{r.class_name} {r.section}</td>
                        <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                        <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Attendance;
