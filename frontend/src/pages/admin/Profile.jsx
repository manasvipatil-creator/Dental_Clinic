import { useState } from 'react';
import { User, Lock, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'SmileCraft Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const payload = { name };
      if (newPassword) {
        if (!currentPassword) {
          setError('Please provide current password to update password.');
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await adminApi.updateProfile(payload);
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
          Admin Profile & Security
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Manage administrator account name and credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', marginBottom: '1.5rem' }}>
            <CheckCircle size={18} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Admin Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={user?.email || 'admin@smilecraft.demo'}
            className="form-control"
            style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Primary login identifier</small>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          Change Password (Optional)
        </h4>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Current Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            New Password
          </label>
          <input
            type="password"
            placeholder="Leave blank to keep unchanged"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-control"
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary">
          <Save size={16} />
          {saving ? 'Updating...' : 'Update Account'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
