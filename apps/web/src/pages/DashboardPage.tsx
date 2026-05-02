import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function DashboardPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Review[]>('/api/reviews', {}, token)
      .then(setReviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">PR Reviews</h1>
          <Link
            to="/docs"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ✨ Generate Docs
          </Link>
        </div>

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
