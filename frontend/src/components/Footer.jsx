import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Heart, Globe, Lock } from 'lucide-react';
import { LogoWhite } from './Logo';
import { useSettings } from '../context/SettingsContext';
import { WhatsAppIcon } from './FloatingWhatsApp';
import './Footer.css';

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"/>
  </svg>
);

const Footer = () => {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-col footer-brand">
            <Link to="/" aria-label="SmileCraft home">
              <LogoWhite size="md" showTagline={true} />
            </Link>
            <p className="footer-tagline">
              {settings?.tagline || 'Healthy Smiles Brighter Lives — Gentle, advanced dental care for your whole family.'}
            </p>
            <div className="footer-social">
              {settings?.socialFacebook && <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>}
              {settings?.socialInstagram && <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
              {settings?.socialTwitter && <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><TwitterIcon /></a>}
              {settings?.socialYoutube && <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><YoutubeIcon /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/doctors', 'Our Doctors'], ['/gallery', 'Gallery'], ['/contact', 'Contact'], ['/admin/login', 'Admin Login']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h3 className="footer-heading">Services</h3>
            <ul className="footer-links">
              {[['teeth-cleaning-whitening', 'Teeth Cleaning'], ['root-canal-treatment', 'Root Canal'], ['dental-implants', 'Dental Implants'], ['braces-orthodontics', 'Braces'], ['cosmetic-dentistry', 'Cosmetic Dentistry'], ['pediatric-dentistry', 'Pediatric Dentistry']].map(([slug, label]) => (
                <li key={slug}><Link to={`/services/${slug}`}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h3 className="footer-heading">Contact</h3>
            <div className="footer-contact-list">
              <a href={`tel:${settings?.phone || '+91 9175514916'}`} className="footer-contact-item">
                <Phone size={16} />
                <span>{settings?.phone || '+91 9175514916'}</span>
              </a>
              <a
                href={`https://wa.me/${(settings?.whatsappNumber || settings?.phone || '9175514916').replace(/\D/g, '')}?text=${encodeURIComponent('Hello SmileCraft Dental Clinic, I would like to inquire about dental treatments.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
                style={{ color: '#34D399' }}
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon size={16} color="#34D399" />
                <span>+91 9175514916 (WhatsApp)</span>
              </a>
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="footer-contact-item">
                  <Mail size={16} />
                  <span>{settings.email}</span>
                </a>
              )}
              {settings?.address && (
                <div className="footer-contact-item">
                  <MapPin size={16} />
                  <span>{settings.address}{settings.city ? `, ${settings.city}` : ''}</span>
                </div>
              )}
            </div>

            {/* Working Hours */}
            {settings?.workingHours?.length > 0 && (
              <div className="footer-hours">
                <div className="footer-contact-item" style={{ marginBottom: 4 }}>
                  <Clock size={16} />
                  <strong>Working Hours</strong>
                </div>
                {settings.workingHours.slice(0, 3).map((h) => (
                  <div key={h.day} className="footer-hours-row">
                    <span>{h.day}</span>
                    <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/book-appointment" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {year} {settings?.clinicName || 'SmileCraft Dental Clinic'}. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link to="/admin/login" className="footer-admin-btn" aria-label="Admin Login">
              <Lock size={12} />
              <span>Admin Login</span>
            </Link>
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            Built with <Heart size={12} style={{ color: '#0EA5A0' }} /> by iCoded Automation Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
