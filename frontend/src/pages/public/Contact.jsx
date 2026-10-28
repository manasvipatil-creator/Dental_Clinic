import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { publicApi } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [mapBlocked, setMapBlocked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Your full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (formData.phone.trim() && formData.phone.trim().length < 7) {
      errors.phone = 'Please provide a valid phone number';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message content is required';
    } else if (formData.message.trim().length < 8) {
      errors.message = 'Message should be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await publicApi.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again or call us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page" style={{ paddingTop: 'calc(var(--navbar-height) + 2rem)', paddingBottom: '4rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 3rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', marginBottom: '1rem' }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Have a question about our treatments, booking, or dental health? Reach out to our compassionate care team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Contact Information & Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Clinic Address</strong>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      {settings?.address || '123 Smile Boulevard, Suite 400, Dental Care Plaza'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Phone Number</strong>
                    <a href={`tel:${settings?.phone || '+1-234-567-8900'}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      {settings?.phone || '+1 (234) 567-8900'}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Email Address</strong>
                    <a href={`mailto:${settings?.email || 'contact@smilecraft.demo'}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                      {settings?.email || 'contact@smilecraft.demo'}
                    </a>
                  </div>
                </div>

                {/* WhatsApp Action */}
                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <a
                    href={`https://wa.me/${(settings?.whatsappNumber || settings?.phone || '+12345678900').replace(/[^0-9]/g, '')}?text=Hello%20SmileCraft%20Dental%20Clinic,%20I%20would%20like%20to%20inquire%20about%20dental%20treatments`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      fontWeight: 600,
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.158.571 4.183 1.571 5.928l-1.571 5.9 6.079-1.595c1.691.923 3.633 1.442 5.698 1.442 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Clock size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Working Hours
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {settings?.workingHours && Array.isArray(settings.workingHours) ? (
                  settings.workingHours.map((h) => (
                    <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.92rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{h.day}</span>
                      <span style={{ fontWeight: 600, color: h.closed ? 'var(--danger, #ef4444)' : 'var(--text-main)' }}>
                        {h.closed ? 'Closed (Emergency on Call)' : `${h.open} – ${h.close}`}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Monday – Friday</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>9:00 AM – 6:00 PM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Saturday</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>9:00 AM – 2:00 PM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sunday</span>
                      <span style={{ fontWeight: 600, color: 'var(--danger, #ef4444)' }}>Closed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Send an Inquiry
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Fill in the form below and our staff will respond within 24 business hours.
            </p>

            {submitted ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Message Sent Successfully!
                </h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Thank you for reaching out. We will get back to you promptly.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.9rem' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Ravi Sharma"
                  />
                  {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-control ${fieldErrors.email ? 'error' : ''}`}
                      placeholder="ravi@example.com"
                    />
                    {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`form-control ${fieldErrors.phone ? 'error' : ''}`}
                      placeholder="+91 98765 43210"
                    />
                    {fieldErrors.phone && <div className="form-error">{fieldErrors.phone}</div>}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="General inquiry, treatment question, etc."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className={`form-control ${fieldErrors.message ? 'error' : ''}`}
                    placeholder="How can our dental team assist you today?"
                  />
                  {fieldErrors.message && <div className="form-error">{fieldErrors.message}</div>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Location Map Embed */}
        <div className="card" style={{ marginTop: '3.5rem', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Clinic Location &amp; Directions</strong>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || '123 Smile Boulevard, Dental Care Plaza')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              Open in Google Maps ↗
            </a>
          </div>
          <div style={{ minHeight: 280, width: '100%', background: '#e2e8f0', position: 'relative' }}>
            {mapBlocked ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#f8fafc', color: 'var(--text-main)' }}>
                <MapPin size={36} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {settings?.clinicName || 'SmileCraft Dental Clinic'}
                </h4>
                <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                  {settings?.address || '123 Smile Boulevard, Suite 400, Dental Care Plaza'}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || '123 Smile Boulevard, Dental Care Plaza')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  View on Google Maps ↗
                </a>
              </div>
            ) : (
              <iframe
                title="Clinic Location Map"
                src={settings?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1"}
                width="100%"
                height="360"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setMapBlocked(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
