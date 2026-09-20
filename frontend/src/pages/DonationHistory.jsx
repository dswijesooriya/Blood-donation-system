import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DonationHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/requests/my-donations')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Failed to load donations:', err))
      .finally(() => setLoading(false));
  }, []);

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        portalLabel="Donation History"
        menuItems={[
          { to: '/donor/dashboard', label: 'Dashboard', icon: '📊' },
          { to: '/donor/donations', label: 'Donation History', icon: '🩸' },
          { to: '/donor/responses', label: 'My Responses', icon: '❤️' },
          { to: '/donor/profile', label: 'My Profile', icon: '👤' },
        ]}
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Donation History
          </h1>
          <p className="text-gray-500 mt-1">
            Every donation you've made — thank you for saving lives.
          </p>
        </div>

        {/* Stats summary */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-4xl mb-2">🩸</div>
              <p className="text-3xl font-extrabold text-red-600">
                {data.totalDonations}
              </p>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                TOTAL DONATIONS
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-2">
                {data.isEligible ? '✅' : '⏳'}
              </div>
              <p
                className={`text-3xl font-extrabold ${
                  data.isEligible ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {data.isEligible ? 'Yes' : `${data.daysUntilEligible}d`}
              </p>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                {data.isEligible ? 'ELIGIBLE NOW' : 'DAYS UNTIL ELIGIBLE'}
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-2">❤️</div>
              <p className="text-3xl font-extrabold text-red-600">
                {data.totalDonations * 3}
              </p>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                LIVES IMPACTED
              </p>
              <p className="text-xs text-gray-400">
                (estimated 3 per donation)
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading your donation history...</p>
          </div>
        ) : !data || data.totalDonations === 0 ? (
          // Empty state
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No donations yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              When a hospital confirms a completed donation, it will appear
              here. Ready to make your first one?
            </p>
            <Link to="/donor/dashboard" className="btn-primary">
              Browse Requests
            </Link>
          </div>
        ) : (
          // Timeline of donations
          <div className="space-y-3">
            {data.history.map((donation, index) => (
              <div
                key={donation._id || index}
                className="card flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  🩸
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    Donation to {donation.hospitalName || 'Hospital'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {getTimeAgo(donation.date)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm">
                    {user?.bloodType}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {donation.unitsDonated || 1} unit
                    {(donation.unitsDonated || 1) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medical note */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Medical note:</strong> After each whole blood donation,
            donors should wait at least <strong>90 days</strong> before
            donating again. This protects your health and ensures high-quality
            blood for recipients.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DonationHistory;