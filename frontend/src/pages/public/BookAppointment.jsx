import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Phone, Stethoscope, ChevronRight } from 'lucide-react';
import { publicApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner } from '../../components/UI';

const formatTimeLabel = (timeStr) => {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
};

const getNextWorkingDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // If tomorrow is Sunday (0), advance to Monday
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
};

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service');
  const preselectedDoctorId = searchParams.get('doctor');

  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotMessage, setSlotMessage] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Form state
  const [selectedService, setSelectedService] = useState(preselectedServiceId || '');
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctorId || '');
  const [selectedDate, setSelectedDate] = useState(getNextWorkingDate);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientData, setPatientData] = useState({
    patientName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'prefer-not-to-say',
    notes: '',
  });
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          publicApi.getServices(),
          publicApi.getDoctors(),
        ]);
        if (servicesRes.data?.data) {
          setServices(servicesRes.data.data);
          if (!selectedService && servicesRes.data.data.length > 0) {
            setSelectedService(servicesRes.data.data[0]._id);
          }
        }
        if (doctorsRes.data?.data) {
          setDoctors(doctorsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load booking prerequisites', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchPrerequisites();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      setSlotMessage('');
      try {
        const res = await publicApi.getSlots(selectedDate, selectedDoctor || undefined);
        let list = [];
        let msg = '';
        if (Array.isArray(res.data?.data)) {
          list = res.data.data;
        } else if (res.data?.data && Array.isArray(res.data.data.slots)) {
          list = res.data.data.slots;
          msg = res.data.data.message || '';
        }

        const normalized = list.map((item) => {
          if (typeof item === 'string') {
            return { value: item, label: formatTimeLabel(item) };
          }
          const val = item.start || item.time || '';
          return { value: val, label: formatTimeLabel(val) };
        });

        setSlots(normalized);
        setSlotMessage(msg);
        if (normalized.length > 0) {
          setSelectedSlot(normalized[0].value);
        }
      } catch (err) {
        // Fallback default slots if API fails
        const fallback = [
          '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30',
          '17:00', '17:30'
        ].map((t) => ({ value: t, label: formatTimeLabel(t) }));
        setSlots(fallback);
        setSelectedSlot(fallback[0].value);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, selectedDoctor]);

  const handlePatientChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedService) {
      setError('Please select a dental service.');
      return;
    }
    if (!selectedDate) {
      setError('Please select an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setError('Please choose an available time slot.');
      return;
    }
    if (!patientData.patientName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!patientData.phone.trim()) {
      setError('Please enter your contact phone number.');
      return;
    }
    if (!consentGiven) {
      setError('Please agree to the clinic privacy policy and terms before confirming your booking.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientName: patientData.patientName.trim(),
        mobile: patientData.phone.trim(),
        phone: patientData.phone.trim(),
        email: patientData.email?.trim() || '',
        serviceId: selectedService,
        service: selectedService,
        doctorId: selectedDoctor || undefined,
        doctor: selectedDoctor || undefined,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        message: patientData.notes?.trim() || '',
        notes: patientData.notes?.trim() || '',
        consentGiven: true,
        age: patientData.age ? Number(patientData.age) : undefined,
        gender: patientData.gender,
      };

      const res = await publicApi.bookAppointment(payload);
      if (res.data?.success) {
        setBookingSuccess(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to confirm booking.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to book appointment. Please try again or call our front desk.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + 4rem)', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner text="Preparing appointment calendar..." />
      </div>
    );
  }

  // Success view
  if (bookingSuccess) {
    return (
      <div className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 3rem)', paddingBottom: '5rem', maxWidth: 650 }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Appointment Requested!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Your appointment has been registered with reference ID:
          </p>

          <div style={{ background: 'var(--bg)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'inline-block', marginBottom: '2rem' }}>
            <code style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {bookingSuccess.referenceNumber || bookingSuccess.appointmentNumber || bookingSuccess._id || 'CONFIRMED'}
            </code>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.85rem' }}>Patient Name</span>
                <strong>{bookingSuccess.patientName || patientData.patientName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.85rem' }}>Date & Time</span>
                <strong>{selectedDate} at {formatTimeLabel(bookingSuccess.appointmentTime || selectedSlot)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.85rem' }}>Service</span>
                <strong>{bookingSuccess.service || services.find((s) => s._id === selectedService)?.title || 'General Dental'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.85rem' }}>Status</span>
                <span className="badge badge-warning">Pending Confirmation</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-outline">
              Return to Home
            </Link>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setSelectedSlot('');
                setPatientData({ patientName: '', email: '', phone: '', age: '', gender: 'prefer-not-to-say', notes: '' });
              }}
              className="btn btn-primary"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate min date (tomorrow)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="booking-page" style={{ paddingTop: 'calc(var(--navbar-height) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Easy Online Scheduling
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Book Your Dental Visit
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto' }}>
            Select your preferred treatment, specialist, and time. We will reserve your chair and send confirmation immediately.
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: '2rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          {/* Step 1: Select Service */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              <Stethoscope size={20} color="var(--primary)" />
              1. Select Dental Service *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {services.map((svc) => {
                const isSelected = selectedService === svc._id;
                return (
                  <button
                    type="button"
                    key={svc._id}
                    onClick={() => setSelectedService(svc._id)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>
                      {svc.title}
                    </div>
                    {svc.price && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        From {svc.price}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Preferred Doctor (Optional) */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              <User size={20} color="var(--primary)" />
              2. Select Doctor (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedDoctor('')}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedDoctor === '' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedDoctor === '' ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, color: selectedDoctor === '' ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                  Any Available Doctor
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>First available slot</div>
              </button>

              {doctors.map((doc) => {
                const isSelected = selectedDoctor === doc._id;
                return (
                  <button
                    type="button"
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc._id)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.specialization}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date & Time Slot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                <Calendar size={20} color="var(--primary)" />
                3. Choose Date *
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
                style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                <Clock size={20} color="var(--primary)" />
                4. Select Time Slot *
              </label>
              {loadingSlots ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading available time slots...
                </div>
              ) : slots.length === 0 ? (
                <div style={{ padding: '1rem', color: '#b91c1c', fontSize: '0.9rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
                  {slotMessage || 'No available slots for this date. The clinic is closed or fully booked. Please choose another day.'}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.5rem', maxHeight: 180, overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.value;
                    return (
                      <button
                        type="button"
                        key={slot.value}
                        onClick={() => setSelectedSlot(slot.value)}
                        style={{
                          padding: '0.55rem 0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary)' : '#fff',
                          color: isSelected ? '#fff' : 'var(--text-main)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Patient Information */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              5. Patient Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={patientData.patientName}
                  onChange={handlePatientChange}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={patientData.phone}
                  onChange={handlePatientChange}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="sarah@example.com"
                  value={patientData.email}
                  onChange={handlePatientChange}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 180px 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  placeholder="30"
                  value={patientData.age}
                  onChange={handlePatientChange}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={patientData.gender}
                  onChange={handlePatientChange}
                  className="form-control"
                >
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Reason / Symptoms / Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Tooth sensitivity, regular cleaning, etc."
                  value={patientData.notes}
                  onChange={handlePatientChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Patient Consent Checkbox */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1.25rem',
            background: 'rgba(14, 165, 160, 0.05)',
            border: '1px solid rgba(14, 165, 160, 0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
          }}>
            <input
              type="checkbox"
              id="bookingConsent"
              required
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              style={{ marginTop: 3, width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="bookingConsent" style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, cursor: 'pointer' }}>
              I agree to the <Link to="/privacy-policy" target="_blank" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link> and <Link to="/terms-and-conditions" target="_blank" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Terms &amp; Conditions</Link>, and consent to SmileCraft contacting me by phone or email regarding this appointment.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🔒 Your medical and personal information is strictly confidential.
            </span>
            <button
              type="submit"
              id="submit-book-appointment-btn"
              disabled={submitting}
              className="btn btn-primary"
              style={{ minWidth: 220, padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {submitting ? 'Booking Appointment...' : 'Book Appointment'}
              <ChevronRight size={18} />
            </button>
          </div>
        </form>

        {/* 4 Trust Highlights from Brand Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginTop: '3rem',
          textAlign: 'center',
        }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🦷</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>Modern Treatment</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digitally guided dentistry</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🛡️</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>Safe &amp; Sterile</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital-grade disinfection</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🩺</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>Expert Care</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certified specialist doctors</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>✨</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--secondary)' }}>Long Lasting Results</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-durability restorations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
