import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const PatientPrivacy = () => {
  const { settings } = useSettings();
  const clinicName = settings?.clinicName || 'SmileCraft Dental Clinic';
  const email = settings?.email || 'privacy@smilecraft.demo';
  const phone = settings?.phone || '+91 9175514916';

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + 2.5rem)', paddingBottom: '5rem', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 160, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} /> Patient Data Protection
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Last updated: October 2026 • Effective for all patients and online appointment bookings
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.7, color: 'var(--text-main)', fontSize: '0.98rem' }}>
          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              1. Information We Collect
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              When you book an appointment or send an inquiry through {clinicName}, we collect:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              <li><strong>Contact Information:</strong> Patient full name, mobile number, and email address.</li>
              <li><strong>Appointment Details:</strong> Selected dental treatment, chosen doctor, requested appointment date, and time slot.</li>
              <li><strong>Clinical Notes:</strong> Optional symptoms, reasons for visit, or special assistance requests provided voluntarily by the patient.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              2. How We Use Patient Data
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Your information is solely used to deliver secure healthcare services:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              <li>To schedule, confirm, reschedule, or cancel your clinic visits.</li>
              <li>To provide SMS/email appointment confirmations and reference numbers.</li>
              <li>To allow authorized clinic doctors to review scheduling and treatment requirements prior to your visit.</li>
              <li>To answer patient inquiries and respond to consultation requests.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              3. Data Security & Storage
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              We implement industry-standard encryption, strict database authorization controls, and rate-limiting protocols. Patient records are never sold, rented, or shared with third-party advertising companies. Only authorized clinical and administrative personnel possess login credentials to view appointment registries.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
              4. Patient Consent & Rights
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              By submitting an appointment booking, you provide consent for {clinicName} staff to reach you regarding your scheduled treatment. You have the right at any time to request access, correction, or deletion of your contact records by contacting our clinic administration.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Contact Our Privacy Officer
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              For questions concerning data privacy, contact our front desk at <strong>{phone}</strong> or email <strong>{email}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientPrivacy;
