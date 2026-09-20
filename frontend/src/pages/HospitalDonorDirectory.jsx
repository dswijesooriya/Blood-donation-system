import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna',
  'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura', 'Batticaloa',
];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDonorDirectory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [district, setDistrict] = useState(user?.district || '');
  const [bloodType, setBloodType] = useState('');
  const [search, setSearch] = useState('');

  const loadDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (bloodType && bloodType !== 'All Blood Groups') {
        params.append('bloodType', bloodType);
      }
      if (search) params.append('search', search);

      const res = await api.get(`/hospitals/donors?${params.toString()}`);
      setDonors(res.data);
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district, bloodType, search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearFilters = () => {
    setDistrict('');
    setBloodType('');
    setSearch('');
  };

  const getTimeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold text-red-600">BloodLife</span>
            <span className="ml-4 text-sm text-gray-500 hidden sm:inline">
              Hospital › Donor Directory
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/hospital/dashboard"
              className="text-sm text-gray-600 hover:text-red-600 font-semibold hidden sm:inline"
            >
              ← Dashboard
            </Link>
            <span className="text-sm text-gray-600 hidden sm:inline">
              📍 {user?.district}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 font-semibold hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Registered Donors
          </h1>
          <p className="text-gray-500 mt-1">
            View donors in your district (filtered by blood group).
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Donor Privacy Protected
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Personal information (full name, NIC, email) is hidden to
              preserve donor privacy. Contact numbers are only visible after
              you post a blood request they respond to.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-field">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="input-field"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Blood Group</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="input-field"
              >
                <option value="">All Blood Groups</option>
                {BLOOD_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by contact number..."
                className="input-field"
              />
            </div>
          </div>

          {(district || bloodType || search) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                🔍 {donors.length} donor{donors.length === 1 ? '' : 's'} found
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Donor Table */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No donors found
              </h3>
              <p className="text-gray-500 mb-4">
                {district || bloodType || search
                  ? 'Try adjusting your filters.'
                  : 'No donors have registered in this district yet.'}
              </p>
              {(district || bloodType || search) && (
                <button
                  onClick={clearFilters}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        DONOR ID
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        BLOOD GROUP
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        DISTRICT
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        CONTACT
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        Eligibility STATUS
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        REGISTERED
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor) => (
                      <tr
                        key={donor._id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {donor._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold px-3 py-1 rounded text-sm ${
                              donor.bloodType === 'O-'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-50 text-red-600'
                            }`}
                            title={
                              donor.bloodType === 'O-'
                                ? 'Universal donor'
                                : ''
                            }
                          >
                            {donor.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {donor.district}
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`tel:${donor.contactNumber}`}
                            className="text-red-600 font-semibold hover:underline"
                            title="Click to call"
                          >
                            📞 {donor.contactNumber}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          {donor.isEligible ? (
                            <span className="inline-flex items-center gap-1 text-green-700 text-sm font-semibold">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 text-sm font-semibold">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Unavailable
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {getTimeAgo(donor.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                <span>
                  Showing {donors.length} donor{donors.length === 1 ? '' : 's'}
                </span>
                <span className="text-gray-400">
                  Sorted by most recent
                </span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HospitalDonorDirectory;