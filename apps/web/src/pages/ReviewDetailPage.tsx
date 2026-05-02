import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import Navbar from '../components/Navbar';
import IssuesList from '../components/IssuesList';

interface ReviewIssue {
  file: string;
  line: number;
  severity: string;
  message: string;
  suggestion: string;
}

interface Review {
  id: string;
  prUrl: string;
  prTitle: string;
  score: number;
  issuesJson: ReviewIssue[];
  summary: string;
  approved: boolean;
  createdAt: string;
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<Review>(`/api/reviews/${id}`, {}, token)
      .then(setReview)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const scoreColor =
    (review?.score ?? 0) >= 80
      ? 'text-green-400'
      : (review?.score ?? 0) >= 60
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="text-blue-400 hover:underline text-sm mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        {loading && (
          <div className="text-gray-400 text-center py-20 animate-pulse">Loading review…</div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {review && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">{review.prTitle}</h1>
                  <a
                    href={review.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    {review.prUrl}
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-4xl font-bold ${scoreColor}`}>{review.score}</div>
                  <div className="text-gray-500 text-xs">/ 100</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded ${
                    review.approved
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {review.approved ? '✅ Approved' : '❌ Changes Requested'}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
              <p className="text-gray-300 leading-relaxed">{review.summary}</p>
            </div>

            {/* Issues */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Issues ({review.issuesJson?.length ?? 0})
              </h2>
              <IssuesList issues={review.issuesJson ?? []} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
