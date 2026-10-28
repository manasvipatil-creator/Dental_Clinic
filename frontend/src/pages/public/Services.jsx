import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const Services = () => {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Services — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
    publicApi.getServices()
      .then(res => {
        const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.services || []);
        setServices(list);
      })
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false));
  }, [settings]);

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="teal-line" />
          <h1 className="section-title">Our Dental Services</h1>
          <p className="section-subtitle">Comprehensive dental treatments for the whole family.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} /> : services.length === 0 ? (
            <EmptyState title="No services yet" description="Services will appear here once added from the admin panel." />
          ) : (
            <div className="grid-3">
              {services.map(s => (
                <Link key={s._id} to={`/services/${s.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 200, background: 'var(--primary-light)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.image
                      ? <img src={s.image.startsWith('/uploads') ? `${UPLOADS_URL}${s.image}` : s.image} alt={s.imageAlt || s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <span style={{ fontSize: '3rem' }}>🦷</span>
                    }
                  </div>
                  <div className="card-body">
                    <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>{s.title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>{s.shortDescription}</p>
                    {s.price && <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>From {formatCurrency(s.price)}</p>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                      Learn More <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Services;
