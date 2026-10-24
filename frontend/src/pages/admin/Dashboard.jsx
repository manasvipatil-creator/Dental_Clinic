import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle, Clock, AlertCircle, Users,
  Stethoscope, Mail, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner, StatusBadge } from '../../components/UI';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
      // Fallback empty stats structure
      setStats({
        appointments: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
        servicesCount: 0,
        doctorsCount: 0,
        unreadInquiries: 0,
        recentAppointments: [],
        recentInquiries: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading clinic metrics..." />;
  }

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats?.appointments?.total || 0,
      icon: <Calendar size={22} color="var(--primary)" />,
      badge: `${stats?.appointments?.pending || 0} Pending`,
      bg: 'rgba(13, 148, 136, 0.1)',
      link: '/admin/appointments',
    },
    {
      title: 'Confirmed Visits',
      value: stats?.appointments?.confirmed || 0,
      icon: <CheckCircle size={22} color="#10b981" />,
      badge: 'Active Bookings',
      bg: 'rgba(16, 185, 129, 0.1)',
      link: '/admin/appointments?status=confirmed',
    },
    {
      title: 'Specialist Doctors',
      value: stats?.doctorsCount || 0,
      icon: <Users size={22} color="#3b82f6" />,
      badge: 'Team Members',
      bg: 'rgba(59, 130, 246, 0.1)',
      link: '/admin/doctors',
    },
    {
      title: 'Inquiries Received',
      value: stats?.unreadInquiries || 0,
      icon: <Mail size={22} color="#f59e0b" />,
      badge: 'Requires Reply',
      bg: 'rgba(245, 158, 11, 0.1)',
      link: '/admin/inquiries',
    },
  ];

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Clinic Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Live performance, incoming appointments, and patient inquiries
          </p>
        </div>
        <Link to="/admin/appointments" className="btn btn-primary btn-sm">
          <Calendar size={16} />
          View All Appointments
        </Link>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {statCards.map((c, i) => (
          <Link
            to={c.link}
            key={i}
            className="card"
            style={{
              padding: '1.5rem',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                {c.badge}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {c.value}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {c.title}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Appointments & Inquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Recent Appointments */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Latest Appointments
            </h3>
            <Link to="/admin/appointments" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              All Bookings <ArrowUpRight size={14} />
            </Link>
          </div>

          {(!stats?.recentAppointments || stats.recentAppointments.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No appointments booked yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentAppointments.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {app.patientName}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {app.service?.title || 'General Checkup'} • {app.appointmentDate?.split('T')[0]} at {app.appointmentTime}
                    </span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Recent Patient Inquiries
            </h3>
            <Link to="/admin/inquiries" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              All Inquiries <ArrowUpRight size={14} />
            </Link>
          </div>

          {(!stats?.recentInquiries || stats.recentInquiries.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No inquiries submitted yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentInquiries.slice(0, 5).map((inq) => (
                <div
                  key={inq._id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {inq.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {inq.createdAt?.split('T')[0]}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
