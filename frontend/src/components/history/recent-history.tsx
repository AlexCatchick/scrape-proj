'use client';

import { useViewHistory } from '@/lib/view-history-context';
import { Clock, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface RecentHistoryProps {
  limit?: number;
  showClearAll?: boolean;
}

export function RecentHistory({
  limit = 10,
  showClearAll = true,
}: RecentHistoryProps) {
  const { history, clearHistory, removeFromHistory, getRecentItems } =
    useViewHistory();

  const recentItems = getRecentItems(limit);

  if (recentItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Views</h3>
        </div>
        <p className="text-gray-500 text-sm">
          No recent views yet. Start exploring books!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Views</h3>
        </div>
        {showClearAll && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {recentItems.map((item) => (
          <li key={item.id} className="group">
            <div className="flex items-center gap-3">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-10 h-14 object-cover rounded"
                />
              )}
              {!item.imageUrl && (
                <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs uppercase">
                    {item.entityType[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={item.path}
                  className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-gray-500">
                  {item.entityType.charAt(0).toUpperCase() +
                    item.entityType.slice(1)}{' '}
                  •{' '}
                  {formatDistanceToNow(new Date(item.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <button
                onClick={() => removeFromHistory(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                aria-label="Remove from history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {history.length > limit && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-gray-500 text-center">
            Showing {limit} of {history.length} items
          </p>
        </div>
      )}
    </div>
  );
}
