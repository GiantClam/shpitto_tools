'use client';

export interface QACheck {
  id: string;
  category: 'color' | 'typography' | 'shadow' | 'spacing' | 'component' | 'accessibility';
  passed: boolean;
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface QAReport {
  passed: boolean;
  score: number;
  checks: QACheck[];
  recommendations: string[];
  summary: string;
}

export interface QAReportViewProps {
  report: QAReport;
  onFixIssue?: (issueId: string) => void;
  onRegenerate?: () => void;
}

export function QAReportView({
  report,
  onFixIssue,
  onRegenerate,
}: QAReportViewProps) {
  const scoreColor = report.score >= 80 
    ? 'text-green-600' 
    : report.score >= 60 
      ? 'text-yellow-600' 
      : 'text-red-600';

  const byCategory = new Map<string, QACheck[]>();
  for (const check of report.checks) {
    const list = byCategory.get(check.category) || [];
    list.push(check);
    byCategory.set(check.category, list);
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 text-center">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {report.score}%
        </div>
        <p className="text-gray-600 mt-2">Design Compliance Score</p>
        
        {report.passed ? (
          <span className="inline-block mt-2 px-4 py-1 bg-green-100 text-green-800 rounded-full">
            ✓ Passed
          </span>
        ) : (
          <span className="inline-block mt-2 px-4 py-1 bg-red-100 text-red-800 rounded-full">
            ✗ Failed
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <p className="text-gray-700">{report.summary}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Check Details</h2>

        {Array.from(byCategory.entries()).map(([category, checks]) => (
          <div key={category} className="border rounded-lg">
            <div className="px-4 py-2 bg-gray-100 font-medium capitalize">
              {category}
            </div>
            <div className="p-4 space-y-2">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={`flex items-start gap-2 ${
                    check.passed ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  <span>{check.passed ? '✅' : '❌'}</span>
                  <span className="flex-1">{check.message}</span>
                  {check.severity === 'critical' && (
                    <span className="text-xs bg-red-200 px-2 py-0.5 rounded">
                      Critical
                    </span>
                  )}
                  {check.severity === 'major' && (
                    <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded">
                      Major
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {report.recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
          <ul className="list-disc list-inside space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-center">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Regenerate
          </button>
        )}
        {onFixIssue && (
          <button
            onClick={() => {
              const firstIssue = report.checks.find(c => !c.passed);
              if (firstIssue) onFixIssue(firstIssue.id);
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fix Issue
          </button>
        )}
      </div>
    </div>
  );
}
