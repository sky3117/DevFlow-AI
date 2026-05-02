interface ReviewIssue {
  file: string;
  line: number;
  severity: string;
  message: string;
  suggestion: string;
}

interface Props {
  issues: ReviewIssue[];
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-900/60 text-red-300 border-red-700',
  high: 'bg-orange-900/60 text-orange-300 border-orange-700',
  medium: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  low: 'bg-blue-900/60 text-blue-300 border-blue-700',
  info: 'bg-gray-700 text-gray-300 border-gray-600',
};

export default function IssuesList({ issues }: Props) {
  if (issues.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No issues found — great code! 🎉</p>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, idx) => (
        <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span
              className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.info
              }`}
            >
              {issue.severity}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-blue-400 text-xs bg-blue-900/30 px-1.5 py-0.5 rounded">
                  {issue.file}:{issue.line}
                </code>
              </div>
              <p className="text-gray-200 text-sm mt-1">{issue.message}</p>
              {issue.suggestion && (
                <p className="text-gray-400 text-sm mt-1">
                  <span className="text-green-400 font-medium">💡 </span>
                  {issue.suggestion}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
