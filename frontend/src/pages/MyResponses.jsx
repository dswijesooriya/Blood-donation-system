import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: '⏳',
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '❌',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '🎉',
  },
};

const MyResponses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api
      .get('/requests/my-responses')
      .then((res) => setResponses(res.data))
      .catch((err) => console.error('Failed to load responses:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusCounts = () => {
    return {
      ALL: responses.length,
      PENDING: responses.filter((r) => r.status === 'PENDING').length,
      ACCEPTED: responses.filter((r) => r.status === 'ACCEPTED').length,
      COMPLETED: responses.filter((r) => r.status === 'COMPLETED').length,
    };
  };

  const counts = getStatusCounts();

  const filteredResponses =
    filter === 'ALL'
      ? responses
      : responses.filter((r) => r.status === filter);

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold text-red-600">BloodLife</span>
            <span className="ml-4 text-sm text-gray-500 hidden sm:inline">
              Portal › My Responses
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Responses</h1>
          <p className="text-gray-500 mt-1">
            Track all the blood requests you've responded to.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              What happens after I respond?
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              The hospital reviews your response and marks it as{' '}
              <strong>Accepted</strong> when they'll contact you, or{' '}
              <strong>Completed</strong> after you've donated.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              filter === 'PENDING'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏳ Pending ({counts.PENDING})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              filter === 'ACCEPTED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ Accepted ({counts.ACCEPTED})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              filter === 'COMPLETED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎉 Completed ({counts.COMPLETED})
          </button>
        </div>

        {/* Responses List */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading your responses...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">
              {filter === 'ALL' ? '💤' : '🔍'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'ALL'
                ? 'No responses yet'
                : `No ${filter.toLowerCase()} responses`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'ALL'
                ? 'When you respond to blood requests, they will show up here.'
                : `Try switching to a different filter.`}
            </p>
            {filter === 'ALL' && (
              <Link to="/donor/dashboard" className="btn-primary text-sm py-2 px-4">
                Browse Requests
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResponses.map((response) => {
              const status = STATUS_CONFIG[response.status] || STATUS_CONFIG.PENDING;
              const request = response.request;

              if (!request) return null;

              return (
                <div
                  key={response._id}
                  className={`card border-l-4 ${status.border} hover:shadow-lg transition-shadow`}
                >
                  {/* Top row: Blood type + Status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold px-4 py-2 rounded-lg text-lg ${
                          request.bloodType === user?.bloodType
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {request.bloodType}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {request.unitsNeeded} unit
                          {request.unitsNeeded > 1 ? 's' : ''} needed
                        </p>
                        <p className="text-sm text-gray-500">
                          Posted {getTimeAgo(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text} whitespace-nowrap`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Hospital info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span>🏥</span>
                      <span className="font-semibold text-gray-900">
                        {request.hospital?.hospitalName || 'Hospital'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        📍 {request.district}
                      </span>
                      {request.hospital?.contactNumber && (
                        <a
                          href={`tel:${request.hospital.contactNumber}`}
                          className="text-red-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          📞 {request.hospital.contactNumber}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Urgency + Date responded */}
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Urgency:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          request.urgencyStatus === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {request.urgencyStatus?.toUpperCase() || 'LOW'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      You responded {getTimeAgo(response.createdAt)}
                    </span>
                  </div>

                  {/* Success message for accepted/completed */}
                  {response.status === 'ACCEPTED' && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                      ✅ <strong>Accepted!</strong> The hospital will contact
                      you soon. Please stay available.
                    </div>
                  )}
                  {response.status === 'COMPLETED' && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                      🎉 <strong>Thank you for donating!</strong> Your blood has
                      helped save lives.
                    </div>
                  )}
                  {response.status === 'REJECTED' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      ❌ This response was not selected. The hospital may have
                      found other donors.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyResponses;