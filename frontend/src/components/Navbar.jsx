import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import Logo from './Logo';
import { useSettings } from '../context/SettingsContext';
import { WhatsAppIcon } from './FloatingWhatsApp';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();

  const phoneDisplay = settings?.phone || '+91 9175514916';
  const rawWa = (settings?.whatsappNumber || settings?.phone || '9175514916').replace(/\D/g, '');
  const waNumber = rawWa.length === 10 ? `91${rawWa}` : rawWa.startsWith('91') ? rawWa : `91${rawWa}`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hello SmileCraft Dental Clinic, I would like to inquire about appointments.')}`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="banner">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="SmileCraft Dental Clinic home">
          <Logo size="md" />
        </Link>

        <nav className="navbar-links" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <a href={`tel:${phoneDisplay}`} className="navbar-phone" aria-label="Call us">
            <Phone size={14} />
            <span>{phoneDisplay}</span>
          </a>

          <Link to="/book-appointment" className="btn btn-primary btn-sm">
            <Calendar size={16} />
            Book Appointment
          </Link>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <nav>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'var(--space-4)' }}>
            <a
              href={`tel:${phoneDisplay}`}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Phone size={16} />
              Call {phoneDisplay}
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
              }}
            >
              <WhatsAppIcon size={18} color="#ffffff" />
              Chat on WhatsApp (+91 9175514916)
            </a>
            <Link
              to="/book-appointment"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMenuOpen(false)}
            >
              <Calendar size={16} />
              Book Appointment
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
