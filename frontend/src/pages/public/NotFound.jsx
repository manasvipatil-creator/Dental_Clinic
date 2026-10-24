import { Link } from 'react-router-dom';
import { Home, Calendar, ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';

const NotFound = () => {
  return (
    <div style={{
      paddingTop: 'calc(var(--navbar-height) + 3rem)',
      paddingBottom: '5rem',
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      textAlign: 'center',
    }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          <Logo variant="icon" size="lg" />
        </div>

        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, margin: '0 0 0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The dental care page or resource you are looking for may have been moved, renamed, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link to="/book-appointment" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
