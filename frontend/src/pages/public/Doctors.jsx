import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Stethoscope } from 'lucide-react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';

const Doctors = () => {
  const { settings } = useSettings();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Our Doctors — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
    publicApi.getDoctors()
      .then(res => {
        const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.doctors || []);
        setDoctors(list);
      })
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, [settings]);

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="teal-line" />
          <h1 className="section-title">Our Dental Specialists</h1>
          <p className="section-subtitle">Meet our team of board-certified dentists and surgeons committed to delivering exceptional patient care.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <LoadingSpinner text="Loading doctors..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : doctors.length === 0 ? (
            <EmptyState title="No doctors listed" description="Doctor profiles will appear here once added from the admin panel." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {doctors.map(d => {
                const imageSrc = d.image
                  ? (d.image.startsWith('/uploads') ? `${UPLOADS_URL}${d.image}` : d.image)
                  : '';
                const cleanName = d.name.replace(/^Dr\.\s*/i, '');

                return (
                  <div key={d._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 280, background: 'var(--primary-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={d.imageAlt || `Dr. ${cleanName}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span style="font-size: 4rem;">👨‍⚕️</span>';
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)' }}>
                          <Stethoscope size={56} />
                        </div>
                      )}
                      <span className="badge badge-success" style={{ position: 'absolute', top: 12, right: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        Available
                      </span>
                    </div>

                    <div className="card-body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 4, color: 'var(--secondary)' }}>
                        Dr. {cleanName}
                      </h2>
                      <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                        {d.specialization}
                      </p>
                      {d.qualifications && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                          {d.qualifications}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '0.25rem 0' }}>
                        {d.experience && (
                          <span className="badge badge-primary">
                            {d.experience} Years Experience
                          </span>
                        )}
                        {d.consultationFee && (
                          <span className="badge badge-neutral" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                            Fee: {formatCurrency(d.consultationFee)}
                          </span>
                        )}
                      </div>

                      {d.biography && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)', lineHeight: 1.6, flex: 1 }}>
                          {d.biography.length > 140 ? d.biography.slice(0, 140) + '...' : d.biography}
                        </p>
                      )}

                      <Link
                        to={`/book-appointment?doctor=${d._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: 'var(--space-5)', width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Calendar size={16} /> Book with Dr. {cleanName.split(' ')[0]}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors;
