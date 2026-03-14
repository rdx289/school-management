// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import { studentsAPI, teachersAPI, feesAPI, attendanceAPI, classesAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Header from '../components/Header';
import { useToast } from '../components/Toast';

const COLORS = ['#6378ff', '#00d4aa', '#ff6b9d', '#ffb347', '#a78bfa', '#34d399'];

const Reports = () => {
  const toast = useToast();
  const [activeReport, setActiveReport] = useState('overview');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ class_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  useEffect(() => {
    classesAPI.getAll().then(r => setClasses(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (activeReport === 'students' || activeReport === 'overview') {
          const r = await studentsAPI.getAll({ limit: 500, class_id: filters.class_id });
          setStudents(r.data.data);
        }
        if (activeReport === 'fees' || activeReport === 'overview') {
          const r = await feesAPI.getAll({ limit: 500 });
          setFees(r.data.data);
        }
        if (activeReport === 'attendance' || activeReport === 'overview') {
          const r = await attendanceAPI.getAll({ class_id: filters.class_id, month: filters.month, year: filters.year });
          setAttendance(r.data.data);
        }
      } catch { toast.error('Failed to load report data'); }
      finally { setLoading(false); }
    };
    load();
  }, [activeReport, filters]);

  // Compute gender breakdown
  const genderData = [
    { name: 'Male', value: students.filter(s => s.gender === 'male').length },
    { name: 'Female', value: students.filter(s => s.gender === 'female').length },
    { name: 'Other', value: students.filter(s => s.gender === 'other').length },
  ].filter(d => d.value > 0);

  // Class-wise student data
  const classData = classes.slice(0, 8).map(c => ({
    name: `${c.name} ${c.section}`,
    students: students.filter(s => s.class_id === c.id).length,
  }));

  // Fee status breakdown
  const feeStatusData = ['paid', 'pending', 'overdue', 'partial'].map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: fees.filter(f => f.status === status).length,
  })).filter(d => d.value > 0);

  // Attendance status breakdown
  const attStatusData = ['present', 'absent', 'late', 'excused'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: attendance.filter(a => a.status === s).length,
  })).filter(d => d.value > 0);

  // Export to CSV
  const exportCSV = (data, filename) => {
    if (!data.length) { toast.warning('No data to export'); return; }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${filename} exported!`);
  };

  const TABS = [
    { id: 'overview',    label: '📊 Overview' },
    { id: 'students',   label: '🎓 Students' },
    { id: 'fees',       label: '💳 Fees' },
    { id: 'attendance', label: '✓ Attendance' },
  ];

  return (
    <>
      <Header title="Reports" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Reports & Analytics</h2>
            <div className="page-subtitle">Generate and export detailed reports</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(99,120,255,0.08)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveReport(tab.id)} style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeReport === tab.id ? '#6378ff' : 'transparent',
              color: activeReport === tab.id ? 'white' : '#8892b0',
              fontWeight: '600', fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: '180px' }} value={filters.class_id} onChange={e => setFilters(p => ({ ...p, class_id: e.target.value }))}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
          </select>
          <select className="form-control" style={{ width: '130px' }} value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select className="form-control" style={{ width: '100px' }} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
            {[2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />)}
          </div>
        ) : (
          <>
            {/* Overview / Students charts */}
            {(activeReport === 'overview' || activeReport === 'students') && (
              <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Students by Class</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(students.map(s => ({ id: s.student_id, name: s.name, class: `${s.class_name} ${s.section}`, gender: s.gender, parent: s.parent_name, phone: s.phone })), 'students')}>
                      ↓ Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={classData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                      <Bar dataKey="students" fill="#6378ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Gender Distribution</h3>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart width={200} height={200}>
                      <Pie data={genderData} cx={100} cy={100} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    </PieChart>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                    {genderData.map((g, i) => (
                      <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#8892b0' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                        {g.name}: <strong style={{ color: '#eef0ff' }}>{g.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fees report */}
            {(activeReport === 'overview' || activeReport === 'fees') && (
              <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Fee Status Breakdown</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(fees.map(f => ({ student: f.student_name, id: f.student_code, type: f.fee_type, amount: f.total_amount, status: f.status, date: f.payment_date })), 'fees')}>
                      ↓ Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={feeStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {feeStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                      <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#8892b0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Fee Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Total Records', value: fees.length, color: '#eef0ff' },
                      { label: 'Total Collected', value: `₹${fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.total_amount), 0).toLocaleString()}`, color: '#00d4aa' },
                      { label: 'Total Pending', value: `₹${fees.filter(f => f.status !== 'paid').reduce((s, f) => s + parseFloat(f.total_amount), 0).toLocaleString()}`, color: '#ffb347' },
                      { label: 'Paid Count', value: fees.filter(f => f.status === 'paid').length, color: '#6378ff' },
                      { label: 'Pending Count', value: fees.filter(f => f.status === 'pending').length, color: '#ff4d6d' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(99,120,255,0.05)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.875rem', color: '#8892b0' }}>{item.label}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance report */}
            {(activeReport === 'overview' || activeReport === 'attendance') && (
              <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Attendance Distribution</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(attendance.map(a => ({ student: a.student_name, id: a.student_code, class: a.class_name, date: a.date, status: a.status })), 'attendance')}>
                      ↓ Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={attStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} />
                      <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#13162a', border: '1px solid rgba(99,120,255,0.3)', borderRadius: '8px', fontSize: '0.8rem' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {attStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Attendance Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {['present', 'absent', 'late', 'excused'].map((s, i) => {
                      const count = attendance.filter(a => a.status === s).length;
                      const pct = attendance.length ? ((count / attendance.length) * 100).toFixed(1) : 0;
                      return (
                        <div key={s}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                            <span style={{ textTransform: 'capitalize', color: '#8892b0' }}>{s}</span>
                            <span style={{ fontWeight: '700', color: '#eef0ff' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(99,120,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i], borderRadius: '3px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(99,120,255,0.08)', borderRadius: '8px', fontSize: '0.8rem', color: '#8892b0' }}>
                    Total records this period: <strong style={{ color: '#eef0ff' }}>{attendance.length}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Data table for active report */}
            {activeReport === 'students' && (
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(99,120,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Student List ({students.length})</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => exportCSV(students.map(s => ({ StudentID: s.student_id, Name: s.name, Class: `${s.class_name || ''} ${s.section || ''}`, Gender: s.gender, DOB: s.dob, Phone: s.phone, ParentName: s.parent_name, ParentPhone: s.parent_phone, Address: s.address, AdmissionDate: s.admission_date })), 'students')}>
                    ↓ Export CSV
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Student ID</th><th>Class</th><th>Gender</th><th>Phone</th><th>Parent</th></tr></thead>
                    <tbody>
                      {students.slice(0, 20).map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '500', fontSize: '0.875rem' }}>{s.name}</td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6378ff' }}>{s.student_id}</span></td>
                          <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{s.class_name ? `${s.class_name} ${s.section}` : '—'}</td>
                          <td><span className={`badge badge-${s.gender === 'male' ? 'info' : 'warning'}`}>{s.gender}</span></td>
                          <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{s.phone || '—'}</td>
                          <td style={{ color: '#8892b0', fontSize: '0.875rem' }}>{s.parent_name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {students.length > 20 && <div style={{ padding: '12px 20px', color: '#4a5270', fontSize: '0.75rem', textAlign: 'center' }}>Showing 20 of {students.length} — export CSV for full list</div>}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Reports;
