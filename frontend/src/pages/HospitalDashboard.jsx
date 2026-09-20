// ============================================================
// HOSPITAL DASHBOARD — Polished UI
// ============================================================
// Includes:
//   - Glassmorphism navbar (fixed top)
//   - Gradient greeting header
//   - 4 animated stat cards with hover effects
//   - Charts section
//   - Active / History toggle
//   - Two tables (active requests + completed history)
//   - Modals: Create, Edit, View Responses
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CreateRequestModal from '../components/CreateRequestModal';
import EditRequestModal from '../components/EditRequestModal';
import ViewResponsesModal from '../components/ViewResponsesModal';
import {
  ResponseStatusChart,
  RequestsByDayChart,
  ChartCard,
} from '../components/Charts';

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------

  // Stats shown in the top cards
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    criticalRequests: 0,
    completedRequests: 0,
  });

  // Active requests (unfulfilled) shown in the Active table
  const [recentRequests, setRecentRequests] = useState([]);

  // Completed requests with donation details shown in History
  const [historyRequests, setHistoryRequests] = useState([]);

  // Chart data (donut + bar)
  const [chartData, setChartData] = useState(null);

  // Loading flags for each section
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState('');

  // 'ACTIVE' or 'HISTORY' — controls which table is visible
  const [view, setView] = useState('ACTIVE');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [viewRequestId, setViewRequestId] = useState(null);

  // ------------------------------------------------------------
  // DATA LOADERS
  // ------------------------------------------------------------

  // Loads stats + charts + active requests in one go
  const loadDashboard = () => {
    setLoading(true);
    Promise.all([
      api.get('/hospitals/dashboard-stats'),
      api.get('/hospitals/chart-stats'),
    ])
      .then(([statsRes, chartsRes]) => {
        setStats(statsRes.data.stats);
        setRecentRequests(statsRes.data.recentRequests);
        setChartData(chartsRes.data);
      })
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  };

  // Loads completed request history (called lazily when user opens History)
  const loadHistory = () => {
    setHistoryLoading(true);
    api
      .get('/hospitals/request-history')
      .then((res) => setHistoryRequests(res.data))
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setHistoryLoading(false));
  };

  // Initial load on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  // Lazy-load history the first time the user switches to it
  useEffect(() => {
    if (view === 'HISTORY' && historyRequests.length === 0) {
      loadHistory();
    }
  }, [view]);

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Refresh active + clear history cache (forces reload next view switch)
  const refreshAll = () => {
    loadDashboard();
    if (view === 'HISTORY') {
      loadHistory();
    } else {
      setHistoryRequests([]);
    }
  };

  const handleRequestCreated = () => {
    refreshAll();
    showToast('✅ Blood request created and donors notified!');
  };

  const handleRequestUpdated = () => {
    refreshAll();
    showToast('✏️ Request updated successfully.');
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Delete this blood request? This cannot be undone.'))
      return;
    try {
      await api.delete(`/requests/${requestId}`);
      refreshAll();
      showToast('🗑️ Request deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ============================================================
          NAVBAR — glassmorphism fixed top
          ============================================================ */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: brand + portal label */}
          <div className="flex items-center gap-3">
            <Link to="/hospital/dashboard" className="flex items-center gap-2 group">
              <span className="text-2xl animate-heartbeat">🩸</span>
              <span className="text-xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                BloodLife
              </span>
            </Link>
            <span className="hidden md:inline text-sm text-gray-500 pl-3 border-l border-gray-200">
              Hospital: {user?.name || 'Hospital'}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/hospital/donors"
              className="text-sm text-gray-700 hover:text-red-600 font-semibold hidden sm:inline transition-colors"
            >
              👥 Donor Directory
            </Link>
            <span className="text-sm text-gray-600 hidden md:inline">
              📍 {user?.district || 'Unknown'}
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

      {/* ============================================================
          TOAST
          ============================================================ */}
      {toast && (
        <div className="fixed top-20 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl z-40 animate-fade-in">
          {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ============================================================
            WELCOME HEADER
            ============================================================ */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Welcome,{' '}
              <span className="text-gradient">{user?.name || 'Hospital'}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your blood requests and reach donors instantly.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap flex items-center gap-2 group"
          >
            <span className="text-lg">+</span>
            Create New Request
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* ============================================================
            STATS CARDS — 4 colorful cards with icons
            ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div
            className="card hover-lift group animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                📋
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Total
              </span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">
              {stats.totalRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time requests</p>
          </div>

          {/* Active */}
          <div
            className="card hover-lift group animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                💧
              </div>
              <span className="text-xs font-semibold text-blue-500 uppercase">
                Active
              </span>
            </div>
            <p className="text-3xl font-extrabold text-blue-600">
              {stats.activeRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting donors</p>
          </div>

          {/* Critical */}
          <div
            className="card hover-lift group animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                🚨
              </div>
              <span className="text-xs font-semibold text-red-500 uppercase">
                Critical
              </span>
            </div>
            <p className="text-3xl font-extrabold text-red-600">
              {stats.criticalRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">Urgent requests</p>
          </div>

          {/* Completed */}
          <div
            className="card hover-lift group animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                ✅
              </div>
              <span className="text-xs font-semibold text-green-500 uppercase">
                Done
              </span>
            </div>
            <p className="text-3xl font-extrabold text-green-600">
              {stats.completedRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">Fulfilled</p>
          </div>
        </div>

        {/* ============================================================
            CHARTS SECTION
            ============================================================ */}
        {chartData && (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <ChartCard
              title="Donor Responses"
              subtitle="How donors are responding to your requests"
            >
              <ResponseStatusChart data={chartData.responsesByStatus} />
            </ChartCard>

            <ChartCard
              title="Activity — Last 7 Days"
              subtitle="Requests you posted each day"
            >
              <RequestsByDayChart data={chartData.requestsByDay} />
            </ChartCard>
          </div>
        )}

        {/* ============================================================
            VIEW TOGGLE — Active / History
            ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'ACTIVE' ? 'Active Requests' : 'Request History'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {view === 'ACTIVE'
                ? 'Requests you are currently seeking donors for'
                : 'Completed donations and archived requests'}
            </p>
          </div>

          {/* Pill toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('ACTIVE')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                view === 'ACTIVE'
                  ? 'bg-white shadow text-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💧 Active
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  view === 'ACTIVE'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stats.activeRequests}
              </span>
            </button>
            <button
              onClick={() => setView('HISTORY')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                view === 'HISTORY'
                  ? 'bg-white shadow text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✅ History
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  view === 'HISTORY'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stats.completedRequests}
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================
            ACTIVE REQUESTS TABLE
            ============================================================ */}
        {view === 'ACTIVE' && (
          <div className="card overflow-hidden p-0 animate-fade-in">
            {loading ? (
              // Skeleton-style loader
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading requests...</p>
              </div>
            ) : recentRequests.length === 0 ? (
              // Empty state
              <div className="text-center py-16 px-6">
                <div className="text-6xl mb-4">💤</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  All caught up!
                </h3>
                <p className="text-gray-500 mb-6">
                  No active requests right now.
                </p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="btn-primary text-sm py-2 px-5"
                >
                  + Create New Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Blood
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Units
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Responses
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-t border-gray-100 hover:bg-red-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm">
                            {req.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          {req.unitsNeeded}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          📍 {req.district}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              req.urgencyStatus === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {req.urgencyStatus === 'critical' && (
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                            )}
                            {req.urgencyStatus?.toUpperCase() || 'LOW'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewRequestId(req._id)}
                            className={`font-bold text-sm px-3 py-1 rounded-lg transition ${
                              req.responseCount > 0
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {req.responseCount || 0} donor
                            {req.responseCount === 1 ? '' : 's'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditRequest(req)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-3 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            HISTORY TABLE
            ============================================================ */}
        {view === 'HISTORY' && (
          <div className="card overflow-hidden p-0 animate-fade-in">
            {historyLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading history...</p>
              </div>
            ) : historyRequests.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No completed requests yet
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  When a donor completes a donation, the request and its
                  details will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Blood
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Units
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-t border-gray-100 hover:bg-green-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm">
                            {req.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          {req.unitsNeeded}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          📍 {req.district}
                        </td>
                        <td className="px-6 py-4">
                          {req.donation ? (
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {req.donation.donorName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {req.donation.donorDistrict}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No donor recorded
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {req.donation?.donorContact ? (
                            <a
                              href={`tel:${req.donation.donorContact}`}
                              className="text-red-600 hover:underline text-sm font-semibold"
                            >
                              📞 {req.donation.donorContact}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {req.donation?.completedAt ? (
                            <div>
                              <p className="text-sm text-gray-700 font-medium">
                                {formatDate(req.donation.completedAt)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  req.donation.completedAt
                                ).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            ✅ Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================
          MODALS
          ============================================================ */}
      <CreateRequestModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleRequestCreated}
        defaultDistrict={user?.district}
      />

      <EditRequestModal
        isOpen={!!editRequest}
        onClose={() => setEditRequest(null)}
        onSuccess={handleRequestUpdated}
        request={editRequest}
      />

      <ViewResponsesModal
        isOpen={!!viewRequestId}
        onClose={() => {
          setViewRequestId(null);
          refreshAll();
        }}
        requestId={viewRequestId}
      />
    </div>
  );
};

export default HospitalDashboard;