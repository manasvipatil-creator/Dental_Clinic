import { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Testimonials — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
    publicApi.getTestimonials()
      .then(res => {
        const list = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.items || []);
        setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [settings]);

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="teal-line" />
          <h1 className="section-title">Patient Testimonials</h1>
          <p className="section-subtitle">What our patients say about their experience. All testimonials are approved demo data — replace before going live.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? <LoadingSpinner /> : items.length === 0 ? (
            <EmptyState title="No testimonials yet" description="Approved testimonials will appear here." />
          ) : (
            <div className="grid-3">
              {items.map(t => (
                <div key={t._id} className="card card-body">
                  <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-3)' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (t.rating || 5) ? '#0EA5A0' : 'none'} color={i < (t.rating || 5) ? '#0EA5A0' : '#CBD5E1'} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>"{t.content}"</p>
                  <p style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: 'var(--font-size-sm)' }}>— {t.displayName || 'Patient'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
