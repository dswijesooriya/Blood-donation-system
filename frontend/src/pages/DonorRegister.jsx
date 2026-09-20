import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna',
  'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura', 'Batticaloa',
];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorRegister = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Watch password so we can compare with confirmPassword
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const payload = {
        fullName: data.fullName,
        nic: data.nic,
        age: Number(data.age),
        district: data.district,
        weight: Number(data.weight),
        contactNumber: data.contactNumber,
        email: data.email,
        password: data.password,
        bloodType: data.bloodType,
      };
      await api.post('/auth/register/donor', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
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
          <p className="text-gray-600 mb-4">
            Welcome to BloodLife. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-sm text-red-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="card">
          <div className="mb-6">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-2">
              VOLUNTEER REGISTRY
            </span>
            <h1 className="text-3xl font-bold text-gray-900">Donor Registration</h1>
            <p className="text-gray-500">Become a hero. Save lives.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="label-field">Full Name *</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                className="input-field"
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
            </div>

            {/* NIC */}
            <div>
              <label className="label-field">NIC / National ID *</label>
              <input
                {...register('nic', {
                  required: 'NIC is required',
                  pattern: {
                    value: /^(?:\d{9}[VvXx]|\d{12})$/,
                    message: 'Must be 9 digits + V/X OR 12 digits',
                  },
                })}
                className="input-field"
                placeholder="200012345678"
              />
              {errors.nic && <p className="error-text">{errors.nic.message}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="label-field">Age (18-65) *</label>
              <input
                type="number"
                {...register('age', {
                  required: 'Age is required',
                  min: { value: 18, message: 'Must be at least 18' },
                  max: { value: 65, message: 'Must be 65 or under' },
                })}
                className="input-field"
                placeholder="25"
              />
              {errors.age && <p className="error-text">{errors.age.message}</p>}
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
              {errors.district && <p className="error-text">{errors.district.message}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label className="label-field">Contact Number *</label>
              <input
                {...register('contactNumber', {
                  required: 'Contact is required',
                  pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' },
                })}
                className="input-field"
                placeholder="0712345678"
              />
              {errors.contactNumber && <p className="error-text">{errors.contactNumber.message}</p>}
            </div>

            {/* Weight */}
            <div>
              <label className="label-field">Weight (kg) *</label>
              <input
                type="number"
                {...register('weight', {
                  required: 'Weight is required',
                  min: { value: 50, message: 'Must be 50kg or above' },
                })}
                className="input-field"
                placeholder="70"
              />
              {errors.weight && <p className="error-text">{errors.weight.message}</p>}
            </div>

            {/* Blood Type */}
            <div>
              <label className="label-field">Blood Type *</label>
              <select
                {...register('bloodType', { required: 'Blood type is required' })}
                className="input-field"
              >
                <option value="">Select blood group</option>
                {BLOOD_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.bloodType && <p className="error-text">{errors.bloodType.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label-field">Email Address *</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
                })}
                className="input-field"
                placeholder="name@example.com"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
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
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label-field">Confirm Password *</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className="input-field"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Medical Eligibility Checkbox */}
            <div className="md:col-span-2 flex items-start gap-3 bg-red-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="medical"
                {...register('medicalEligible', {
                  required: 'You must confirm eligibility',
                })}
                className="mt-1 w-4 h-4 accent-red-600"
              />
              <label htmlFor="medical" className="text-sm text-gray-700">
                I confirm that I am in good health, weigh over 50kg, and have
                no major transmissible illnesses or conditions preventing
                blood donation.
              </label>
            </div>
            {errors.medicalEligible && (
              <p className="error-text md:col-span-2">
                {errors.medicalEligible.message}
              </p>
            )}

            {/* Server Error */}
            {serverError && (
              <div className="md:col-span-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary md:col-span-2"
            >
              {loading ? 'Registering...' : 'Register Account →'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegister;