import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Award, X, Upload, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState, ConfirmDialog } from '../../components/UI';
import { formatCurrency } from '../../utils/currency';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: 5,
    consultationFee: '',
    bio: '',
    email: '',
    phone: '',
    imageUrl: '',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDoctors();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.doctors || []);
        setDoctors(list);
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openModal = (doc = null) => {
    setFieldErrors({});
    setFormError('');
    setSelectedFile(null);

    if (doc) {
      setEditingDoctor(doc);
      setFormData({
        name: doc.name || '',
        specialization: doc.specialization || '',
        qualification: doc.qualifications || doc.qualification || '',
        experience: doc.experience || 5,
        consultationFee: doc.consultationFee || '',
        bio: doc.biography || doc.bio || '',
        email: doc.email || '',
        phone: doc.phone || '',
        imageUrl: doc.image || '',
        isActive: doc.active ?? doc.isActive ?? true,
      });
      if (doc.image) {
        setImagePreview(doc.image.startsWith('/uploads') ? `${UPLOADS_URL}${doc.image}` : doc.image);
      } else {
        setImagePreview('');
      }
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        specialization: '',
        qualification: '',
        experience: 5,
        consultationFee: '',
        bio: '',
        email: '',
        phone: '',
        imageUrl: '',
        isActive: true,
      });
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors((prev) => ({ ...prev, image: 'Only JPG, PNG, WebP, or GIF images are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Doctor name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.specialization.trim()) {
      errors.specialization = 'Specialization is required';
    } else if (formData.specialization.trim().length < 2) {
      errors.specialization = 'Specialization must be at least 2 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && formData.phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.experience !== '' && (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)) {
      errors.experience = 'Experience must be a positive number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setFormError('');

    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name.trim());
      dataPayload.append('specialization', formData.specialization.trim());
      dataPayload.append('qualifications', (formData.qualification || '').trim());
      dataPayload.append('qualification', (formData.qualification || '').trim());
      dataPayload.append('experience', String(formData.experience));
      dataPayload.append('consultationFee', formData.consultationFee ? formatCurrency(formData.consultationFee) : '');
      dataPayload.append('biography', (formData.bio || '').trim());
      dataPayload.append('bio', (formData.bio || '').trim());
      dataPayload.append('email', (formData.email || '').trim());
      dataPayload.append('phone', (formData.phone || '').trim());
      dataPayload.append('active', String(formData.isActive ?? true));

      if (selectedFile) {
        dataPayload.append('image', selectedFile);
      } else if (formData.imageUrl) {
        dataPayload.append('image', formData.imageUrl.trim());
      }

      if (editingDoctor) {
        await adminApi.updateDoctor(editingDoctor._id, dataPayload);
        setSuccessMsg(`Dr. ${formData.name} updated successfully!`);
      } else {
        await adminApi.createDoctor(dataPayload);
        setSuccessMsg(`Dr. ${formData.name} added successfully!`);
      }

      setModalOpen(false);
      fetchDoctors();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save doctor profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (doc) => {
    setDoctorToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await adminApi.deleteDoctor(doctorToDelete._id);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorToDelete._id));
      setSuccessMsg(`Dr. ${doctorToDelete.name} was removed.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Dental Specialists
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Add, update, or remove doctor profiles and clinic practitioners
          </p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary" id="add-doctor-btn">
          <Plus size={18} /> Add New Doctor
        </button>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-md)',
          color: '#065f46',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          <Check size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

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
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 680 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Doctor</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Specialization</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Experience</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Consultation Fee</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(doctors) ? doctors : []).map((doc) => {
                  const imageSrc = doc.image ? (doc.image.startsWith('/uploads') ? `${UPLOADS_URL}${doc.image}` : doc.image) : '';
                  const isActive = doc.active ?? doc.isActive ?? true;

                  return (
                    <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: 46,
                            height: 46,
                            borderRadius: '50%',
                            background: 'rgba(13, 148, 136, 0.1)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '2px solid rgba(14, 165, 160, 0.2)',
                          }}>
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={doc.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerText = doc.name?.charAt(0) || 'D';
                                }}
                              />
                            ) : (
                              doc.name?.charAt(0) || 'D'
                            )}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              Dr. {doc.name.replace(/^Dr\.\s*/i, '')}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {doc.qualifications || doc.qualification || 'Dental Surgeon'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.8rem', textTransform: 'none' }}>
                          {doc.specialization}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          {doc.experience ? `${doc.experience} Years` : '5+ Years'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {doc.consultationFee ? formatCurrency(doc.consultationFee) : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {isActive ? 'Active' : 'On Leave'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openModal(doc)}
                            className="btn btn-outline btn-sm"
                            title="Edit Doctor"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(doc)}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            title="Delete Doctor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Doctor Profile"
        message={
          doctorToDelete
            ? `Are you sure you want to delete Dr. ${doctorToDelete.name}? This will remove their profile from the website and cannot be undone.`
            : 'Are you sure you want to delete this doctor?'
        }
        confirmText="Yes, Delete Doctor"
        danger={true}
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDoctorToDelete(null);
        }}
      />

      {/* Add / Edit Doctor Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 580, width: '100%', padding: '2rem', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-md)',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Photo Upload with Live Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Doctor Photo
                </label>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px dashed var(--primary)',
                    flexShrink: 0,
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={32} color="var(--primary)" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label
                      htmlFor="doctor-photo-input"
                      className="btn btn-outline btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}
                    >
                      <Upload size={14} /> Choose Photo
                    </label>
                    <input
                      id="doctor-photo-input"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supports JPG, PNG, WebP up to 5MB. Persisted safely to cloud storage.
                    </div>
                  </div>
                </div>
                {fieldErrors.image && <div className="form-error">{fieldErrors.image}</div>}
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  className={`form-control ${fieldErrors.name ? 'error' : ''}`}
                  placeholder="e.g. Eleanor Vance"
                />
                {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
              </div>

              {/* Specialization & Qualifications */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Specialization <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => {
                      setFormData({ ...formData, specialization: e.target.value });
                      if (fieldErrors.specialization) setFieldErrors({ ...fieldErrors, specialization: '' });
                    }}
                    className={`form-control ${fieldErrors.specialization ? 'error' : ''}`}
                    placeholder="e.g. Orthodontist & Implant Specialist"
                  />
                  {fieldErrors.specialization && <div className="form-error">{fieldErrors.specialization}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="form-control"
                    placeholder="e.g. BDS, MDS (Harvard School)"
                  />
                </div>
              </div>

              {/* Experience & Consultation Fee */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      if (fieldErrors.experience) setFieldErrors({ ...fieldErrors, experience: '' });
                    }}
                    className={`form-control ${fieldErrors.experience ? 'error' : ''}`}
                    placeholder="e.g. 8"
                  />
                  {fieldErrors.experience && <div className="form-error">{fieldErrors.experience}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="form-control"
                    placeholder="e.g. ₹500 or ₹1,000"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Displayed in Indian Rupees (₹)
                  </div>
                </div>
              </div>

              {/* Contact: Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    className={`form-control ${fieldErrors.email ? 'error' : ''}`}
                    placeholder="doctor@smilecraft.demo"
                  />
                  {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                    }}
                    className={`form-control ${fieldErrors.phone ? 'error' : ''}`}
                    placeholder="+91 98765 43210"
                  />
                  {fieldErrors.phone && <div className="form-error">{fieldErrors.phone}</div>}
                </div>
              </div>

              {/* Professional Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Professional Biography
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-control"
                  placeholder="Summary of experience, clinical specializations, and patient philosophy..."
                />
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="isDocActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <label htmlFor="isDocActive" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Available for appointments (Show on public website)
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="loading-spinner loading-spinner-sm" style={{ borderTopColor: '#fff' }} />
                      Saving...
                    </span>
                  ) : (
                    editingDoctor ? 'Update Doctor Profile' : 'Save Doctor'
                  )}
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
