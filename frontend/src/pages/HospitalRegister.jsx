import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna',
  'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura', 'Batticaloa',
];

const HospitalRegister = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/register/hospital', {
        hospitalName: data.hospitalName,
        registrationId: data.registrationId,
        district: data.district,
        officialEmail: data.officialEmail,
        contactNumber: data.contactNumber,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-2">
            Your account has been created and is pending admin approval.
          </p>
          <p className="text-sm text-gray-500">
            You'll be able to log in once an administrator approves your account.
          </p>
          <p className="text-xs text-gray-400 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-sm text-red-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form (2 columns) */}
          <div className="lg:col-span-2 card">
            <div className="mb-6">
              <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-2">
                INSTITUTIONAL PORTAL
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                Hospital Registration
              </h1>
              <p className="text-gray-500">Join hands to save lives.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Hospital Name */}
              <div>
                <label className="label-field">Hospital Name *</label>
                <input
                  {...register('hospitalName', { required: 'Hospital name is required' })}
                  className="input-field"
                  placeholder="Central Hospital"
                />
                {errors.hospitalName && (
                  <p className="error-text">{errors.hospitalName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Registration ID */}
                <div>
                  <label className="label-field">Hospital Registration ID *</label>
                  <input
                    {...register('registrationId', {
                      required: 'Registration ID is required',
                    })}
                    className="input-field"
                    placeholder="HOSP-7890"
                  />
                  {errors.registrationId && (
                    <p className="error-text">{errors.registrationId.message}</p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="label-field">District *</label>
                  <select
                    {...register('district', { required: 'District is required' })}
                    className="input-field"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="error-text">{errors.district.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="label-field">Official Email *</label>
                  <input
                    type="email"
                    {...register('officialEmail', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                    })}
                    className="input-field"
                    placeholder="contact@hospital.com"
                  />
                  {errors.officialEmail && (
                    <p className="error-text">{errors.officialEmail.message}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="label-field">Contact Number *</label>
                  <input
                    {...register('contactNumber', {
                      required: 'Contact is required',
                      pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
                    })}
                    className="input-field"
                    placeholder="0112345678"
                  />
                  {errors.contactNumber && (
                    <p className="error-text">{errors.contactNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-field">Password *</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: 'Need uppercase, number & symbol',
                    },
                  })}
                  className="input-field"
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="error-text">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label-field">Confirm Password *</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className="input-field"
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Submitting...' : 'Submit for Admin Approval →'}
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-600">
              Already registered as a partner?{' '}
              <Link to="/login" className="text-red-600 font-semibold hover:underline">
                Log In
              </Link>
            </div>
          </div>

          {/* Info Panel (1 column) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card bg-red-50 border-red-100">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🏥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Partner with Us</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Register your hospital and help us build a stronger blood donation network.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Rapid Triage</p>
                  <p className="text-lg font-bold text-red-600">&lt; 4 mins</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Live Stock</p>
                  <p className="text-lg font-bold text-red-600">24 / 7</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Hospital IDs are validated against Ministry of Health clinical registry protocols.
              </p>
            </div>

            <div className="card">
              <h4 className="font-semibold text-sm mb-3">How it works</h4>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="bg-red-100 text-red-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Fill credentials</span>
                </li>
                <li className="flex gap-2">
                  <span className="bg-red-100 text-red-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>Verification review by admin</span>
                </li>
                <li className="flex gap-2">
                  <span className="bg-red-100 text-red-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Broadcast blood requests</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;