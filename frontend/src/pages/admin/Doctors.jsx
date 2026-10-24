import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Award, X } from 'lucide-react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: 5,
    bio: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDoctors();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.doctors || []);
        setDoctors(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openModal = (doc = null) => {
    if (doc) {
      setEditingDoctor(doc);
      setFormData({
        name: doc.name || '',
        specialization: doc.specialization || '',
        qualification: doc.qualifications || doc.qualification || '',
        experience: doc.experience || 5,
        bio: doc.biography || doc.bio || '',
        email: doc.email || '',
        phone: doc.phone || '',
        isActive: doc.active ?? doc.isActive ?? true,
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        specialization: '',
        qualification: '',
        experience: 5,
        bio: '',
        email: '',
        phone: '',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        qualifications: formData.qualification || formData.qualifications || '',
        biography: formData.bio || formData.biography || '',
        active: formData.isActive ?? true,
      };
      if (editingDoctor) {
        await adminApi.updateDoctor(editingDoctor._id, payload);
      } else {
        await adminApi.createDoctor(payload);
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await adminApi.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Dental Specialists
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Manage doctor profiles, qualifications, and specialties
          </p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={18} /> Add New Doctor
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading doctors..." />
          </div>
        ) : (!Array.isArray(doctors) || doctors.length === 0) ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState title="No Doctors Listed" description="Click 'Add New Doctor' to add clinic practitioners." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Doctor</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Specialization</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Experience</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(doctors) ? doctors : []).map((doc) => (
                  <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {doc.name?.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            Dr. {doc.name}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {doc.qualifications || doc.qualification || 'DDS, DMD'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-neutral">{doc.specialization}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {doc.experience ? `${doc.experience} Years` : '5+ Years'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${(doc.active ?? doc.isActive ?? true) ? 'badge-success' : 'badge-neutral'}`}>
                        {(doc.active ?? doc.isActive ?? true) ? 'Active' : 'On Leave'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(doc)} className="btn btn-outline btn-sm">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Eleanor Vance"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Orthodontist"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="form-control"
                    placeholder="e.g. DDS, MS Orthodontics"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Professional Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-control"
                  placeholder="Summary of experience, philosophy, and background..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isDocActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isDocActive" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Available for appointments
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
