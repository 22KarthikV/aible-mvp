/**
 * Quick Stats Widget Component
 *
 * Displays 4 mini stat cards in a grid layout
 */

import { Package, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import type { InventoryItemWithStatus } from '../../types/database';
import { startOfWeek } from 'date-fns';

interface QuickStatsWidgetProps {
  items: InventoryItemWithStatus[];
  shoppingTrips: number;
  loading?: boolean;
}

export function QuickStatsWidget({ items, shoppingTrips, loading }: QuickStatsWidgetProps) {
  // Calculate stats
  const totalValue = items.length * 12.5; // Estimated average value per item
  const thisWeekStart = startOfWeek(new Date());
  const itemsAddedThisWeek = items.filter(
    (item) => new Date(item.created_at) >= thisWeekStart
  ).length;
  const expiredCount = items.filter((item) => item.expiry_status === 'expired').length;

  const stats = [
    {
      label: 'Total Items',
      value: items.length,
      icon: Package,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Added This Week',
      value: itemsAddedThisWeek,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Expired Items',
      value: expiredCount,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-100',
    },
    {
      label: 'Shopping Trips',
      value: shoppingTrips,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 h-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg transition-all duration-300 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 group cursor-default"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
              <p className="text-xs font-medium text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Inventory value estimate */}
      {totalValue > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Est. Inventory Value</span>
            <span className="text-lg font-bold text-emerald-900">
              ${totalValue.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-emerald-600 mt-1">Based on average pricing</p>
        </div>
      )}
    </div>
  );
}
