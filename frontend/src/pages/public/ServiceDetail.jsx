import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';
import { Calendar, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const ServiceDetail = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    publicApi.getServiceBySlug(slug)
      .then(res => {
        setService(res.data.data);
        document.title = `${res.data.data.seoTitle || res.data.data.title} — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
      })
      .catch(() => setError('Service not found'))
      .finally(() => setLoading(false));
  }, [slug, settings]);

  if (loading) return <LoadingSpinner />;
  if (error || !service) return (
    <div className="section">
      <div className="container">
        <ErrorState message={error || 'Service not found'} />
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <Link to="/services" className="btn btn-outline"><ArrowLeft size={16} /> Back to Services</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '40px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', wordBreak: 'break-word' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            {' / '}
            <Link to="/services" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Services</Link>
            {' / '}
            <span>{service.title}</span>
          </nav>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>{service.title}</h1>
          {service.shortDescription && <p className="section-subtitle">{service.shortDescription}</p>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-12)' }}>
        <div className="container">
          <div className="service-detail-layout">
            {/* Main Content */}
            <div className="service-detail-main">
              {service.image && (
                <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-8)', height: 'clamp(200px, 45vw, 320px)' }}>
                  <img
                    src={service.image.startsWith('/uploads') ? `${UPLOADS_URL}${service.image}` : service.image}
                    alt={service.imageAlt || service.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              {service.fullDescription && (
                <div>
                  <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: 'var(--space-4)' }}>About This Treatment</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{service.fullDescription}</p>
                </div>
              )}
              {service.treatmentDetails && (
                <div style={{ marginTop: 'var(--space-8)' }}>
                  <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: 'var(--space-4)' }}>Treatment Details</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{service.treatmentDetails}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="service-detail-sidebar">
              <div className="card card-body" style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Ready to Get Started?</h3>
                {service.price && (
                  <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-4)' }}>
                    From {formatCurrency(service.price)}
                  </p>
                )}
                <Link to="/book-appointment" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Calendar size={18} /> Book Appointment
                </Link>
              </div>
              <Link to="/services" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={16} /> All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .service-detail-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-10);
          align-items: start;
        }
        .service-detail-sidebar {
          position: sticky;
          top: calc(var(--navbar-height) + 24px);
        }
        @media (max-width: 768px) {
          .service-detail-layout {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }
          .service-detail-sidebar {
            position: static;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetail;
