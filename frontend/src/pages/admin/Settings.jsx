import { useState, useEffect } from 'react';
import { Save, Building, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner } from '../../components/UI';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    slotDurationMinutes: 30,
    maxAdvanceBookingDays: 30,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminApi.getSettings();
        if (res.data?.data) {
          setFormData((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading clinic settings..." />;

  return (
    <div className="admin-page" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
          Clinic Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Update your clinic identity, contact details, and appointment scheduling rules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', marginBottom: '1.5rem' }}>
            <CheckCircle size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={18} color="var(--primary)" /> Clinic Identity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Clinic Name *</label>
            <input
              type="text"
              name="clinicName"
              required
              value={formData.clinicName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={18} color="var(--primary)" /> Contact Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number *</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contact Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control"
            style={{ marginBottom: '1.5rem' }}
          />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary)" /> Booking Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Slot Duration (minutes)</label>
            <input
              type="number"
              name="slotDurationMinutes"
              min="15"
              step="15"
              value={formData.slotDurationMinutes}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Max Advance Booking (days)</label>
            <input
              type="number"
              name="maxAdvanceBookingDays"
              min="1"
              value={formData.maxAdvanceBookingDays}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: 160 }}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
