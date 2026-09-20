import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna',
  'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura', 'Batticaloa',
];

const DonorProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');
  const [serverError, setServerError] = useState('');
  const [eligibility, setEligibility] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    api
  .get('/donors/profile')
  .then((res) => {
    setProfile(res.data);
    setEligibility({
      isEligible: res.data.isEligible,
      daysUntilEligible: res.data.daysUntilEligible || 0,
      nextEligibleDate: res.data.nextEligibleDate,
    });
    reset({
      contactNumber: res.data.contactNumber,
      district: res.data.district,
      weight: res.data.weight,
      isEligible: res.data.isEligible,
    });
  })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false));
  }, [reset]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.put('/donors/profile', {
        contactNumber: data.contactNumber,
        district: data.district,
        weight: Number(data.weight),
        isEligible:
          data.isEligible === true || data.isEligible === 'true',
      });
      setProfile(res.data.user);
      setEditing(false);
      showToast('✅ Profile updated successfully!');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setServerError('');
    if (profile) {
      reset({
        contactNumber: profile.contactNumber,
        district: profile.district,
        weight: profile.weight,
        isEligible: profile.isEligible,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold text-red-600">BloodLife</span>
            <span className="ml-4 text-sm text-gray-500">
              Portal › My Profile
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/donor/dashboard"
              className="text-sm text-gray-600 hover:text-red-600 font-semibold"
            >
              ← Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 font-semibold hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {toast && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-40">
          {toast}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Donor</span>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {profile?.bloodType}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-field">
                  FULL NAME{' '}
                  <span className="text-xs text-gray-400 font-normal">
                    (cannot be changed)
                  </span>
                </label>
                <input
                  type="text"
                  value={profile?.fullName || ''}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="label-field">
                  NIC{' '}
                  <span className="text-xs text-gray-400 font-normal">
                    (cannot be changed)
                  </span>
                </label>
                <input
                  type="text"
                  value={profile?.nic || ''}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    AGE{' '}
                    <span className="text-xs text-gray-400 font-normal">
                      (contact support to change)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profile?.age || ''}
                    disabled
                    className="input-field bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label-field">DISTRICT *</label>
                  {editing ? (
                    <>
                      <select
                        {...register('district', {
                          required: 'District is required',
                        })}
                        className="input-field"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="error-text">
                          {errors.district.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={profile?.district || ''}
                      disabled
                      className="input-field bg-gray-100 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">CONTACT NUMBER *</label>
                  {editing ? (
                    <>
                      <input
                        type="text"
                        {...register('contactNumber', {
                          required: 'Contact number is required',
                          pattern: {
                            value: /^\d{10}$/,
                            message: 'Must be exactly 10 digits',
                          },
                        })}
                        className="input-field"
                        placeholder="0712345678"
                      />
                      {errors.contactNumber && (
                        <p className="error-text">
                          {errors.contactNumber.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={profile?.contactNumber || ''}
                      disabled
                      className="input-field bg-gray-100 cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="label-field">WEIGHT (kg) *</label>
                  {editing ? (
                    <>
                      <input
                        type="number"
                        {...register('weight', {
                          required: 'Weight is required',
                          min: {
                            value: 50,
                            message: 'Must be 50kg or above',
                          },
                        })}
                        className="input-field"
                        placeholder="70"
                      />
                      {errors.weight && (
                        <p className="error-text">
                          {errors.weight.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={`${profile?.weight || ''} kg`}
                      disabled
                      className="input-field bg-gray-100 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="label-field">
                  EMAIL ADDRESS{' '}
                  <span className="text-xs text-gray-400 font-normal">
                    (cannot be changed)
                  </span>
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>

              {editing && (
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                  <input
                    type="checkbox"
                    id="isEligible"
                    {...register('isEligible')}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label
                    htmlFor="isEligible"
                    className="text-sm text-gray-700"
                  >
                    I am currently eligible to donate blood
                  </label>
                </div>
              )}

              {serverError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {serverError}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="btn-primary"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="submit" className="btn-primary">
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          <div className="md:col-span-1">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">
                Medical Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  No chronic illness
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Not on long-term medication
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Fit to donate blood
                </div>
              </div>

              <div
  className={`mt-6 p-4 rounded-lg ${
    profile?.isEligible
      ? 'bg-green-50 border border-green-200'
      : 'bg-amber-50 border border-amber-200'
  }`}
>
  <div className="flex items-center gap-3">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl text-white flex-shrink-0 ${
        profile?.isEligible ? 'bg-green-500' : 'bg-amber-500'
      }`}
    >
      {profile?.isEligible ? '✓' : '⏳'}
    </div>
    <div className="flex-1">
      <p
        className={`font-bold ${
          profile?.isEligible ? 'text-green-800' : 'text-amber-800'
        }`}
      >
        {profile?.isEligible ? 'Eligible to Donate' : 'Resting Period'}
      </p>
      <p
        className={`text-xs ${
          profile?.isEligible ? 'text-green-600' : 'text-amber-600'
        }`}
      >
        {profile?.isEligible
          ? 'All health checks verified'
          : `Eligible in ${eligibility?.daysUntilEligible || 0} days`}
      </p>
    </div>
  </div>

  {/* Countdown details */}
  {!profile?.isEligible && eligibility?.nextEligibleDate && (
    <div className="mt-3 pt-3 border-t border-amber-200">
      <p className="text-xs text-amber-700">
        <strong>Next eligible date:</strong>{' '}
        {new Date(eligibility.nextEligibleDate).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </div>
  )}
</div>

            </div>

            <div className="card mt-4 bg-gray-50">
              <p className="text-xs text-gray-500 leading-relaxed">
                💡 <strong>Why can't I change my name or NIC?</strong>
                <br />
                These are core identity fields. Contact support if you need
                updates.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorProfile;