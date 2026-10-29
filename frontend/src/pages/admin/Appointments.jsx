import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, CheckCircle, XCircle, Clock, Search,
  Filter, Eye, Check, X, Phone, Mail, Stethoscope, User, Trash2, RotateCcw
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner, StatusBadge, EmptyState } from '../../components/UI';
import { WhatsAppIcon } from '../../components/FloatingWhatsApp';

export const generatePatientWhatsAppUrl = (app) => {
  if (!app) return null;
  const raw = (app.phone || app.mobile || '').trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  const patientName = app.patientName || 'Patient';
  const serviceTitle = app.service?.title || 'Dental Service';
  const doctorName = app.doctor?.name ? `Dr. ${app.doctor.name}` : 'Senior Dentist';
  const appDate = app.appointmentDate ? app.appointmentDate.split('T')[0] : '';
  const appTime = app.appointmentTime || '';

  const message = `Hello *${patientName}*,\n\nYour appointment at *SmileCraft Dental Clinic* has been *CONFIRMED*! ✅🦷\n\n📋 *Appointment Details:*\n• *Service:* ${serviceTitle}\n• *Doctor:* ${doctorName}\n• *Date:* ${appDate}\n• *Time:* ${appTime}\n\n📍 *Clinic Address:* SmileCraft Dental Clinic, Dental Care Plaza\n📞 *Clinic Phone / WhatsApp:* +91 9175514916\n\n_Please arrive 10 minutes prior to your slot time. Thank you!_ 😊`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

const Appointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [waAlert, setWaAlert] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getAppointments(params);
      if (res.data?.success) {
        const list = res.data.data?.appointments || (Array.isArray(res.data.data) ? res.data.data : []);
        setAppointments(list);
        if (res.data.data?.counts) {
          setStatusCounts(res.data.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus, targetApp = null) => {
    try {
      setUpdatingId(id);
      const res = await adminApi.updateAppointmentStatus(id, { status: newStatus });
      const updatedData = res.data?.data;
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, ...updatedData, status: newStatus } : app))
      );
      if (selectedAppointment?._id === id) {
        setSelectedAppointment((prev) => ({ ...prev, ...updatedData, status: newStatus }));
      }
      fetchAppointments();

      // If confirmed, trigger WhatsApp confirmation message to patient
      if (newStatus === 'confirmed') {
        const patientRecord = targetApp || appointments.find((a) => a._id === id) || updatedData;
        const waUrl = generatePatientWhatsAppUrl(patientRecord);
        if (waUrl) {
          window.open(waUrl, '_blank');
          setWaAlert({
            patientName: patientRecord?.patientName || 'Patient',
            phone: patientRecord?.phone || patientRecord?.mobile || '',
            url: waUrl,
          });
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, patientName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the appointment record for "${patientName || 'this patient'}"?`)) return;
    try {
      setUpdatingId(id);
      await adminApi.deleteAppointment(id);
      setAppointments((prev) => prev.filter((app) => app._id !== id));
      if (selectedAppointment?._id === id) {
        setSelectedAppointment(null);
      }
      fetchAppointments();
    } catch (err) {
      alert('Failed to delete appointment: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select both a new date and a new time slot.');
      return;
    }
    setRescheduleLoading(true);
    try {
      const res = await adminApi.updateAppointmentStatus(selectedAppointment._id, {
        status: selectedAppointment.status === 'cancelled' ? 'confirmed' : selectedAppointment.status,
        appointmentDate: newDate,
        appointmentTime: newTime,
        note: `Rescheduled by admin to ${newDate} at ${newTime}`,
      });
      alert('Appointment rescheduled successfully!');
      setIsRescheduling(false);
      fetchAppointments();
      setSelectedAppointment(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const term = searchTerm.toLowerCase();
    const phoneVal = (app.phone || app.mobile || '').toLowerCase();
    return (
      (app.patientName && app.patientName.toLowerCase().includes(term)) ||
      phoneVal.includes(term) ||
      (app.email && app.email.toLowerCase().includes(term)) ||
      (app.referenceNumber && app.referenceNumber.toLowerCase().includes(term)) ||
      (app.appointmentNumber && app.appointmentNumber.toLowerCase().includes(term))
    );
  });

  const filterTabs = [
    { key: '', label: 'All Bookings', count: statusCounts.all, color: 'var(--primary)', bg: '#f1f5f9' },
    { key: 'pending', label: 'Pending', count: statusCounts.pending, color: '#b45309', bg: '#fef3c7' },
    { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed, color: '#0f766e', bg: '#e0f7f6' },
    { key: 'completed', label: 'Completed', count: statusCounts.completed, color: '#047857', bg: '#d1fae5' },
    { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: '#b91c1c', bg: '#fee2e2' },
  ];

  return (
    <div className="admin-page">
      <style>{`
        .appt-actions-cell {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          white-space: nowrap;
        }
        .appt-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 32px;
          padding: 0 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
          line-height: 1;
          border: 1px solid transparent;
          box-sizing: border-box;
          font-family: inherit;
        }
        .appt-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .appt-btn-view {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #334155;
        }
        .appt-btn-view:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .appt-btn-whatsapp {
          background: #25D366;
          border-color: #20bd5a;
          color: #ffffff !important;
          box-shadow: 0 1px 2px rgba(37, 211, 102, 0.25);
        }
        .appt-btn-whatsapp:hover {
          background: #20bd5a;
          color: #ffffff !important;
          transform: translateY(-1px);
        }
        .appt-btn-confirm {
          background: #0ea5a0;
          border-color: #0d9488;
          color: #ffffff;
          box-shadow: 0 1px 2px rgba(14, 165, 160, 0.25);
        }
        .appt-btn-confirm:hover {
          background: #0d9488;
          color: #ffffff;
          transform: translateY(-1px);
        }
        .appt-btn-complete {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }
        .appt-btn-complete:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          color: #065f46;
        }
        .appt-btn-cancel {
          background: #fff7ed;
          border-color: #fed7aa;
          color: #c2410c;
        }
        .appt-btn-cancel:hover {
          background: #ffedd5;
          border-color: #fdba74;
          color: #9a3412;
        }
        .appt-btn-reopen {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }
        .appt-btn-reopen:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1e40af;
        }
        .appt-btn-delete {
          width: 32px;
          padding: 0;
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }
        .appt-btn-delete:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #b91c1c;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Manage Appointments
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Review incoming booking requests, confirm patient slots, and update treatment statuses
          </p>
        </div>
      </div>

      {/* Meaningful Filters with Real-time Count Badges and Search */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setSearchParams(tab.key ? { status: tab.key } : {});
                }}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : tab.bg,
                    color: isActive ? '#ffffff' : tab.color,
                    fontWeight: 700,
                  }}
                >
                  {tab.count ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search patient, phone, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.2rem', paddingRight: '1rem', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* WhatsApp Confirmation Notification Banner */}
      {waAlert && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(16, 185, 129, 0.12))',
            border: '1px solid #25D366',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
            <div style={{ background: '#25D366', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WhatsAppIcon size={18} color="#fff" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem' }}>Appointment Confirmed &amp; WhatsApp Confirmation Ready!</strong>
              <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                WhatsApp confirmation opened for <strong>{waAlert.patientName}</strong> ({waAlert.phone || 'patient'}). If popup was blocked by browser, click "Open WhatsApp".
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a
              href={waAlert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{ background: '#25D366', color: '#fff', borderColor: '#25D366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <WhatsAppIcon size={14} color="#fff" /> Open WhatsApp
            </a>
            <button
              onClick={() => setWaAlert(null)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading appointment bookings..." />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <EmptyState
              title={
                statusFilter === 'pending'
                  ? 'No Pending Appointments'
                  : statusFilter === 'confirmed'
                  ? 'No Confirmed Appointments'
                  : statusFilter === 'completed'
                  ? 'No Completed Appointments'
                  : statusFilter === 'cancelled'
                  ? 'No Cancelled Appointments'
                  : 'No Appointments Found'
              }
              description={
                statusFilter === 'completed'
                  ? 'No appointments have been marked as completed yet. Click the "Complete" button on any confirmed appointment when the treatment is finished.'
                  : statusFilter === 'cancelled'
                  ? 'No appointments have been cancelled.'
                  : statusFilter === 'pending'
                  ? 'All booking requests have already been reviewed and confirmed.'
                  : 'No booking records match your current search or filter criteria.'
              }
              action={
                statusFilter ? (
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setSearchParams({});
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '1rem' }}
                  >
                    View All Bookings
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Patient</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Service &amp; Doctor</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Date &amp; Time</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right', minWidth: '380px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {app.patientName}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.phone || app.mobile || 'No phone'} • {app.email || 'No email'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {app.service?.title || 'General Dental Service'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.doctor?.name ? `Dr. ${app.doctor.name}` : 'Any Doctor'}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {app.appointmentDate?.split('T')[0]}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.appointmentTime}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div className="appt-actions-cell">
                        {/* View Button */}
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          className="appt-btn appt-btn-view"
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>

                        {/* Actions for PENDING */}
                        {app.status === 'pending' && (
                          <>
                            <button
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'confirmed', app)}
                              className="appt-btn appt-btn-confirm"
                              title="Confirm Appointment & Send WhatsApp"
                            >
                              <Check size={14} />
                              <span>Confirm</span>
                            </button>
                            <button
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'cancelled', app)}
                              className="appt-btn appt-btn-cancel"
                              title="Cancel Appointment"
                            >
                              <X size={14} />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {/* Actions for CONFIRMED */}
                        {app.status === 'confirmed' && (
                          <>
                            {generatePatientWhatsAppUrl(app) && (
                              <a
                                href={generatePatientWhatsAppUrl(app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="appt-btn appt-btn-whatsapp"
                                title="Send WhatsApp Confirmation to Patient"
                              >
                                <WhatsAppIcon size={14} color="#ffffff" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'completed', app)}
                              className="appt-btn appt-btn-complete"
                              title="Mark Treatment as Completed"
                            >
                              <CheckCircle size={14} />
                              <span>Complete</span>
                            </button>
                            <button
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'cancelled', app)}
                              className="appt-btn appt-btn-cancel"
                              title="Cancel Appointment"
                            >
                              <X size={14} />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}

                        {/* Actions for COMPLETED */}
                        {app.status === 'completed' && (
                          <>
                            {generatePatientWhatsAppUrl(app) && (
                              <a
                                href={generatePatientWhatsAppUrl(app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="appt-btn appt-btn-whatsapp"
                                title="Chat with Patient on WhatsApp"
                              >
                                <WhatsAppIcon size={14} color="#ffffff" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'confirmed')}
                              className="appt-btn appt-btn-reopen"
                              title="Reopen to Confirmed status"
                            >
                              <RotateCcw size={14} />
                              <span>Reopen</span>
                            </button>
                          </>
                        )}

                        {/* Actions for CANCELLED */}
                        {app.status === 'cancelled' && (
                          <button
                            disabled={updatingId === app._id}
                            onClick={() => handleStatusChange(app._id, 'confirmed')}
                            className="appt-btn appt-btn-confirm"
                            title="Restore Appointment to Confirmed"
                          >
                            <RotateCcw size={14} />
                            <span>Restore</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          disabled={updatingId === app._id}
                          onClick={() => handleDelete(app._id, app.patientName)}
                          className="appt-btn appt-btn-delete"
                          title="Permanently Delete Record"
                        >
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

      {/* Details Modal */}
      {selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Appointment Details</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ref: {selectedAppointment.referenceNumber || selectedAppointment.appointmentNumber || selectedAppointment._id}
                </span>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Patient Name</span>
                <strong>{selectedAppointment.patientName}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Phone</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px', flexWrap: 'wrap' }}>
                    <strong>{selectedAppointment.phone || selectedAppointment.mobile || 'N/A'}</strong>
                    {generatePatientWhatsAppUrl(selectedAppointment) && (
                      <a
                        href={generatePatientWhatsAppUrl(selectedAppointment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#059669',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          background: 'rgba(37, 211, 102, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                        title="Chat with Patient on WhatsApp"
                      >
                        <WhatsAppIcon size={13} color="#059669" /> Chat
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Email</span>
                  <strong>{selectedAppointment.email || 'N/A'}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Age</span>
                  <strong>{selectedAppointment.age ? `${selectedAppointment.age} yrs` : 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Gender</span>
                  <strong style={{ textTransform: 'capitalize' }}>
                    {selectedAppointment.gender && selectedAppointment.gender !== 'prefer-not-to-say'
                      ? selectedAppointment.gender
                      : (selectedAppointment.gender === 'prefer-not-to-say' ? 'Prefer not to say' : 'N/A')}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Service</span>
                  <strong>{selectedAppointment.service?.title || 'General Dental Service'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Doctor</span>
                  <strong>{selectedAppointment.doctor?.name ? `Dr. ${selectedAppointment.doctor.name}` : 'Any Available Doctor'}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Appointment Date</span>
                  <strong>{selectedAppointment.appointmentDate?.split('T')[0]}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Slot Time</span>
                  <strong>{selectedAppointment.appointmentTime}</strong>
                </div>
              </div>

              {(selectedAppointment.notes || selectedAppointment.message) && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Notes / Symptoms</span>
                  <p style={{ margin: '0.25rem 0 0', background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    {selectedAppointment.notes || selectedAppointment.message}
                  </p>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Current Status</span>
                <StatusBadge status={selectedAppointment.status} />
              </div>

              {/* Status History Timeline */}
              {selectedAppointment.statusHistory && selectedAppointment.statusHistory.length > 0 && (
                <div style={{ marginTop: '0.5rem', background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>Status History:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                    {selectedAppointment.statusHistory.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>• <strong>{h.status}</strong> {h.note ? `— ${h.note}` : ''}</span>
                        <span>{h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reschedule Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                {!isRescheduling ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRescheduling(true);
                      setNewDate(selectedAppointment.appointmentDate?.split('T')[0] || '');
                      setNewTime(selectedAppointment.appointmentTime || '');
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={14} /> Reschedule This Appointment
                  </button>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                      Reschedule Appointment
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>New Date</label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="form-control"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>New Slot</label>
                        <select
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="form-control"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                        >
                          <option value="">Select Time</option>
                          {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={rescheduleLoading}
                        onClick={handleReschedule}
                        className="btn btn-primary btn-sm"
                      >
                        {rescheduleLoading ? 'Saving...' : 'Confirm New Time'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDelete(selectedAppointment._id, selectedAppointment.patientName)}
                className="appt-btn appt-btn-delete"
                style={{ width: 'auto', padding: '0 12px', height: '36px' }}
              >
                <Trash2 size={15} /> Delete Record
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setSelectedAppointment(null); setIsRescheduling(false); }}
                  className="appt-btn appt-btn-view"
                  style={{ height: '36px', padding: '0 14px' }}
                >
                  Close
                </button>
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed', selectedAppointment)}
                      className="appt-btn appt-btn-confirm"
                      style={{ height: '36px', padding: '0 14px' }}
                    >
                      <Check size={15} /> Confirm &amp; Send WhatsApp
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment._id, 'cancelled', selectedAppointment)}
                      className="appt-btn appt-btn-cancel"
                      style={{ height: '36px', padding: '0 12px' }}
                    >
                      <X size={15} /> Cancel Booking
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <>
                    {generatePatientWhatsAppUrl(selectedAppointment) && (
                      <a
                        href={generatePatientWhatsAppUrl(selectedAppointment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="appt-btn appt-btn-whatsapp"
                        style={{ height: '36px', padding: '0 14px' }}
                        title="Send WhatsApp Confirmation to Patient"
                      >
                        <WhatsAppIcon size={16} color="#fff" />
                        <span>Send WhatsApp</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleStatusChange(selectedAppointment._id, 'completed', selectedAppointment)}
                      className="appt-btn appt-btn-complete"
                      style={{ height: '36px', padding: '0 14px' }}
                    >
                      <CheckCircle size={15} /> Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment._id, 'cancelled', selectedAppointment)}
                      className="appt-btn appt-btn-cancel"
                      style={{ height: '36px', padding: '0 12px' }}
                    >
                      <X size={15} /> Cancel Booking
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed')}
                    className="appt-btn appt-btn-reopen"
                    style={{ height: '36px', padding: '0 14px' }}
                  >
                    <RotateCcw size={15} /> Reopen Booking
                  </button>
                )}
                {selectedAppointment.status === 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed')}
                    className="appt-btn appt-btn-confirm"
                    style={{ height: '36px', padding: '0 14px' }}
                  >
                    <RotateCcw size={15} /> Restore Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;