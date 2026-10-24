import { useState, useEffect } from 'react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';

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
          <h1 className="section-title">Our Dental Team</h1>
          <p className="section-subtitle">Meet the experienced professionals dedicated to your oral health.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} /> : doctors.length === 0 ? (
            <EmptyState title="No doctors listed" description="Doctor profiles will appear here once added from the admin panel." />
          ) : (
            <div className="grid-3">
              {doctors.map(d => (
                <div key={d._id} className="card">
                  <div style={{ height: 260, background: 'var(--primary-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {d.image
                      ? <img src={d.image.startsWith('/uploads') ? `${UPLOADS_URL}${d.image}` : d.image} alt={d.imageAlt || d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <span style={{ fontSize: '4rem' }}>👨‍⚕️</span>
                    }
                  </div>
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 4 }}>{d.name}</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>{d.specialization}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>{d.qualifications}</p>
                    {d.experience && <span className="badge badge-primary">{d.experience} Experience</span>}
                    {d.biography && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)', lineHeight: 1.6 }}>
                        {d.biography.length > 150 ? d.biography.slice(0, 150) + '...' : d.biography}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors;
