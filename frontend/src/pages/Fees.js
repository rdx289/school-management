// src/pages/Fees.js
import React, { useState, useEffect, useCallback } from 'react';
import { feesAPI, studentsAPI } from '../services/api';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const FEE_TYPES = ['Tuition Fee', 'Exam Fee', 'Library Fee', 'Sports Fee', 'Transport Fee', 'Hostel Fee', 'Lab Fee', 'Other'];
const PAYMENT_METHODS = ['cash', 'online', 'cheque', 'bank_transfer'];
const STATUS_COLORS = { paid: 'badge-success', pending: 'badge-warning', partial: 'badge-info', overdue: 'badge-danger' };

const emptyForm = {
  student_id: '', fee_type: 'Tuition Fee', amount: '', discount: '0', fine: '0',
  payment_method: 'cash', academic_year: '2024-25', month: '', remarks: '',
};

const Fees = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const [feesRes, statsRes] = await Promise.all([
        feesAPI.getAll({ page: pagination.page, limit: 10, status: filterStatus }),
        feesAPI.getStats(),
      ]);
      setFees(feesRes.data.data);
      setPagination(p => ({ ...p, ...feesRes.data.pagination }));
      setStats(statsRes.data.data);
    } catch { toast.error('Failed to load fees'); }
    finally { setLoading(false); }
  }, [pagination.page, filterStatus]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  useEffect(() => {
    studentsAPI.getAll({ limit: 200 }).then(r => setStudents(r.data.data)).catch(() => {});
  }, []);

  const totalAmount = () => {
    const amt = parseFloat(form.amount) || 0;
    const dis = parseFloat(form.discount) || 0;
    const fin = parseFloat(form.fine) || 0;
    return (amt - dis + fin).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id) { toast.warning('Please select a student'); return; }
    setSubmitting(true);
    try {
      const res = await feesAPI.collect(form);
      toast.success('Fee collected successfully!');
      setShowReceipt({ ...res.data.data, ...form, student: students.find(s => s.id === parseInt(form.student_id)) });
      setShowModal(false);
      setForm(emptyForm);
      fetchFees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to collect fee');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Header title="Fees Management" />
      <div className="page-content fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Fees Management</h2>
            <div className="page-subtitle">Track and collect student fees</div>
          </div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Collect Fee</button>}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-4" style={{ marginBottom: '28px' }}>
            {[
              { label: 'Total Collected', value: `₹${(stats.total_collected || 0).toLocaleString()}`, icon: '💰', color: '#00d4aa' },
              { label: 'Pending Amount', value: `₹${(stats.total_pending || 0).toLocaleString()}`, icon: '⏳', color: '#ffb347' },
              { label: 'Paid Invoices', value: stats.paid_count || 0, icon: '✓', color: '#6378ff' },
              { label: 'Pending Invoices', value: stats.pending_count || 0, icon: '!', color: '#ff4d6d' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ '--accent-color': s.color, '--icon-bg': `${s.color}22` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <select className="form-control" style={{ width: '160px' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Student</th><th>Fee Type</th><th>Amount</th><th>Discount</th><th>Total</th><th>Method</th><th>Date</th><th>Status</th><th>Receipt</th></tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => <tr key={i}>{[...Array(9)].map((__, j) => <td key={j}><div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} /></td>)}</tr>)
                  : fees.length === 0
                  ? <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">💳</div><div>No fee records found</div></div></td></tr>
                  : fees.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{f.student_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8892b0' }}>{f.student_code}</div>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{f.fee_type}</td>
                      <td style={{ fontSize: '0.875rem' }}>₹{parseFloat(f.amount).toLocaleString()}</td>
                      <td style={{ color: '#00d4aa', fontSize: '0.875rem' }}>
                        {parseFloat(f.discount) > 0 ? `-₹${parseFloat(f.discount).toLocaleString()}` : '—'}
                      </td>
                      <td style={{ fontWeight: '700' }}>₹{parseFloat(f.total_amount).toLocaleString()}</td>
                      <td style={{ color: '#8892b0', fontSize: '0.8rem', textTransform: 'capitalize' }}>{f.payment_method?.replace('_', ' ')}</td>
                      <td style={{ color: '#8892b0', fontSize: '0.8rem' }}>
                        {f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '—'}
                      </td>
                      <td><span className={`badge ${STATUS_COLORS[f.status]}`}>{f.status}</span></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowReceipt(f)}>
                          🧾 View
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="pagination" style={{ padding: '16px' }}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collect Fee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>Collect Fee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-control" value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} required>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Fee Type</label>
                    <select className="form-control" value={form.fee_type} onChange={e => setForm(p => ({ ...p, fee_type: e.target.value }))}>
                      {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-control" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input type="number" className="form-control" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount (₹)</label>
                    <input type="number" className="form-control" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fine (₹)</label>
                    <input type="number" className="form-control" value={form.fine} onChange={e => setForm(p => ({ ...p, fine: e.target.value }))} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input className="form-control" value={form.academic_year} onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <input className="form-control" placeholder="e.g. January" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input className="form-control" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
                </div>

                {/* Total preview */}
                {form.amount && (
                  <div style={{ background: 'rgba(99,120,255,0.08)', border: '1px solid rgba(99,120,255,0.2)', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8892b0', fontSize: '0.875rem' }}>Total Payable</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#6378ff' }}>₹{totalAmount()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Processing...' : '💳 Collect Fee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReceipt(null)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Fee Receipt</h3>
              <button className="modal-close" onClick={() => setShowReceipt(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={receiptStyles.receipt}>
                <div style={receiptStyles.header}>
                  <div style={receiptStyles.schoolName}>EduSync School</div>
                  <div style={receiptStyles.receiptTitle}>PAYMENT RECEIPT</div>
                  <div style={receiptStyles.receiptNo}>#{showReceipt.receipt_number || `RCP-${showReceipt.id}`}</div>
                </div>
                <div style={receiptStyles.divider} />
                <div style={receiptStyles.details}>
                  {[
                    ['Student', showReceipt.student_name || showReceipt.student?.name || '—'],
                    ['Student ID', showReceipt.student_code || showReceipt.student?.student_id || '—'],
                    ['Fee Type', showReceipt.fee_type],
                    ['Payment Date', showReceipt.payment_date ? new Date(showReceipt.payment_date).toLocaleDateString() : new Date().toLocaleDateString()],
                    ['Payment Method', showReceipt.payment_method?.replace('_', ' ')],
                    ['Academic Year', showReceipt.academic_year || '—'],
                    ['Month', showReceipt.month || '—'],
                  ].map(([l, v]) => (
                    <div key={l} style={receiptStyles.row}>
                      <span style={receiptStyles.rowLabel}>{l}</span>
                      <span style={receiptStyles.rowValue}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={receiptStyles.divider} />
                <div style={receiptStyles.amountSection}>
                  <div style={receiptStyles.amountRow}><span>Amount</span><span>₹{parseFloat(showReceipt.amount || 0).toLocaleString()}</span></div>
                  {parseFloat(showReceipt.discount) > 0 && <div style={receiptStyles.amountRow}><span>Discount</span><span style={{ color: '#00d4aa' }}>-₹{parseFloat(showReceipt.discount).toLocaleString()}</span></div>}
                  {parseFloat(showReceipt.fine) > 0 && <div style={receiptStyles.amountRow}><span>Fine</span><span style={{ color: '#ff4d6d' }}>+₹{parseFloat(showReceipt.fine).toLocaleString()}</span></div>}
                  <div style={receiptStyles.totalRow}>
                    <span>TOTAL PAID</span>
                    <span>₹{parseFloat(showReceipt.total_amount || showReceipt.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div style={receiptStyles.footer}>Thank you for your payment!</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-secondary" onClick={() => setShowReceipt(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const receiptStyles = {
  receipt: { background: '#0d0f1a', border: '1px solid rgba(99,120,255,0.2)', borderRadius: '12px', overflow: 'hidden' },
  header: { background: 'linear-gradient(135deg, rgba(99,120,255,0.2), rgba(0,212,170,0.1))', padding: '24px', textAlign: 'center' },
  schoolName: { fontSize: '1.2rem', fontWeight: '800', color: '#eef0ff' },
  receiptTitle: { fontSize: '0.75rem', letterSpacing: '0.2em', color: '#8892b0', marginTop: '4px' },
  receiptNo: { fontSize: '0.8rem', color: '#6378ff', fontFamily: 'monospace', marginTop: '6px' },
  divider: { height: '1px', background: 'rgba(99,120,255,0.15)', margin: '0 20px' },
  details: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' },
  rowLabel: { color: '#8892b0' },
  rowValue: { color: '#eef0ff', fontWeight: '500' },
  amountSection: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  amountRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#8892b0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#6378ff', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(99,120,255,0.2)' },
  footer: { textAlign: 'center', padding: '14px', fontSize: '0.75rem', color: '#4a5270', borderTop: '1px solid rgba(99,120,255,0.1)' },
};

export default Fees;
