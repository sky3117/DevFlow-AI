import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import Navbar from '../components/Navbar';

type Style = 'jsdoc' | 'docstring' | 'markdown';

interface DocsResult {
  docs: string;
  coverage: number;
}

export default function DocsPage() {
  const { token } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [style, setStyle] = useState<Style>('jsdoc');
  const [result, setResult] = useState<DocsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiFetch<DocsResult>(
        '/api/docs/generate',
        {
          method: 'POST',
          body: JSON.stringify({ code, language, style }),
        },
        token
      );
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.docs) return;
    try {
      await navigator.clipboard.writeText(result.docs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Auto Documentation Generator</h1>
        <p className="text-gray-400 mb-6">
          Paste your code and get AI-generated documentation instantly.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="flex gap-3">
              {/* Language */}
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['typescript', 'javascript', 'python', 'go', 'java', 'rust', 'c++'].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as Style)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="jsdoc">JSDoc</option>
                  <option value="docstring">Docstring</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={18}
                placeholder="Paste your code here…"
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Generating…' : '✨ Generate Documentation'}
            </button>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-gray-400">Generated Documentation</label>
              <div className="flex items-center gap-3">
                {result && (
                  <span className="text-xs font-medium text-green-400">
                    Coverage: {result.coverage}%
                  </span>
                )}
                {result && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[420px] max-h-[600px] overflow-auto">
              {!result && !loading && (
                <p className="text-gray-500 text-sm italic">Output will appear here…</p>
              )}
              {loading && (
                <p className="text-gray-400 text-sm animate-pulse">Calling Groq AI…</p>
              )}
              {result && (
                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-words">
                  {result.docs}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
