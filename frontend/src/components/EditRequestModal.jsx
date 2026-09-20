import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna',
  'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura', 'Batticaloa',
];

const EditRequestModal = ({ isOpen, onClose, onSuccess, request }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (request) {
      reset({
        bloodType: request.bloodType,
        unitsNeeded: request.unitsNeeded,
        district: request.district,
        urgencyStatus: request.urgencyStatus,
        contactNumber: request.contactNumber,
      });
    }
  }, [request, reset]);

  if (!isOpen || !request) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await api.put(`/requests/${request._id}`, {
        ...data,
        unitsNeeded: Number(data.unitsNeeded),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Edit Blood Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label-field">Blood Type *</label>
            <select {...register('bloodType', { required: 'Required' })} className="input-field">
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="label-field">Units Needed *</label>
            <input type="number" {...register('unitsNeeded', { required: 'Required', min: 1 })}
              className="input-field" />
          </div>

          <div>
            <label className="label-field">District *</label>
            <select {...register('district', { required: 'Required' })} className="input-field">
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="label-field">Urgency *</label>
            <select {...register('urgencyStatus', { required: 'Required' })} className="input-field">
              <option value="low">🟢 Low</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>

          <div>
            <label className="label-field">Contact Number *</label>
            <input {...register('contactNumber', {
              required: 'Required',
              pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
            })} className="input-field" />
            {errors.contactNumber && <p className="error-text">{errors.contactNumber.message}</p>}
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{serverError}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;