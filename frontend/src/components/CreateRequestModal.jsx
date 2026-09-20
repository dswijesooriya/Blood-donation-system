import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara',        // Western Province
  'Kandy', 'Matale', 'Nuwara Eliya',       // Central Province
  'Galle', 'Matara', 'Hambantota',         // Southern Province
  'Jaffna', 'Kilinochchi', 'Mannar', 
  'Mullaitivu', 'Vavuniya',                // Northern Province
  'Batticaloa', 'Ampara', 'Trincomalee',   // Eastern Province
  'Kurunegala', 'Puttalam',                // North Western Province
  'Anuradhapura', 'Polonnaruwa',           // North Central Province
  'Badulla', 'Monaragala',                 // Uva Province
  'Ratnapura', 'Kegalle'                   // Sabaragamuwa Province
];


const CreateRequestModal = ({ isOpen, onClose, onSuccess, defaultDistrict }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      district: defaultDistrict || '',
      urgencyStatus: 'low',
    },
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await api.post('/requests', {
        bloodType: data.bloodType,
        unitsNeeded: Number(data.unitsNeeded),
        district: data.district,
        urgencyStatus: data.urgencyStatus,
        contactNumber: data.contactNumber,
      });
      reset();
      onSuccess(); // tell parent to refresh
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Blood Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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

          <div>
            <label className="label-field">Units Needed *</label>
            <input
              type="number"
              {...register('unitsNeeded', {
                required: 'Units needed is required',
                min: { value: 1, message: 'Must be at least 1' },
                max: { value: 20, message: 'Maximum 20 units per request' },
              })}
              className="input-field"
              placeholder="e.g., 3"
            />
            {errors.unitsNeeded && (
              <p className="error-text">{errors.unitsNeeded.message}</p>
            )}
          </div>

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

          <div>
            <label className="label-field">Urgency Level *</label>
            <select
              {...register('urgencyStatus', { required: 'Urgency is required' })}
              className="input-field"
            >
              <option value="low">🟢 Low</option>
              <option value="critical">🔴 Critical</option>
            </select>
            {errors.urgencyStatus && (
              <p className="error-text">{errors.urgencyStatus.message}</p>
            )}
          </div>

          <div>
            <label className="label-field">Contact Number *</label>
            <input
              {...register('contactNumber', {
                required: 'Contact number is required',
                pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' },
              })}
              className="input-field"
              placeholder="0112345678"
            />
            {errors.contactNumber && (
              <p className="error-text">{errors.contactNumber.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;