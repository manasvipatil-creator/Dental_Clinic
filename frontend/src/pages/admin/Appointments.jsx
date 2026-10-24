import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, CheckCircle, XCircle, Clock, Search,
  Filter, Eye, Check, X, Phone, Mail, Stethoscope, User
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner, StatusBadge, EmptyState } from '../../components/UI';

const Appointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getAppointments(params);
      if (res.data?.success) {
        const list = res.data.data?.appointments || (Array.isArray(res.data.data) ? res.data.data : []);
        setAppointments(list);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await adminApi.updateAppointmentStatus(id, { status: newStatus });
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
      if (selectedAppointment?._id === id) {
        setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
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
    return (
      (app.patientName && app.patientName.toLowerCase().includes(term)) ||
      (app.phone && app.phone.includes(term)) ||
      (app.email && app.email.toLowerCase().includes(term)) ||
      (app.appointmentNumber && app.appointmentNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Manage Appointments
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Review incoming booking requests, confirm patient slots, and update statuses
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setSearchParams(st ? { status: st } : {});
              }}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st === '' ? 'All Bookings' : st}
            </button>
          ))}
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

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading appointment bookings..." />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState
              title="No Appointments Found"
              description="No booking records match your current filter criteria."
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Patient</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Service & Doctor</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Date & Time</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {app.patientName}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.phone} • {app.email}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {app.service?.title || 'General Dental Service'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.doctor?.name ? `Dr. ${app.doctor.name}` : 'Any Doctor'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {app.appointmentDate?.split('T')[0]}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {app.appointmentTime}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          className="btn btn-outline btn-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {app.status === 'pending' && (
                          <button
                            disabled={updatingId === app._id}
                            onClick={() => handleStatusChange(app._id, 'confirmed')}
                            className="btn btn-primary btn-sm"
                            title="Confirm Appointment"
                          >
                            <Check size={14} /> Confirm
                          </button>
                        )}

                        {app.status === 'confirmed' && (
                          <button
                            disabled={updatingId === app._id}
                            onClick={() => handleStatusChange(app._id, 'completed')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: '#10b981', color: '#10b981' }}
                            title="Mark as Completed"
                          >
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}

                        {app.status !== 'cancelled' && (
                          <button
                            disabled={updatingId === app._id}
                            onClick={() => handleStatusChange(app._id, 'cancelled')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            title="Cancel Appointment"
                          >
                            <X size={14} />
                          </button>
                        )}
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
                  Ref: {selectedAppointment.appointmentNumber || selectedAppointment._id}
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
                  <strong>{selectedAppointment.phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Email</span>
                  <strong>{selectedAppointment.email}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Age</span>
                  <strong>{selectedAppointment.age || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Gender</span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedAppointment.gender || 'N/A'}</strong>
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

              {selectedAppointment.notes && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Notes / Symptoms</span>
                  <p style={{ margin: '0.25rem 0 0', background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    {selectedAppointment.notes}
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

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button
                onClick={() => { setSelectedAppointment(null); setIsRescheduling(false); }}
                className="btn btn-outline"
              >
                Close
              </button>
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed')}
                  className="btn btn-primary"
                >
                  <Check size={16} /> Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
