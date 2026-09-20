// ============================================================
// LANDING PAGE — Public entry point for BloodLife
// ============================================================
// This page shows:
//   - A polished marketing hero
//   - Live blood requests pulled from the backend
//   - How-it-works steps
//   - Call-to-action sections
// It is fully public — no login required.
// ============================================================

// React hooks: useEffect for side effects, useState for local state
import { useEffect, useState } from 'react';
// Link provides client-side navigation without page reloads
import { Link } from 'react-router-dom';
// api is our pre-configured axios instance (baseURL + JWT interceptor)
import api from '../api/axios';

const LandingPage = () => {
  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  // requests: array of public blood requests fetched from backend
  const [requests, setRequests] = useState([]);

  // loading: true while the initial fetch is in progress
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------
  // EFFECT: fetch public requests once on mount
  // ------------------------------------------------------------
  useEffect(() => {
    api
      .get('/requests/public')
      // Save the returned array into state
      .then((res) => setRequests(res.data))
      // Log errors so we can debug in the browser console
      .catch((err) => console.error('Failed to load requests:', err))
      // Always turn off loading, even if the request fails
      .finally(() => setLoading(false));
  }, []);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    // Main wrapper. `overflow-x-hidden` prevents blobs from creating
    // a horizontal scrollbar on mobile.
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ============================================================
          NAVBAR — fixed, glassmorphism style
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Brand: heartbeat-pulsing droplet + brand name */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl animate-heartbeat">🩸</span>
            <span className="text-xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
              BloodLife
            </span>
          </Link>

          {/* Anchor links — only visible on medium+ screens */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#requests"
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Blood Requests
            </a>
            <a
              href="#stats"
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Community
            </a>
          </div>

          {/* Right-side actions: Login + Get Started */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register/donor"
              className="btn-primary text-sm py-2 px-4 animate-on-mount"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      {/* `pt-32` pushes content below the fixed navbar. */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Decorative background layers ------------------------- */}
        {/* 1. Dot pattern for subtle texture */}
        <div className="absolute inset-0 bg-dot-pattern bg-dot-md opacity-40" />
        {/* 2. Two blurred blobs in opposite corners */}
        <div className="blob bg-red-200 w-96 h-96 top-0 -left-20" />
        <div className="blob bg-pink-200 w-80 h-80 bottom-0 -right-20" />
        {/* 3. Center radial glow behind hero content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-red-100/40 to-transparent rounded-full blur-3xl" />

        {/* Content layer — z-index above the decorations */}
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* ---------- Left column: text ---------- */}
            <div className="text-center lg:text-left">
              {/* Small badge above headline */}
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full mb-6 animate-on-mount">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-slow" />
                NATIONAL BLOOD NETWORK
              </div>

              {/* Headline with gradient on second line */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.05] mb-6 animate-fade-in-up">
                Small Act,
                <br />
                <span className="text-gradient">Big Impact</span>
              </h1>

              {/* Subtitle. Delay the animation for a staggered feel. */}
              <p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                Be a hero. Donate blood. Help save lives. Connecting voluntary
                blood donors with hospitals across districts — instantly.
              </p>

              {/* Primary CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Link
                  to="/register/donor"
                  className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2 group"
                >
                  Become a Donor
                  {/* Arrow slides right on hover */}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
                <Link
                  to="/register/hospital"
                  className="btn-secondary text-base py-4 px-8 text-center"
                >
                  Register Hospital
                </Link>
              </div>

              {/* Trust indicators */}
              <div
                className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10 text-sm text-gray-500 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>100% Certified Screening</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>12-Min Rapid Onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>

            {/* ---------- Right column: hero visual ---------- */}
            {/* Hidden on mobile, shown on large screens */}
            <div className="relative hidden lg:block">
              {/* Glow behind the circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-200 via-pink-100 to-red-50 rounded-full blur-3xl opacity-60" />

              {/* Main circle with droplet */}
              <div className="relative w-full max-w-md mx-auto aspect-square">
                {/* Red gradient background circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-glow-lg" />

                {/* Center droplet with heartbeat animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-[180px] animate-heartbeat select-none">
                    🩸
                  </div>
                </div>

                {/* Floating badges — three live data points */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 animate-float">
                  <p className="text-xs text-gray-500">Urgent Need</p>
                  <p className="text-sm font-bold text-red-600">O- Negative</p>
                </div>

                <div
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <p className="text-xs text-gray-500">Live Now</p>
                  <p className="text-sm font-bold text-gray-900">
                    {requests.length} Requests
                  </p>
                </div>

                <div
                  className="absolute top-1/2 -right-6 bg-white rounded-xl shadow-lg px-4 py-3 animate-float"
                  style={{ animationDelay: '2s' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-gray-900">
                      Active Network
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS SECTION — three highlight numbers
          ============================================================ */}
      <section
        id="stats"
        className="relative py-20 px-6 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Trusted by a Growing Community
            </h2>
            <p className="text-gray-600">
              Real-time statistics from our blood donation network.
            </p>
          </div>

          {/* Three stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Donors */}
            <div className="card text-center hover-lift group">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                24,850+
              </p>
              <p className="text-sm font-bold text-gray-900">Active Donors</p>
              <p className="text-xs text-gray-500 mt-1">
                Registered community lifesavers
              </p>
            </div>

            {/* Hospitals */}
            <div className="card text-center hover-lift group">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏥</span>
              </div>
              <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                410+
              </p>
              <p className="text-sm font-bold text-gray-900">
                Partner Hospitals
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Connected medical centers
              </p>
            </div>

            {/* Lives saved */}
            <div className="card text-center hover-lift group">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">❤️</span>
              </div>
              <p className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                68,200+
              </p>
              <p className="text-sm font-bold text-gray-900">Lives Saved</p>
              <p className="text-xs text-gray-500 mt-1">
                Successful blood transfusions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — 3-step explainer
          ============================================================ */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-full mb-4">
              SIMPLE PROCESS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Three simple steps connect donors with hospitals in need.
            </p>
          </div>

          {/* Steps grid — the horizontal line is drawn behind on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line (hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-red-200 via-red-400 to-red-200" />

            {/* Step 1 */}
            <div className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-elevated mb-6 z-10">
                <span className="text-4xl">🩸</span>
                {/* Step number badge */}
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-red-500 text-red-600 font-bold rounded-full flex items-center justify-center text-sm">
                  1
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Register as Donor
              </h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Sign up in 2 minutes with your blood type and district. Get
                verified instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-elevated mb-6 z-10">
                <span className="text-4xl">🔔</span>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-red-500 text-red-600 font-bold rounded-full flex items-center justify-center text-sm">
                  2
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Get Notified
              </h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                When hospitals near you need your blood type, receive an
                instant alert.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-elevated mb-6 z-10">
                <span className="text-4xl">❤️</span>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-red-500 text-red-600 font-bold rounded-full flex items-center justify-center text-sm">
                  3
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Donate & Save Lives
              </h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Visit the hospital and donate. Your single donation saves up
                to 3 lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          LIVE REQUESTS SECTION — pulled from backend
          ============================================================ */}
      <section id="requests" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header + "view all" link */}
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                LIVE NOW
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Emergency Blood Requests
              </h2>
              <p className="text-gray-600 mt-2">
                Real-time requests from hospitals across the country.
              </p>
            </div>
            <Link
              to="/login"
              className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View all requests →
            </Link>
          </div>

          {/* Three states: loading / empty / populated */}
          {loading ? (
            // Loading state
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            // Empty state
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                All Clear
              </h3>
              <p className="text-gray-500">
                No active requests right now. Check back later!
              </p>
            </div>
          ) : (
            // Populated state — table of requests
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        HOSPITAL
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        BLOOD TYPE
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        DISTRICT
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        UNITS
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        URGENCY
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Show first 5 requests only — full list is behind login */}
                    {requests.slice(0, 5).map((req) => (
                      <tr
                        key={req._id}
                        className="border-t border-gray-100 hover:bg-red-50/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {req.hospital?.hospitalName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm">
                            {req.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          📍 {req.district}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {req.unitsNeeded} units
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              req.urgencyStatus === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {/* Pulsing dot for critical only */}
                            {req.urgencyStatus === 'critical' && (
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                            )}
                            {req.urgencyStatus?.toUpperCase() || 'LOW'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-1 text-red-600 font-semibold text-sm hover:gap-2 transition-all"
                          >
                            Respond
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer row if there are more than 5 requests */}
              {requests.length > 5 && (
                <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-100">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Login to see all {requests.length} requests →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          FINAL CTA SECTION — bold red banner
          ============================================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Rounded red gradient box with decorative circles */}
          <div className="relative bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl">
            {/* Decorative circles clipped at corners */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Content */}
            <div className="relative">
              <div className="text-6xl mb-6 animate-heartbeat">🩸</div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                Ready to Save a Life?
              </h2>
              <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of donors making a real difference. Your
                donation takes 15 minutes and saves up to 3 lives.
              </p>
              {/* Two CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register/donor"
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  Register Now
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center bg-red-700/50 backdrop-blur text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 transition-colors border border-white/20"
                >
                  I Already Have an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER — dark, multi-column
          ============================================================ */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Four columns of footer links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🩸</span>
                <span className="text-xl font-bold text-white">BloodLife</span>
              </div>
              <p className="text-sm leading-relaxed">
                Connecting donors with hospitals. Saving lives, one donation
                at a time.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/register/donor"
                    className="hover:text-red-400 transition-colors"
                  >
                    Donor Signup
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register/hospital"
                    className="hover:text-red-400 transition-colors"
                  >
                    Hospital Signup
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-red-400 transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources (anchor links) */}
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-red-400 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#requests"
                    className="hover:text-red-400 transition-colors"
                  >
                    Blood Requests
                  </a>
                </li>
                <li>
                  <a
                    href="#stats"
                    className="hover:text-red-400 transition-colors"
                  >
                    Community Stats
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-red-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2024 BloodLife Platform. All rights reserved.</p>
            <p className="text-center md:text-right">
              Made with ❤️ for saving lives
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;