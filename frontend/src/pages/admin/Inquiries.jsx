import { useState, useEffect } from 'react';
import { Mail, Check, Trash2, Eye, Phone, Calendar, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInquiries();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);
        setInquiries(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateInquiry(id, { status });
      setInquiries((prev) => prev.map((inq) => inq._id === id ? { ...inq, status } : inq));
      if (selectedInquiry?._id === id) setSelectedInquiry((prev) => ({ ...prev, status }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await adminApi.deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i._id !== id));
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
          Patient Inquiries
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Questions and contact requests submitted through the public website
        </p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading patient messages..." />
          </div>
        ) : (!Array.isArray(inquiries) || inquiries.length === 0) ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState title="No Inquiries" description="No inquiries have been received yet." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Sender</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Subject & Message</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(inquiries) ? inquiries : []).map((inq) => (
                  <tr key={inq._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {inq.name}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {inq.email}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', maxWidth: 300 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {inq.subject || 'General Inquiry'}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.message}
                      </p>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {inq.createdAt?.split('T')[0]}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${inq.status === 'replied' ? 'badge-success' : inq.status === 'read' ? 'badge-neutral' : 'badge-warning'}`}>
                        {inq.status || 'unread'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelectedInquiry(inq); if (inq.status === 'unread') handleStatusChange(inq._id, 'read'); }} className="btn btn-outline btn-sm">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(inq._id)} className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedInquiry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Inquiry Details</h3>
              <button onClick={() => setSelectedInquiry(null)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>From</span>
                <strong>{selectedInquiry.name}</strong> ({selectedInquiry.email})
                {selectedInquiry.phone && <div>Phone: {selectedInquiry.phone}</div>}
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Subject</span>
                <strong>{selectedInquiry.subject || 'General Inquiry'}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Message</span>
                <p style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.25rem 0 0', lineHeight: 1.6 }}>
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedInquiry(null)} className="btn btn-outline">
                Close
              </button>
              {selectedInquiry.status !== 'replied' && (
                <button
                  onClick={() => handleStatusChange(selectedInquiry._id, 'replied')}
                  className="btn btn-primary"
                >
                  <Check size={16} /> Mark as Replied
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
