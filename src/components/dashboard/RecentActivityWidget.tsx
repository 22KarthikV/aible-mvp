/**
 * Recent Activity Widget Component
 *
 * Displays timeline of recently added inventory items
 */

import { useNavigate } from 'react-router-dom';
import { Clock, Package, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { InventoryItemWithStatus } from '../../types/database';

interface RecentActivityWidgetProps {
  items: InventoryItemWithStatus[];
  loading?: boolean;
}

export function RecentActivityWidget({ items, loading }: RecentActivityWidgetProps) {
  const navigate = useNavigate();

  // Get last 5 items by created_at
  const recentItems = [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  /**
   * Format relative time
   */
  const formatRelativeTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  /**
   * Get category icon color
   */
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      dairy: 'text-blue-600 bg-blue-100',
      meat: 'text-red-600 bg-red-100',
      vegetables: 'text-green-600 bg-green-100',
      fruits: 'text-orange-600 bg-orange-100',
      grains: 'text-amber-600 bg-amber-100',
      beverages: 'text-purple-600 bg-purple-100',
    };
    return colors[category.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Recent Activity
        </h3>
      </div>

      {recentItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No recent activity</p>
          <p className="text-sm text-gray-500 mt-1">Add items to see them here</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto max-h-80">
          {recentItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline line */}
              {index < recentItems.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-full bg-gradient-to-b from-emerald-200 to-transparent" />
              )}

              {/* Activity item */}
              <div className="flex gap-3 items-start cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors" onClick={() => navigate('/inventory')}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getCategoryColor(item.category)}`}>
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Added {formatRelativeTime(item.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recentItems.length > 0 && (
        <button
          onClick={() => navigate('/inventory')}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <span>View Inventory</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
