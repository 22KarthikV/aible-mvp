/**
 * Expiring Soon Widget Component
 *
 * Displays inventory items expiring within 7 days with urgency indicators.
 * Red: expires today, Amber: 1-3 days, Yellow: 4-7 days
 */

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { InventoryItemWithStatus } from '../../types/database';

interface ExpiringSoonWidgetProps {
  items: InventoryItemWithStatus[];
  loading?: boolean;
}

export function ExpiringSoonWidget({ items, loading }: ExpiringSoonWidgetProps) {
  const navigate = useNavigate();

  // Filter items expiring within 7 days
  const expiringItems = items
    .filter(
      (item) =>
        item.days_until_expiry !== null &&
        item.days_until_expiry >= 0 &&
        item.days_until_expiry <= 7
    )
    .slice(0, 5); // Max 5 items

  /**
   * Get urgency color based on days until expiry
   */
  const getUrgencyColor = (days: number | null): string => {
    if (days === null || days < 0) return 'text-gray-600 bg-gray-100';
    if (days === 0) return 'text-red-700 bg-red-100';
    if (days <= 3) return 'text-amber-700 bg-amber-100';
    return 'text-yellow-700 bg-yellow-100';
  };

  /**
   * Get urgency badge text
   */
  const getUrgencyText = (days: number | null): string => {
    if (days === null || days < 0) return 'Unknown';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Expiring Soon
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Expiring Soon
        </h3>
        {expiringItems.length > 0 && (
          <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {expiringItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">🎉</span>
          </div>
          <p className="text-gray-600 font-medium">All fresh!</p>
          <p className="text-sm text-gray-500 mt-1">No items expiring soon</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto max-h-80">
          {expiringItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              onClick={() => navigate('/inventory')}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 capitalize">{item.location}</p>
              </div>
              <div className="ml-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${getUrgencyColor(
                    item.days_until_expiry
                  )}`}
                >
                  {getUrgencyText(item.days_until_expiry)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {expiringItems.length > 0 && (
        <button
          onClick={() => navigate('/inventory')}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <span>View All in Inventory</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
