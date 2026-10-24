import { useState, useEffect } from 'react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';

const Gallery = () => {
  const { settings } = useSettings();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = `Gallery — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
    publicApi.getGallery()
      .then(res => {
        const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || []);
        setImages(list);
      })
      .catch(() => setError('Failed to load gallery'))
      .finally(() => setLoading(false));
  }, [settings]);

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="teal-line" />
          <h1 className="section-title">Our Gallery</h1>
          <p className="section-subtitle">A look at our clinic, facilities, and equipment.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <LoadingSpinner /> : error ? <ErrorState message={error} /> : images.length === 0 ? (
            <EmptyState title="Gallery coming soon" description="Images will appear here once uploaded from the admin panel." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {images.map(img => (
                <div
                  key={img._id}
                  style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', height: 220, background: 'var(--primary-light)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', position: 'relative' }}
                  onClick={() => setSelected(img)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelected(img)}
                  aria-label={img.alt || img.title || 'Gallery image'}
                >
                  <img
                    src={img.imageUrl.startsWith('/uploads') ? `${UPLOADS_URL}${img.imageUrl}` : img.imageUrl}
                    alt={img.alt || img.title || 'Gallery image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    loading="lazy"
                  />
                  {img.title && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-3)', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)} style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img
              src={selected.imageUrl.startsWith('/uploads') ? `${UPLOADS_URL}${selected.imageUrl}` : selected.imageUrl}
              alt={selected.alt || selected.title}
              style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
            />
            {selected.title && <p style={{ color: 'white', textAlign: 'center', marginTop: 'var(--space-3)', fontSize: 'var(--font-size-lg)' }}>{selected.title}</p>}
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
