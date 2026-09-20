import { useEffect, useState } from 'react';
import api from '../api/axios';

const ViewResponsesModal = ({ isOpen, onClose, requestId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && requestId) {
      setLoading(true);
      api.get(`/requests/${requestId}/responses`)
        .then((res) => setData(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, requestId]);

  const updateStatus = async (responseId, status) => {
    try {
      await api.put(`/requests/responses/${responseId}/status`, { status });
      // refresh
      const res = await api.get(`/requests/${requestId}/responses`);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    }
  };

  const markAsDonated = async (responseId) => {
  if (
    !window.confirm(
      'Confirm: This donor has completed the donation. They will be marked ineligible for 90 days.'
    )
  )
    return;

  try {
    await api.put(`/requests/responses/${responseId}/mark-donated`);
    // Refresh the modal data
    const res = await api.get(`/requests/${requestId}/responses`);
    setData(res.data);
    alert('✅ Donation recorded successfully!');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to record donation.');
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Donor Responses</h2>
            {data?.request && (
              <p className="text-sm text-gray-500 mt-1">
                {data.request.bloodType} • {data.request.district} • {data.request.unitsNeeded} units
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading responses...</p>
          ) : !data || data.responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-gray-500">No donors have responded yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Donors in {data?.request?.district} with {data?.request?.bloodType} will be notified.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-xs font-semibold text-gray-500">DONOR</th>
                    <th className="py-3 text-xs font-semibold text-gray-500">BLOOD</th>
                    <th className="py-3 text-xs font-semibold text-gray-500">CONTACT</th>
                    <th className="py-3 text-xs font-semibold text-gray-500">RESPONDED</th>
                    <th className="py-3 text-xs font-semibold text-gray-500">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.responses.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50">
                      <td className="py-3">
                        <div className="font-medium">{r.donor?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{r.donor?.email || ''}</div>
                      </td>
                      <td className="py-3">
                        <span className="bg-red-50 text-red-600 font-bold px-2 py-1 rounded text-xs">
                          {r.donor?.bloodType}
                        </span>
                      </td>
                      <td className="py-3">
                        <a href={`tel:${r.donor?.contactNumber}`}
                          className="text-red-600 font-semibold text-sm hover:underline">
                          📞 {r.donor?.contactNumber}
                        </a>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
  {r.status === 'COMPLETED' ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
      🎉 Donation Recorded
    </span>
  ) : (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={r.status}
        onChange={(e) => updateStatus(r._id, e.target.value)}
        className={`text-xs font-bold rounded-lg px-2 py-1 border-0 cursor-pointer ${
          r.status === 'ACCEPTED'
            ? 'bg-green-100 text-green-700'
            : r.status === 'REJECTED'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        <option value="PENDING">Pending</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </select>

      {r.status === 'ACCEPTED' && (
        <button
          onClick={() => markAsDonated(r._id)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          title="Mark this donation as completed"
        >
          🎉 Mark Donated
        </button>
      )}
    </div>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResponsesModal;