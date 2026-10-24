import { useState, useEffect } from 'react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, ErrorState } from '../../components/UI';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import defaultAboutImg from '../../assets/dental-care-about.jpg';
import { ToothSmileIcon } from '../../components/Logo';

const About = () => {
  const { settings } = useSettings();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `About Us — ${settings?.clinicName || 'SmileCraft Dental Clinic'}`;
    publicApi.getContent('about-overview')
      .then(res => setContent(res.data.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [settings]);

  const displayImage = content?.image
    ? (content.image.startsWith('/uploads') ? `${UPLOADS_URL}${content.image}` : content.image)
    : defaultAboutImg;

  return (
    <div>
      {/* Page Header */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdfc 0%, #f8fafc 100%)', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="teal-line" />
          <h1 className="section-title">About Us</h1>
          <p className="section-subtitle">Learn about our clinic, our mission, and the team dedicated to your smile.</p>
        </div>
      </section>

      {loading ? <LoadingSpinner /> : (
        <section className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)', alignItems: 'center' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: 'var(--space-3)' }}>
                  Our Story &amp; Philosophy
                </span>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-4)', color: 'var(--secondary)' }}>
                  {content?.title || `About ${settings?.clinicName || 'SmileCraft Dental Clinic'}`}
                </h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {content?.body ? (
                    <p style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>{content.body}</p>
                  ) : (
                    <>
                      <p style={{ marginBottom: 'var(--space-4)' }}>
                        At <strong>SmileCraft Dental Clinic</strong>, we believe every patient deserves a healthy, radiant smile created with comfort and clinical precision.
                      </p>
                      <p style={{ marginBottom: 'var(--space-4)' }}>
                        Established with a vision to revolutionize modern dentistry, our clinic combines cutting-edge dental technology with an empathetic patient-first philosophy.
                      </p>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="#0EA5A0" />
                    <span>State-of-the-art dental technology &amp; gentle diagnostics</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="#0EA5A0" />
                    <span>Strict sterilization protocols and hospital-grade hygiene</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="#0EA5A0" />
                    <span>Personalized, anxiety-free dental care for all age groups</span>
                  </div>
                </div>

                <Link to="/book-appointment" className="btn btn-primary btn-lg">
                  Book Appointment <ArrowRight size={18} />
                </Link>
              </div>

              {/* Right Side Image Frame */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '4px solid #ffffff',
                  height: '420px',
                  background: 'linear-gradient(135deg, var(--primary-light), #e0f7f6)',
                }}>
                  <img
                    src={displayImage}
                    alt={content?.imageAlt || "SmileCraft Dental Clinic treatment care"}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="eager"
                  />
                </div>

                {/* Decorative Mint Accent Corner */}
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '-14px',
                  width: '100%',
                  height: '100%',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, rgba(125, 211, 199, 0.4) 0%, rgba(14, 165, 160, 0.2) 100%)',
                  zIndex: -1,
                  pointerEvents: 'none',
                }} />

                {/* Floating Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '20px',
                  background: 'var(--secondary)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 2,
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ToothSmileIcon size={24} toothColor="#ffffff" swoopColor="#7DD3C7" sparkleColor="#7DD3C7" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', lineHeight: 1.2 }}>SmileCraft Clinic</strong>
                    <span style={{ fontSize: '0.75rem', color: '#7DD3C7' }}>Precision &amp; Comfort</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission / Vision */}
            <div className="grid-3" style={{ marginTop: 'var(--space-16)' }}>
              {[
                { icon: '🎯', title: 'Our Mission', body: 'To provide accessible, high-quality dental care that improves oral health and enhances quality of life for every patient. [Configure in admin panel]' },
                { icon: '👁️', title: 'Our Vision', body: 'To be the most trusted dental clinic, known for exceptional care, innovation, and patient satisfaction. [Configure in admin panel]' },
                { icon: '💎', title: 'Our Values', body: 'Integrity, compassion, excellence, and continuous improvement guide everything we do. [Configure in admin panel]' },
              ].map((item) => (
                <div key={item.title} className="card card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{item.icon}</div>
                  <h3 style={{ marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
