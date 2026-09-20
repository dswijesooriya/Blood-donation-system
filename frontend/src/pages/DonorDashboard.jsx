import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BloodTypeChart,
  ResponsesOverTimeChart,
  ChartCard,
} from '../components/Charts';
import Navbar from '../components/Navbar';


const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [eligibility, setEligibility] = useState(null);

  const loadData = async () => {
    try {
      const [requestsRes, responsesRes, notifRes, chartsRes, profileRes] =
  await Promise.all([
    api.get('/requests/public'),
    api.get('/requests/my-responses'),
    api.get('/notifications'),
    api.get('/donors/chart-stats'),
    api.get('/donors/profile'),
  ]);
setRequests(requestsRes.data);
setMyResponses(responsesRes.data);
setUnreadCount(notifRes.data.filter((n) => !n.isRead).length);
setChartData(chartsRes.data);
setEligibility({
  isEligible: profileRes.data.isEligible,
  daysUntilEligible: profileRes.data.daysUntilEligible || 0,
  nextEligibleDate: profileRes.data.nextEligibleDate,
  lastDonationDate: profileRes.data.lastDonationDate,
});
      
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRespond = async (requestId) => {
    if (!window.confirm('Confirm: I can donate to this request.')) return;
    try {
      await api.post(`/requests/${requestId}/respond`);
      setToast('❤️ Thank you! The hospital has been notified.');
      setTimeout(() => setToast(''), 4000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond.');
    }
  };

  const hasResponded = (requestId) => {
    return myResponses.some((r) => r.request?._id === requestId);
  };

  const normalizeDistrict = (d) => (d || '').trim().toLowerCase();
  const donorDistrict = normalizeDistrict(user?.district);

  const matchingRequests = requests.filter(
    (r) => normalizeDistrict(r.district) === donorDistrict
  );
  const otherRequests = requests.filter(
    (r) => normalizeDistrict(r.district) !== donorDistrict
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============ NAVBAR ============ */}
      <Navbar
  portalLabel="Donor Dashboard"
  unreadCount={unreadCount}
  menuItems={[
    { to: '/donor/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/donor/responses', label: 'My Responses', icon: '❤️' },
    { to: '/donor/donations', label: 'Donation History', icon: '🩸' },
    { to: '/donor/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    { to: '/donor/profile', label: 'My Profile', icon: '👤' },
  ]}
/>

      {/* ============ TOAST ============ */}
      {toast && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg z-40">
          {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ============ WELCOME HEADER ============ */}
        <div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900">
    Welcome back,{' '}
    <span className="text-red-600">
      {user?.name?.split(' ')[0] || 'Donor'}!
    </span>
  </h1>
  <p className="text-gray-500 mt-1">Thank you for being a life saver.</p>
</div>

{/* ============ ELIGIBILITY BANNER ============ */}
{eligibility && !eligibility.isEligible && (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-start gap-4">
    <div className="text-4xl flex-shrink-0">⏳</div>
    <div className="flex-1">
      <h3 className="font-bold text-amber-900">
        You're currently resting from your last donation
      </h3>
      <p className="text-sm text-amber-800 mt-1">
        You last donated on{' '}
        <strong>
          {new Date(eligibility.lastDonationDate).toLocaleDateString()}
        </strong>
        . Medical guidelines recommend 90 days between donations.
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-3">
        <div className="bg-white rounded-lg px-4 py-2 border border-amber-200">
          <p className="text-xs text-amber-700 font-semibold">
            ELIGIBLE IN
          </p>
          <p className="text-2xl font-extrabold text-amber-900">
            {eligibility.daysUntilEligible} days
          </p>
        </div>
        {eligibility.nextEligibleDate && (
          <div className="bg-white rounded-lg px-4 py-2 border border-amber-200">
            <p className="text-xs text-amber-700 font-semibold">
              NEXT ELIGIBLE DATE
            </p>
            <p className="text-sm font-bold text-amber-900">
              {new Date(eligibility.nextEligibleDate).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* ============ ELIGIBLE BANNER (positive) ============ */}
{eligibility && eligibility.isEligible && (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
    <div className="text-3xl">✅</div>
    <div>
      <h3 className="font-bold text-green-900">You're eligible to donate!</h3>
      <p className="text-sm text-green-700">
        Respond to any matching request below to help save lives.
      </p>
    </div>
  </div>
)}

        {/* ============ INFO CARDS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              BLOOD GROUP
            </p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">
                {user?.bloodType || 'O+'}
              </span>
              <span className="text-3xl">🩸</span>
            </div>
          </div>

          <div className="card">
            <p className="text-xs font-semibold text-gray-500 mb-1">DISTRICT</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {user?.district || 'N/A'}
              </span>
              <span className="text-3xl">📍</span>
            </div>
          </div>

          <Link
            to="/donor/responses"
            className="card hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
          >
            <p className="text-xs font-semibold text-gray-500 mb-1">
              MY RESPONSES
            </p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">
                {myResponses.length}
              </span>
              <span className="text-3xl">❤️</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">View all →</p>
          </Link>
        </div>

        {/* ============ CHARTS SECTION ============ */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title={`${user?.district || 'Your District'} Blood Types`}
              subtitle="Donors available in your area"
            >
              <BloodTypeChart data={chartData.bloodTypeDistribution} />
            </ChartCard>

            <ChartCard
              title="Your Activity"
              subtitle="Responses you've made over the last 6 months"
            >
              <ResponsesOverTimeChart data={chartData.responsesByMonth} />
            </ChartCard>
          </div>
        )}

        {/* ============ MATCHING REQUESTS (SAME DISTRICT) ============ */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold">
              🚨 Requests in {user?.district || 'your district'}
            </h2>
            <span className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full">
              {matchingRequests.length} active
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : matchingRequests.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No active requests in your district right now.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      HOSPITAL
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      BLOOD
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      UNITS
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      URGENCY
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matchingRequests.map((req) => (
                    <tr key={req._id} className="border-b border-gray-50">
                      <td className="py-3 font-medium">
                        {req.hospital?.hospitalName || 'N/A'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-bold px-3 py-1 rounded text-sm ${
                            req.bloodType === user?.bloodType
                              ? 'bg-red-600 text-white'
                              : 'bg-red-50 text-red-600'
                          }`}
                          title={
                            req.bloodType === user?.bloodType
                              ? 'This matches your blood type!'
                              : ''
                          }
                        >
                          {req.bloodType}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700 font-semibold">
                        {req.unitsNeeded}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            req.urgencyStatus === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {req.urgencyStatus?.toUpperCase() || 'LOW'}
                        </span>
                      </td>
                      <td className="py-3">
                        {hasResponded(req._id) ? (
                          <span className="text-green-600 font-semibold text-sm">
                            ✅ Responded
                          </span>
                        ) : (
                          <button
  onClick={() => handleRespond(req._id)}
  disabled={!eligibility?.isEligible}
  className={`text-white text-xs font-bold px-4 py-2 rounded-lg transition ${
    eligibility?.isEligible
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-gray-400 cursor-not-allowed'
  }`}
  title={
    !eligibility?.isEligible
      ? `Not eligible for ${eligibility?.daysUntilEligible} more days`
      : ''
  }
>
  {eligibility?.isEligible ? '❤️ I Can Donate' : '⏳ Not Eligible'}
</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============ OTHER DISTRICT REQUESTS ============ */}
        {otherRequests.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold">🌍 Other Districts</h2>
              <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-3 py-1 rounded-full">
                {otherRequests.length} requests
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      HOSPITAL
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      BLOOD
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      DISTRICT
                    </th>
                    <th className="py-3 text-xs font-semibold text-gray-500">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {otherRequests.map((req) => (
                    <tr key={req._id} className="border-b border-gray-50">
                      <td className="py-3">
                        {req.hospital?.hospitalName || 'N/A'}
                      </td>
                      <td className="py-3">
                        <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded text-sm">
                          {req.bloodType}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{req.district}</td>
                      <td className="py-3">
                        {hasResponded(req._id) ? (
                          <span className="text-green-600 font-semibold text-sm">
                            ✅ Responded
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRespond(req._id)}
                            className="bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                          >
                            ❤️ Donate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ EMPTY STATE ============ */}
        {!loading && requests.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">💤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No active requests
            </h3>
            <p className="text-gray-500">
              All hospitals have sufficient blood stock. Check back later!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorDashboard;