'use client';

import Image from 'next/image';

export interface PreviewItem {
  pageName: string;
  screenshotPath?: string;
  htmlPath?: string;
  issues: string[];
}

export interface PreviewComparisonProps {
  previews: PreviewItem[];
  designSpecName: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function PreviewComparison({
  previews,
  designSpecName,
  onApprove,
  onReject,
}: PreviewComparisonProps) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Page Preview</h1>
        <p className="text-gray-600">
          Design System: {designSpecName}
        </p>
      </div>

      <div className="space-y-8">
        {previews.map((preview) => (
          <div key={preview.pageName} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
              <span className="font-medium">{preview.pageName}</span>
              {preview.issues.length > 0 && (
                <span className="text-red-500 text-sm">
                  {preview.issues.length} issue(s)
                </span>
              )}
            </div>

            {preview.screenshotPath ? (
              <div className="relative">
                <Image
                  src={preview.screenshotPath}
                  alt={`${preview.pageName} preview`}
                  width={1200}
                  height={800}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-8 text-center text-gray-500">
                Preview not available
              </div>
            )}

            {preview.issues.length > 0 && (
              <div className="bg-red-50 px-4 py-2 text-sm text-red-700">
                {preview.issues.map((issue, i) => (
                  <div key={i}>⚠️ {issue}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={onApprove}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Approve & Continue
        </button>
        <button
          onClick={() => onReject('Need modifications')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
