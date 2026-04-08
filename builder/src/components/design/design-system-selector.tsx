'use client';

import { useState } from 'react';

export interface BrandInfo {
  name: string;
  description: string;
  suitableFor?: string;
}

export interface DesignSystemSelectorProps {
  brands: BrandInfo[];
  onSelect: (brand: string) => void;
  onMix?: (brands: string[]) => void;
  allBrands?: string[];
}

export function DesignSystemSelector({
  brands,
  onSelect,
  onMix,
  allBrands = [],
}: DesignSystemSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showMix, setShowMix] = useState(false);

  const handleToggle = (name: string) => {
    setSelected(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Select Design System</h1>

      {!showMix ? (
        <>
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Recommended design systems based on your requirements:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => onSelect(brand.name)}
              >
                <h3 className="font-semibold text-lg">{brand.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{brand.description}</p>
                {brand.suitableFor && (
                  <p className="text-gray-500 text-xs mt-2">
                    Best for: {brand.suitableFor}
                  </p>
                )}
              </div>
            ))}
          </div>

          {onMix && allBrands.length > 0 && (
            <div className="border-t pt-6">
              <button
                onClick={() => setShowMix(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Or mix multiple design systems →
              </button>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="font-semibold">Mix Design Systems</h2>
            <p className="text-gray-600 text-sm">
              Select multiple design systems to mix their styles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {allBrands.slice(0, 30).map((brand) => (
              <button
                key={brand}
                onClick={() => handleToggle(brand)}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  selected.includes(brand)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onMix && onMix(selected)}
              disabled={selected.length < 2}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Mix Selected ({selected.length})
            </button>
            <button
              onClick={() => setShowMix(false)}
              className="px-6 py-2 border rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
