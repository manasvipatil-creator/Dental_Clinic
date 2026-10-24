import { FileText, CalendarCheck, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const TermsAndConditions = () => {
  const { settings } = useSettings();
  const clinicName = settings?.clinicName || 'SmileCraft Dental Clinic';

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + 2.5rem)', paddingBottom: '5rem', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 160, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <FileText size={16} /> Patient Agreement
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Terms of service and clinic appointment policies for {clinicName}
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.98rem' }}>
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              1. Online Appointment Requests
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Online booking requests submitted via our website generate an initial reservation with status <em>Pending</em>. Our front desk staff reviews chair availability and doctor schedules before issuing confirmation. An automated reference code is provided upon submission for tracking.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              2. Cancellation & Rescheduling Policy
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              We understand that schedules change. To respect fellow patients and practitioner time:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              <li>Please provide at least <strong>24 hours advance notice</strong> if you need to reschedule or cancel your visit.</li>
              <li>Repeated unnotified no-shows may require advance deposit for future booking requests.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              3. Treatment Plans & Estimates
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Prices shown on the website (e.g. for teeth whitening, dental implants, or braces) represent starting estimates. Actual treatment costs are determined following in-person clinical examination, dental X-rays, and diagnostic assessments tailored to your oral health.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              4. Emergency Dental Visits
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              If you are experiencing severe trauma, bleeding, or acute dental pain, please contact our emergency hotline immediately rather than waiting for an online booking confirmation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
