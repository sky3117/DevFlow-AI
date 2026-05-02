import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import Navbar from '../components/Navbar';

interface Plan {
  id: string;
  name: string;
  price: number;
  seats: number;
  description: string;
}

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    '5 team seats',
    'AI PR reviews',
    'Auto documentation',
    '100 reviews / month',
    'Email support',
  ],
  pro: [
    '25 team seats',
    'Everything in Starter',
    '1,000 reviews / month',
    'Priority support',
    'Analytics dashboard',
  ],
  enterprise: [
    'Unlimited seats',
    'Everything in Pro',
    'Unlimited reviews',
    'Dedicated support',
    'SLA & custom contracts',
  ],
};

export default function BillingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Plan[]>('/billing/plans', {}, token)
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    setError(null);
    try {
      const { url } = await apiFetch<{ url: string }>(
        '/billing/create-checkout-session',
        { method: 'POST', body: JSON.stringify({ plan: planId }) },
        token
      );
      if (url) window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Plans & Pricing</h1>
          <p className="text-gray-400">Upgrade your team and unlock more AI-powered reviews.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 text-center py-20 animate-pulse">Loading plans…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.id === 'pro';
              const features = PLAN_FEATURES[plan.id] ?? [];
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-gray-800 rounded-2xl p-6 border ${
                    isPopular ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                    <div className="mt-4 flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                      <span className="text-gray-400 mb-1">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-8">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-green-400 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {upgrading === plan.id ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-8">
          All plans include a 14-day free trial. Cancel anytime.{' '}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </p>
      </main>
    </div>
  );
}
