import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  Star,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  Stethoscope,
  Smile,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { SkeletonCard, ErrorState } from '../../components/UI';
import Logo, { ToothSmileIcon } from '../../components/Logo';
import { WhatsAppIcon } from '../../components/FloatingWhatsApp';
import heroClinicImg from '../../assets/dental-clinic-hero.webp';
import aboutClinicImg from '../../assets/dental-care-about.jpg';
import { formatCurrency } from '../../utils/currency';
import './Home.css';

// SVG Icons matching the brand board 4 key benefits:
// 1. Tooth line icon (Modern Treatment)
// 2. Shield line icon (Safe & Sterile)
// 3. Heart line icon (Expert Care)
// 4. Smiley line icon (Long Lasting Results)

const BrandBenefitToothIcon = ({ size = 32, color = '#0EA5A0' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 12 C17 6, 23 7, 24 10 C25 7, 31 6, 34 12 C38 18, 37 26, 35 34 C33.5 39, 31 43, 27.5 43 C25 43, 24 40, 24 37 C24 40, 23 43, 20.5 43 C17 43, 14.5 39, 13 34 C11 26, 10 18, 14 12 Z" />
  </svg>
);

const BrandBenefitShieldIcon = ({ size = 32, color = '#0EA5A0' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 7 L37 12 C37 25, 31 36, 24 41 C17 36, 11 25, 11 12 Z" />
  </svg>
);

const BrandBenefitHeartIcon = ({ size = 32, color = '#0EA5A0' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 38 C24 38, 10 28, 10 18 C10 12, 14 8, 19 8 C22 8, 23.5 10, 24 11 C24.5 10, 26 8, 29 8 C34 8, 38 12, 38 18 C38 28, 24 38, 24 38 Z" />
  </svg>
);

const BrandBenefitSmileyIcon = ({ size = 32, color = '#0EA5A0' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="16" />
    <circle cx="18" cy="20" r="1.8" fill={color} />
    <circle cx="30" cy="20" r="1.8" fill={color} />
    <path d="M17 27 C19 32, 29 32, 31 27" />
  </svg>
);

// Service Card component with fallback icons
const ServiceCard = ({ service }) => {
  const getIconForTitle = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('clean') || t.includes('whiten')) return <Sparkles size={24} color="#0EA5A0" />;
    if (t.includes('root') || t.includes('canal') || t.includes('surgery')) return <Stethoscope size={24} color="#0EA5A0" />;
    if (t.includes('implant') || t.includes('ortho') || t.includes('brace')) return <ShieldCheck size={24} color="#0EA5A0" />;
    return <ToothSmileIcon size={26} toothColor="#0EA5A0" swoopColor="#7DD3C7" sparkleColor="#0EA5A0" />;
  };

  return (
    <Link to={`/services/${service.slug}`} className="service-card modern-card" id={`service-${service.slug}`}>
      <div className="service-card-img-wrapper">
        {service.image ? (
          <img
            src={service.image.startsWith('/uploads') ? `${UPLOADS_URL}${service.image}` : service.image}
            alt={service.imageAlt || service.title}
            loading="lazy"
            className="service-card-img"
          />
        ) : (
          <div className="service-card-placeholder-graphic">
            <div className="service-badge-icon">
              {getIconForTitle(service.title)}
            </div>
            <ToothSmileIcon size={56} toothColor="#7DD3C7" swoopColor="#0EA5A0" sparkleColor="#0EA5A0" />
          </div>
        )}
        <div className="service-card-category-tag">General &amp; Cosmetic</div>
      </div>

      <div className="service-card-content">
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-desc">
          {service.shortDescription || 'Gentle, modern dental treatment personalized for your comfort and long-term oral health.'}
        </p>
        <div className="service-card-footer">
          <span className="service-card-action">
            Learn More <ChevronRight size={16} />
          </span>
          {service.price && (
            <span className="service-card-price">{formatCurrency(service.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// Doctor Card
const DoctorCard = ({ doctor }) => (
  <div className="doctor-card modern-card" id={`doctor-${doctor._id}`}>
    <div className="doctor-card-photo-wrap">
      {doctor.image ? (
        <img
          src={doctor.image.startsWith('/uploads') ? `${UPLOADS_URL}${doctor.image}` : doctor.image}
          alt={doctor.imageAlt || doctor.name}
          loading="lazy"
          className="doctor-photo"
        />
      ) : (
        <div className="doctor-avatar-placeholder">
          <div className="doctor-avatar-circle">
            <Stethoscope size={42} color="#0EA5A0" />
          </div>
        </div>
      )}
      <div className="doctor-status-badge">Available</div>
    </div>
    <div className="doctor-card-details">
      <h3 className="doctor-name">{doctor.name}</h3>
      <p className="doctor-specialization">{doctor.specialization}</p>
      {doctor.qualifications && (
        <p className="doctor-qualifications">{doctor.qualifications}</p>
      )}
      {doctor.experience && (
        <span className="doctor-exp-pill">{doctor.experience}+ Years Clinical Experience</span>
      )}
      {doctor.consultationFee && (
        <span style={{ display: 'inline-block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: '6px' }}>
          Consultation: {formatCurrency(doctor.consultationFee)}
        </span>
      )}
    </div>
  </div>
);

// Testimonial Card
const TestimonialCard = ({ testimonial }) => (
  <div className="testimonial-modern-card" id={`testimonial-${testimonial._id}`}>
    <div className="testimonial-rating-row">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < (testimonial.rating || 5) ? '#0EA5A0' : 'none'}
          color={i < (testimonial.rating || 5) ? '#0EA5A0' : '#CBD5E1'}
        />
      ))}
      <span className="verified-patient-tag">
        <Check size={12} /> Verified Patient
      </span>
    </div>
    <p className="testimonial-quote">"{testimonial.content}"</p>
    <div className="testimonial-author">
      <div className="testimonial-author-avatar">
        {(testimonial.displayName || 'P').charAt(0)}
      </div>
      <div>
        <div className="testimonial-author-name">{testimonial.displayName || 'Valued Patient'}</div>
        <div className="testimonial-author-sub">Dental Care Patient</div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => {
    document.title = `${settings?.clinicName || 'SmileCraft Dental Clinic'} — Healthy Smiles Brighter Lives`;
  }, [settings]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [svcRes, drRes, testRes, gallRes] = await Promise.allSettled([
          publicApi.getServices(),
          publicApi.getDoctors(),
          publicApi.getTestimonials(),
          publicApi.getGallery(),
        ]);

        if (svcRes.status === 'fulfilled') {
          const list = Array.isArray(svcRes.value.data.data)
            ? svcRes.value.data.data
            : (svcRes.value.data.data?.services || []);
          // Only show published services
          const published = list.filter(s => s.published !== false);
          setServices(published.slice(0, 6));
        }

        if (drRes.status === 'fulfilled') {
          const list = Array.isArray(drRes.value.data.data)
            ? drRes.value.data.data
            : (drRes.value.data.data?.doctors || []);
          // Show active doctors
          const active = list.filter(d => d.isActive !== false);
          setDoctors(active.slice(0, 4));
        }

        if (testRes.status === 'fulfilled') {
          const list = Array.isArray(testRes.value.data.data)
            ? testRes.value.data.data
            : (testRes.value.data.data?.items || []);
          setTestimonials(list.slice(0, 3));
        }

        if (gallRes.status === 'fulfilled') {
          const list = Array.isArray(gallRes.value.data.data)
            ? gallRes.value.data.data
            : (gallRes.value.data.data?.items || []);
          const publishedGallery = list.filter(g => g.published !== false);
          setGallery(publishedGallery.slice(0, 6));
        }
      } catch (err) {
        setError('Failed to load clinic information.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!contactForm.name.trim()) {
      errors.name = 'Full name is required';
    } else if (contactForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!contactForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (contactForm.phone.trim() && contactForm.phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!contactForm.message.trim()) {
      errors.message = 'Please enter your message';
    } else if (contactForm.message.trim().length < 5) {
      errors.message = 'Message must be at least 5 characters';
    }

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await publicApi.submitContact({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
        subject: 'Inquiry from SmileCraft Home Page',
        message: contactForm.message.trim(),
      });
      setFormSuccess(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to send message. Please call our clinic directly.');
    } finally {
      setFormLoading(false);
    }
  };

  if (error && !loading) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="home-page-container">
      {/* ─────────────────────────────────────────────────────────────
          SECTION B: HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="hero-modern-section" aria-label="Welcome to SmileCraft Dental Clinic">
        <div className="hero-gradient-overlay" aria-hidden="true" />
        <div className="container hero-grid-wrapper">
          {/* Left Column: Brand Badges, Headline, Description, CTAs, Trust Points */}
          <div className="hero-text-content">
            <div className="hero-badge-pill" id="hero-badge">
              <span className="hero-badge-dot" />
              <span>Your Trusted Dental Care Partner</span>
            </div>

            <h1 className="hero-main-heading">
              Healthy Smiles <br />
              <span className="hero-accent-text">Start Here</span>
            </h1>

            <p className="hero-subtext">
              Welcome to <strong>SmileCraft Dental Clinic</strong>. We combine modern gentle dentistry,
              state-of-the-art dental technology, and personalized care to bring brighter, healthier smiles
              to every member of your family.
            </p>

            <div className="hero-cta-group">
              <Link to="/book-appointment" className="btn btn-primary btn-lg hero-cta-btn" id="hero-book-btn">
                <Calendar size={20} />
                <span>Book Appointment</span>
              </Link>
              <Link to="/services" className="btn btn-outline btn-lg hero-cta-outline" id="hero-explore-btn">
                <span>Explore Our Services</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust Indicators (no unsupported clinic stats) */}
            <div className="hero-trust-indicators">
              <div className="trust-indicator-item">
                <div className="trust-icon-wrap">
                  <CheckCircle2 size={18} color="#0EA5A0" />
                </div>
                <span>Experienced Dental Specialists</span>
              </div>
              <div className="trust-indicator-item">
                <div className="trust-icon-wrap">
                  <CheckCircle2 size={18} color="#0EA5A0" />
                </div>
                <span>Personalized Patient Care</span>
              </div>
              <div className="trust-indicator-item">
                <div className="trust-icon-wrap">
                  <CheckCircle2 size={18} color="#0EA5A0" />
                </div>
                <span>Modern, Sterile Treatment Rooms</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Realistic Dental Photograph */}
          <div className="hero-visual-content">
            <div className="hero-photo-frame">
              <img
                src={heroClinicImg}
                alt="Modern SmileCraft dental clinic treatment room and dentist consulting a patient"
                className="hero-main-photo"
                loading="eager"
              />
              <div className="hero-photo-soft-mint-decor" aria-hidden="true" />

              {/* Floating Trust Cards */}
              <div className="hero-floating-badge badge-top-right">
                <div className="floating-badge-icon">
                  <ToothSmileIcon size={26} toothColor="#0EA5A0" swoopColor="#7DD3C7" sparkleColor="#0EA5A0" />
                </div>
                <div className="floating-badge-text">
                  <strong>Gentle Dentistry</strong>
                  <span>Comfort-first patient care</span>
                </div>
              </div>

              <div className="hero-floating-badge badge-bottom-left">
                <div className="floating-badge-icon badge-icon-shield">
                  <ShieldCheck size={24} color="#0EA5A0" />
                </div>
                <div className="floating-badge-text">
                  <strong>100% Sterile &amp; Safe</strong>
                  <span>Hospital-grade sterilization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: TRUST / BENEFITS STRIP (Matches Brand Board 4 Benefits)
      ───────────────────────────────────────────────────────────── */}
      <section className="brand-benefits-strip" aria-label="SmileCraft Core Benefits">
        <div className="container">
          <div className="brand-benefits-grid">
            <div className="benefit-strip-item">
              <div className="benefit-strip-icon-box">
                <BrandBenefitToothIcon size={34} color="#0EA5A0" />
              </div>
              <div className="benefit-strip-info">
                <h4 className="benefit-strip-title">Modern Treatment</h4>
                <p className="benefit-strip-desc">Advanced dental tools for pain-free precision</p>
              </div>
            </div>

            <div className="benefit-strip-item">
              <div className="benefit-strip-icon-box">
                <BrandBenefitShieldIcon size={34} color="#0EA5A0" />
              </div>
              <div className="benefit-strip-info">
                <h4 className="benefit-strip-title">Safe &amp; Sterile</h4>
                <p className="benefit-strip-desc">Rigorous hygiene &amp; multi-stage sterilization</p>
              </div>
            </div>

            <div className="benefit-strip-item">
              <div className="benefit-strip-icon-box">
                <BrandBenefitHeartIcon size={34} color="#0EA5A0" />
              </div>
              <div className="benefit-strip-info">
                <h4 className="benefit-strip-title">Expert Care</h4>
                <p className="benefit-strip-desc">Dedicated specialists focused on your comfort</p>
              </div>
            </div>

            <div className="benefit-strip-item">
              <div className="benefit-strip-icon-box">
                <BrandBenefitSmileyIcon size={34} color="#0EA5A0" />
              </div>
              <div className="benefit-strip-info">
                <h4 className="benefit-strip-title">Long Lasting Results</h4>
                <p className="benefit-strip-desc">Durable solutions for your healthiest smile</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: ABOUT SECTION ("More Than Just a Smile")
      ───────────────────────────────────────────────────────────── */}
      <section className="section about-preview-section" id="about-preview">
        <div className="container">
          <div className="about-preview-grid">
            <div className="about-visual-column">
              <div className="about-image-wrapper">
                <img
                  src={aboutClinicImg}
                  alt="SmileCraft dental specialist examining patient dental care"
                  className="about-preview-img"
                  loading="lazy"
                />
                <div className="about-mint-accent-box" aria-hidden="true" />
                <div className="about-floating-experience-tag">
                  <div className="about-tag-logo">
                    <ToothSmileIcon size={28} toothColor="#FFFFFF" swoopColor="#7DD3C7" sparkleColor="#7DD3C7" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>SmileCraft Care</strong>
                    <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Patient-First Philosophy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-text-column">
              <span className="section-overhead-badge">About SmileCraft</span>
              <h2 className="section-main-heading">More Than Just a Smile</h2>
              <p className="section-lead-paragraph">
                Your Trusted Partner in Complete Dental Care.
              </p>
              <p className="about-body-text">
                At <strong>SmileCraft Dental Clinic</strong>, we believe every patient deserves a positive,
                stress-free dental experience. Whether you visit us for a preventive dental check-up,
                cosmetic smile enhancement, or advanced restorative treatment, our dedicated dental
                practitioners prioritize your individual comfort, safety, and oral wellness.
              </p>
              <div className="about-checklist">
                <div className="about-check-item">
                  <div className="check-bullet"><Check size={16} /></div>
                  <div>
                    <strong>Comprehensive Dental Consultation</strong>
                    <p>Transparent treatment options customized to your goals.</p>
                  </div>
                </div>
                <div className="about-check-item">
                  <div className="check-bullet"><Check size={16} /></div>
                  <div>
                    <strong>Gentle, Anxiety-Free Dentistry</strong>
                    <p>Caring techniques designed to keep anxious patients at ease.</p>
                  </div>
                </div>
                <div className="about-check-item">
                  <div className="check-bullet"><Check size={16} /></div>
                  <div>
                    <strong>Modern Facility &amp; Diagnostics</strong>
                    <p>Clean, welcoming clinic environment equipped for accurate care.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-8)' }}>
                <Link to="/about" className="btn btn-primary" id="about-learn-more-btn">
                  <span>Learn More About Our Clinic</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION E: FEATURED DENTAL SERVICES
      ───────────────────────────────────────────────────────────── */}
      <section className="section services-modern-section" id="services">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-overhead-badge">Dental Treatments</span>
            <h2 className="section-main-heading">Comprehensive Dental Care</h2>
            <p className="section-header-description">
              From preventative cleanings to restorative procedures, we provide comprehensive
              oral healthcare tailored for children, teens, and adults.
            </p>
          </div>

          {loading ? (
            <div className="grid-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="services-empty-state">
              <ToothSmileIcon size={48} toothColor="#94A3B8" swoopColor="#CBD5E1" sparkleColor="#94A3B8" />
              <h3>Services updating</h3>
              <p>Our treatment catalog is currently being updated. Please check back shortly or call us.</p>
              <Link to="/contact" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                Contact Clinic
              </Link>
            </div>
          ) : (
            <div className="services-cards-grid">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}

          <div className="services-cta-bottom">
            <Link to="/services" className="btn btn-outline btn-lg" id="view-all-services-btn">
              <span>View All Services</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION F: OUR DENTAL TEAM
      ───────────────────────────────────────────────────────────── */}
      {doctors.length > 0 && (
        <section className="section doctors-modern-section" id="doctors">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-overhead-badge">Clinical Specialists</span>
              <h2 className="section-main-heading">Meet Our Dental Specialists</h2>
              <p className="section-header-description">
                Experienced dental practitioners committed to gentle, personalized dental excellence.
              </p>
            </div>

            <div className="doctors-cards-grid">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>

            <div className="doctors-cta-bottom">
              <Link to="/doctors" className="btn btn-outline" id="view-all-doctors-btn">
                <span>View All Doctors</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION G: WHY CHOOSE US
      ───────────────────────────────────────────────────────────── */}
      <section className="section why-choose-modern-section" id="why-choose-us">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-overhead-badge">The SmileCraft Advantage</span>
            <h2 className="section-main-heading">Why Choose Us</h2>
            <p className="section-header-description">
              Dedicated to delivering an exceptional dental experience through modern clinical
              practices and compassionate patient relationships.
            </p>
          </div>

          <div className="why-choose-four-grid">
            <div className="why-feature-card">
              <div className="why-feature-icon-wrapper">
                <HeartHandshake size={28} color="#0EA5A0" />
              </div>
              <h3 className="why-feature-title">Patient-Focused Care</h3>
              <p className="why-feature-desc">
                Your comfort and peace of mind guide every treatment plan. We listen closely to your concerns and answer all questions thoroughly.
              </p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-wrapper">
                <Stethoscope size={28} color="#0EA5A0" />
              </div>
              <h3 className="why-feature-title">Modern Equipment</h3>
              <p className="why-feature-desc">
                Our clinic utilizes modern digital diagnostic and dental equipment for accurate assessments and gentle, conservative procedures.
              </p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-wrapper">
                <Smile size={28} color="#0EA5A0" />
              </div>
              <h3 className="why-feature-title">Comfortable Environment</h3>
              <p className="why-feature-desc">
                From our relaxing reception area to ergonomic treatment suites, we have crafted an atmosphere designed to put nervous patients at ease.
              </p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon-wrapper">
                <ToothSmileIcon size={30} toothColor="#0EA5A0" swoopColor="#7DD3C7" sparkleColor="#0EA5A0" />
              </div>
              <h3 className="why-feature-title">Personalized Treatment</h3>
              <p className="why-feature-desc">
                No cookie-cutter dental care. Each recommendation is tailored specifically to your unique dental health requirements and goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION H: GALLERY PREVIEW ("Inside SmileCraft")
      ───────────────────────────────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="section gallery-preview-section" id="gallery-preview">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-overhead-badge">Clinic Environment</span>
              <h2 className="section-main-heading">Inside SmileCraft</h2>
              <p className="section-header-description">
                Take a look inside our clean, modern, patient-first dental clinic and sterilization facilities.
              </p>
            </div>

            <div className="gallery-preview-grid">
              {gallery.map((item) => (
                <div key={item._id} className="gallery-preview-item">
                  <img
                    src={item.imageUrl.startsWith('/uploads') ? `${UPLOADS_URL}${item.imageUrl}` : item.imageUrl}
                    alt={item.alt || item.title || 'SmileCraft clinic facility'}
                    className="gallery-preview-img"
                    loading="lazy"
                  />
                  {item.title && (
                    <div className="gallery-preview-overlay">
                      <span className="gallery-preview-label">{item.title}</span>
                      {item.category && <span className="gallery-preview-cat">{item.category}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
              <Link to="/gallery" className="btn btn-outline" id="view-gallery-btn">
                <span>View Full Gallery</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION I: APPOINTMENT CTA (Deep Slate Background with Teal Accents)
      ───────────────────────────────────────────────────────────── */}
      <section className="appointment-cta-slate-section" id="appointment-cta">
        <div className="container">
          <div className="appointment-cta-inner">
            <div className="cta-left-content">
              <span className="cta-overhead-badge">Online Appointments</span>
              <h2 className="cta-headline">Ready for a Brighter, Healthier Smile?</h2>
              <p className="cta-submessage">
                Schedule your consultation with our compassionate dental specialists today.
                Fast online booking, flexible time slots, and personalized dental care.
              </p>
            </div>

            <div className="cta-actions-group">
              <Link to="/book-appointment" className="btn btn-primary btn-lg cta-booking-btn" id="cta-book-appointment-btn">
                <Calendar size={20} />
                <span>Book Appointment</span>
              </Link>
              <a
                href={`https://wa.me/${(settings?.whatsappNumber || settings?.phone || '9175514916').replace(/\D/g, '')}?text=${encodeURIComponent('Hello SmileCraft Dental Clinic, I would like to book a dental consultation.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg"
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  borderColor: '#25D366',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <WhatsAppIcon size={20} color="#ffffff" />
                <span>WhatsApp</span>
              </a>
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="btn btn-outline-white btn-lg cta-call-btn">
                  <Phone size={20} />
                  <span>Call {settings.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION J: TESTIMONIALS (From Backend)
      ───────────────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="section testimonials-modern-section" id="testimonials">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-overhead-badge">Patient Experiences</span>
              <h2 className="section-main-heading">What Our Patients Say</h2>
              <p className="section-header-description">
                Real feedback from patients who have trusted SmileCraft with their smiles.
              </p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION K: CONTACT SECTION (Real settings & working form)
      ───────────────────────────────────────────────────────────── */}
      <section className="section contact-home-section" id="contact-section">
        <div className="container">
          <div className="contact-home-grid">
            {/* Left: Contact Info from DB Settings */}
            <div className="contact-home-info">
              <span className="section-overhead-badge">Visit or Reach Out</span>
              <h2 className="section-main-heading">We’re Here for Your Dental Health</h2>
              <p className="contact-home-desc">
                Have questions regarding dental treatments, appointment availability, or insurance?
                Reach out to our welcoming front desk team.
              </p>

              <div className="contact-info-cards-list">
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} className="contact-info-card">
                    <div className="contact-info-icon-box">
                      <Phone size={20} color="#0EA5A0" />
                    </div>
                    <div>
                      <span className="contact-card-label">Direct Phone Line</span>
                      <strong className="contact-card-val">{settings.phone}</strong>
                    </div>
                  </a>
                )}

                {settings?.email && (
                  <a href={`mailto:${settings.email}`} className="contact-info-card">
                    <div className="contact-info-icon-box">
                      <MailIcon size={20} color="#0EA5A0" />
                    </div>
                    <div>
                      <span className="contact-card-label">Email Inquiries</span>
                      <strong className="contact-card-val">{settings.email}</strong>
                    </div>
                  </a>
                )}

                {settings?.address && (
                  <div className="contact-info-card">
                    <div className="contact-info-icon-box">
                      <MapPin size={20} color="#0EA5A0" />
                    </div>
                    <div>
                      <span className="contact-card-label">Clinic Location</span>
                      <strong className="contact-card-val">
                        {settings.address}
                        {settings.city ? `, ${settings.city}` : ''}
                        {settings.state ? `, ${settings.state}` : ''}
                        {settings.pincode ? ` ${settings.pincode}` : ''}
                      </strong>
                    </div>
                  </div>
                )}

                {settings?.workingHours?.length > 0 && (
                  <div className="contact-info-card">
                    <div className="contact-info-icon-box">
                      <Clock size={20} color="#0EA5A0" />
                    </div>
                    <div>
                      <span className="contact-card-label">Clinic Operating Hours</span>
                      <strong className="contact-card-val">
                        Mon–Fri: {settings.workingHours.find(h => h.day === 'Monday')?.open || '09:00'} – {settings.workingHours.find(h => h.day === 'Monday')?.close || '18:00'}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Saturday: {settings.workingHours.find(h => h.day === 'Saturday')?.open || '09:00'} – {settings.workingHours.find(h => h.day === 'Saturday')?.close || '14:00'} (Sunday Closed)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Interactive Contact Form connected to publicApi.submitContact */}
            <div className="contact-home-form-wrap">
              <div className="contact-form-card">
                <h3 className="contact-form-heading">Send Us a Quick Message</h3>
                <p className="contact-form-sub">Our patient coordinator will contact you promptly.</p>

                {formSuccess ? (
                  <div className="contact-success-state">
                    <CheckCircle2 size={44} color="#0EA5A0" />
                    <h4>Thank You for Contacting Us</h4>
                    <p>We have received your message and will get back to you shortly.</p>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setFormSuccess(false)}
                      style={{ marginTop: '1rem' }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="contact-form-body">
                    {formError && (
                      <div className="contact-error-alert">
                        <AlertCircle size={18} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="form-group-custom">
                      <label htmlFor="home-contact-name" className="custom-label">Full Name *</label>
                      <input
                        id="home-contact-name"
                        type="text"
                        className={`custom-input ${contactErrors.name ? 'error' : ''}`}
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => {
                          setContactForm({ ...contactForm, name: e.target.value });
                          if (contactErrors.name) setContactErrors({ ...contactErrors, name: '' });
                        }}
                      />
                      {contactErrors.name && <span className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{contactErrors.name}</span>}
                    </div>

                    <div className="form-row-two-col">
                      <div className="form-group-custom">
                        <label htmlFor="home-contact-email" className="custom-label">Email Address *</label>
                        <input
                          id="home-contact-email"
                          type="email"
                          className={`custom-input ${contactErrors.email ? 'error' : ''}`}
                          placeholder="john@example.com"
                          value={contactForm.email}
                          onChange={(e) => {
                            setContactForm({ ...contactForm, email: e.target.value });
                            if (contactErrors.email) setContactErrors({ ...contactErrors, email: '' });
                          }}
                        />
                        {contactErrors.email && <span className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{contactErrors.email}</span>}
                      </div>
                      <div className="form-group-custom">
                        <label htmlFor="home-contact-phone" className="custom-label">Phone Number</label>
                        <input
                          id="home-contact-phone"
                          type="tel"
                          className={`custom-input ${contactErrors.phone ? 'error' : ''}`}
                          placeholder="+91 98765 43210"
                          value={contactForm.phone}
                          onChange={(e) => {
                            setContactForm({ ...contactForm, phone: e.target.value });
                            if (contactErrors.phone) setContactErrors({ ...contactErrors, phone: '' });
                          }}
                        />
                        {contactErrors.phone && <span className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{contactErrors.phone}</span>}
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label htmlFor="home-contact-msg" className="custom-label">How can we assist you? *</label>
                      <textarea
                        id="home-contact-msg"
                        rows={3}
                        className={`custom-textarea ${contactErrors.message ? 'error' : ''}`}
                        placeholder="Tell us about your dental concern or appointment inquiry..."
                        value={contactForm.message}
                        onChange={(e) => {
                          setContactForm({ ...contactForm, message: e.target.value });
                          if (contactErrors.message) setContactErrors({ ...contactErrors, message: '' });
                        }}
                      />
                      {contactErrors.message && <span className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{contactErrors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="btn btn-primary btn-lg contact-submit-btn"
                      id="home-submit-contact-btn"
                    >
                      <Send size={18} />
                      <span>{formLoading ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MailIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default Home;
