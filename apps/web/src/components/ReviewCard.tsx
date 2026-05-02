import { Link } from 'react-router-dom';

interface Review {
  id: string;
  prUrl: string;
  prTitle: string;
  score: number;
  summary: string;
  approved: boolean;
  createdAt: string;
}

interface Props {
  review: Review;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-green-900/60 text-green-400 border-green-700'
      : score >= 60
      ? 'bg-yellow-900/60 text-yellow-400 border-yellow-700'
      : 'bg-red-900/60 text-red-400 border-red-700';

  return (
    <div className={`text-2xl font-bold px-3 py-1 rounded-lg border ${color}`}>{score}</div>
  );
}

export default function ReviewCard({ review }: Props) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/review/${review.id}`}
            className="text-white font-semibold hover:text-blue-400 transition-colors line-clamp-1"
          >
            {review.prTitle}
          </Link>
          <a
            href={review.prUrl}
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-gray-400 text-xs truncate block mt-0.5"
          >
            {review.prUrl}
          </a>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{review.summary}</p>

          <div className="flex items-center gap-3 mt-3">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                review.approved
                  ? 'bg-green-900/50 text-green-400'
                  : 'bg-red-900/50 text-red-400'
              }`}
            >
              {review.approved ? '✅ Approved' : '❌ Changes Requested'}
            </span>
            <span className="text-gray-600 text-xs">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-center">
          <ScoreBadge score={review.score} />
          <div className="text-gray-600 text-xs mt-1">score</div>
        </div>
      </div>
    </div>
  );
}
