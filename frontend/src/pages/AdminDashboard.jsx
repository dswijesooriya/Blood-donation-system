import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: '⏳',
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: '❌',
  },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      if (search) params.append('search', search);

      const [statsRes, hospitalsRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get(`/admin/hospitals?${params.toString()}`),
      ]);
      setStats(statsRes.data.stats);
      setHospitals(hospitalsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleStatusChange = async (hospitalId, status) => {
    try {
      await api.put(`/admin/hospitals/${hospitalId}/status`, { status });
      showToast(
        status === 'APPROVED'
          ? '✅ Hospital approved!'
          : status === 'REJECTED'
          ? '❌ Hospital rejected.'
          : '⏳ Set to pending.'
      );
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update.');
    }
  };

  const handleDelete = async (hospital) => {
    if (
      !window.confirm(
        `Delete "${hospital.hospitalName}"? This will also delete all their blood requests. This cannot be undone.`
      )
    )
      return;
    try {
      await api.delete(`/admin/hospitals/${hospital._id}`);
      showToast('🗑️ Hospital deleted.');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const getTimeAgo = (date) => {
    const days = Math.floor(
      (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        portalLabel="Admin Panel"
        menuItems={[
          { to: '/admin/dashboard', label: 'Hospital Approvals', icon: '🏥' },
        ]}
      />

      {toast && (
        <div className="fixed top-20 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg z-40">
          {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">
            Approve or manage hospital registration requests.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                PENDING
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-yellow-600">
                  {stats.pendingHospitals}
                </span>
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                APPROVED
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">
                  {stats.approvedHospitals}
                </span>
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                TOTAL DONORS
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-600">
                  {stats.totalDonors}
                </span>
                <span className="text-3xl">🩸</span>
              </div>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                TOTAL REQUESTS
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {stats.totalRequests}
                </span>
                <span className="text-3xl">📋</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="PENDING">⏳ Pending</option>
                <option value="APPROVED">✅ Approved</option>
                <option value="REJECTED">❌ Rejected</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>
            <div>
              <label className="label-field">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or email..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Hospitals Table */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading hospitals...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hospitals found
              </h3>
              <p className="text-gray-500">
                {filter === 'PENDING'
                  ? 'All hospital registrations have been reviewed. Nice work!'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      HOSPITAL
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      REG ID
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      DISTRICT
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      CONTACT
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      REGISTERED
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h) => {
                    const statusCfg =
                      STATUS_CONFIG[h.status] || STATUS_CONFIG.PENDING;
                    return (
                      <tr
                        key={h._id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {h.hospitalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {h.officialEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {h.registrationId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {h.district}
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`tel:${h.contactNumber}`}
                            className="text-red-600 font-semibold hover:underline text-sm"
                          >
                            📞 {h.contactNumber}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {getTimeAgo(h.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}
                          >
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {h.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(h._id, 'APPROVED')
                                }
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 transition"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(h._id, 'REJECTED')
                                }
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 transition"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}

                          {h.status === 'APPROVED' && (
                            <button
                              onClick={() =>
                                handleStatusChange(h._id, 'REJECTED')
                              }
                              className="text-yellow-600 hover:text-yellow-800 text-xs font-semibold mr-3"
                            >
                              🚫 Revoke
                            </button>
                          )}

                          {h.status === 'REJECTED' && (
                            <button
                              onClick={() =>
                                handleStatusChange(h._id, 'APPROVED')
                              }
                              className="text-green-600 hover:text-green-800 text-xs font-semibold mr-3"
                            >
                              ✅ Re-approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(h)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            title="Delete hospital"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;