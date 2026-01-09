'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  currentSearch?: string;
  currentSortBy?: string;
  currentSortOrder?: string;
}

export function ProductFilters({
  currentSearch,
  currentSortBy = 'title',
  currentSortOrder = 'ASC',
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Search Books
        </label>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or author..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <SlidersHorizontal className="inline h-4 w-4 mr-1" />
          Sort By
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleSortChange('title', 'ASC')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              currentSortBy === 'title' && currentSortOrder === 'ASC'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            Title (A-Z)
          </button>
          <button
            onClick={() => handleSortChange('title', 'DESC')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              currentSortBy === 'title' && currentSortOrder === 'DESC'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            Title (Z-A)
          </button>
          <button
            onClick={() => handleSortChange('price', 'ASC')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              currentSortBy === 'price' && currentSortOrder === 'ASC'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            Price (Low to High)
          </button>
          <button
            onClick={() => handleSortChange('price', 'DESC')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              currentSortBy === 'price' && currentSortOrder === 'DESC'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            Price (High to Low)
          </button>
          <button
            onClick={() => handleSortChange('author', 'ASC')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              currentSortBy === 'author'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            Author (A-Z)
          </button>
        </div>
      </div>
    </div>
  );
}
