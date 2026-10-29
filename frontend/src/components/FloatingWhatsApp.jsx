import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export const WhatsAppIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.158.571 4.183 1.571 5.928l-1.571 5.9 6.079-1.595c1.691.923 3.633 1.442 5.698 1.442 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
  </svg>
);

const FloatingWhatsApp = () => {
  const { settings } = useSettings();
  const [hovered, setHovered] = useState(false);

  const rawNumber = (settings?.whatsappNumber || settings?.phone || '9175514916').replace(/\D/g, '');
  const waNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber.startsWith('91') ? rawNumber : `91${rawNumber}`;

  const defaultMessage = encodeURIComponent(
    'Hello SmileCraft Dental Clinic, I would like to inquire about appointments and dental services.'
  );

  const waUrl = `https://wa.me/${waNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Direct WhatsApp Contact"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Tooltip / Label visible on hover */}
      <span
        style={{
          background: '#1f2937',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(8px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        Chat on WhatsApp
      </span>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SmileCraft Dental Clinic on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          textDecoration: 'none',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        }}
      >
        <WhatsAppIcon size={32} color="#ffffff" />
      </a>
    </aside>
  );
};

export default FloatingWhatsApp;

