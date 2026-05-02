import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import Navbar from '../components/Navbar';
import ReviewCard from '../components/ReviewCard';

interface Review {
  id: string;
  prUrl: string;
  prTitle: string;
  score: number;
  summary: string;
  approved: boolean;
  createdAt: string;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function BillingBanner({ type, onDismiss }: { type: 'success' | 'cancelled'; onDismiss: () => void }) {
  if (type === 'success') {
    return (
      <div className="mb-6 flex items-center gap-3 bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
        <span className="text-xl">🎉</span>
        <div className="flex-1">
          <span className="font-semibold">Plan upgraded successfully!</span>
          <span className="text-sm ml-2">Your team now has access to more reviews.</span>
        </div>
        <button onClick={onDismiss} className="text-green-400 hover:text-green-200 text-lg leading-none">×</button>
      </div>
    );
  }
  return (
    <div className="mb-6 flex items-center gap-3 bg-yellow-900/40 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg">
      <span className="text-xl">ℹ️</span>
      <div className="flex-1 text-sm">Billing was cancelled. You can upgrade anytime from the Billing page.</div>
      <button onClick={onDismiss} className="text-yellow-400 hover:text-yellow-200 text-lg leading-none">×</button>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<'success' | 'cancelled' | null>(null);

  // Read ?billing= query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const billing = params.get('billing');
    if (billing === 'success' || billing === 'cancelled') {
      setBillingStatus(billing);
      // Clean URL without reload
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [location.search]);

  useEffect(() => {
    apiFetch<Review[]>('/api/reviews', {}, token)
      .then(setReviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Stats derived from reviews
  const totalReviews = reviews.length;
  const avgScore =
    totalReviews > 0
      ? Math.round(reviews.reduce((acc, r) => acc + r.score, 0) / totalReviews)
      : 0;
  const approvedCount = reviews.filter((r) => r.approved).length;
  const approvalRate =
    totalReviews > 0 ? Math.round((approvedCount / totalReviews) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Billing notification */}
        {billingStatus && (
          <BillingBanner type={billingStatus} onDismiss={() => setBillingStatus(null)} />
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">PR Reviews</h1>
          <Link
            to="/docs"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ✨ Generate Docs
          </Link>
        </div>

        {/* Stats cards */}
        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon="📋"
              label="Total Reviews"
              value={totalReviews}
              color="bg-blue-900/50"
            />
            <StatCard
              icon="⭐"
              label="Avg Score"
              value={avgScore}
              sub="out of 100"
              color="bg-yellow-900/50"
            />
            <StatCard
              icon="✅"
              label="Approval Rate"
              value={`${approvalRate}%`}
              sub={`${approvedCount} approved`}
              color="bg-green-900/50"
            />
          </div>
        )}

        {loading && (
          <div className="text-gray-400 text-center py-20 animate-pulse">Loading reviews…</div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">🤖</div>
            <p className="text-gray-400 text-lg">No reviews yet.</p>
            <p className="text-gray-500 text-sm">
              Connect your GitHub repo and open a PR to get an AI code review.
            </p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
