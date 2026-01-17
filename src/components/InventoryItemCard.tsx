/**
 * Inventory Item Card Component
 *
 * Displays a single inventory item with glassmorphism design.
 * Shows item details, expiry status, and action buttons.
 */

import { useState } from 'react';
import {
  Package,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import type { InventoryItemWithStatus } from '../types/database';
import { getLocationLabel, getLocationIcon } from '../schemas/inventorySchemas';
import { format, formatDistanceToNow } from 'date-fns';

interface InventoryItemCardProps {
  item: InventoryItemWithStatus;
  onEdit: (item: InventoryItemWithStatus) => void;
  onDelete: (itemId: string) => void;
}

export default function InventoryItemCard({
  item,
  onEdit,
  onDelete,
}: InventoryItemCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Get expiry status badge color and icon
   */
  const getExpiryBadge = () => {
    if (!item.expiry_date) {
      return null;
    }

    switch (item.expiry_status) {
      case 'expired':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
          text: 'Expired',
        };
      case 'expiring_soon':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Clock,
          text: `${item.days_until_expiry} day${
            item.days_until_expiry === 1 ? '' : 's'
          } left`,
        };
      case 'fresh':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          text: 'Fresh',
        };
      default:
        return null;
    }
  };

  const expiryBadge = getExpiryBadge();
  const ExpiryIcon = expiryBadge?.icon;

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  /**
   * Get relative time for purchase date
   */
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return null;
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    } else {
      onDelete(item.id);
    }
  };

  return (
    <div
      className={`group relative bg-white/80 backdrop-blur-sm border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
        item.expiry_status === 'expired'
          ? 'border-red-200 hover:border-red-300'
          : item.expiry_status === 'expiring_soon'
          ? 'border-amber-200 hover:border-amber-300'
          : 'border-emerald-100 hover:border-emerald-300'
      }`}
    >
      {/* Expiry Status Badge - Top Right */}
      {expiryBadge && ExpiryIcon && (
        <div
          className={`absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${expiryBadge.color} text-xs font-bold shadow-md`}
        >
          <ExpiryIcon className="w-3.5 h-3.5" />
          <span>{expiryBadge.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {/* Header - Item Name and Category */}
        <div className="pr-8">
          <h3 className="text-lg font-bold text-emerald-900 mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-emerald-600 font-medium capitalize">
            {item.category}
          </p>
        </div>

        {/* Item Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="font-bold text-gray-900">
                {item.quantity} {item.unit}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-bold text-gray-900 flex items-center gap-1">
                <span>{getLocationIcon(item.location)}</span>
                <span>{getLocationLabel(item.location)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        {(item.expiry_date || item.purchase_date) && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {item.expiry_date && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires
                </span>
                <span
                  className={`font-semibold ${
                    item.expiry_status === 'expired'
                      ? 'text-red-600'
                      : item.expiry_status === 'expiring_soon'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatDate(item.expiry_date)}
                </span>
              </div>
            )}
            {item.purchase_date && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Purchased</span>
                <span className="text-gray-700 font-medium">
                  {getRelativeTime(item.purchase_date)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{item.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl transition-colors duration-200 group-hover:shadow-md"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all duration-200 ${
              showDeleteConfirm
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{showDeleteConfirm ? 'Confirm?' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Image Preview - Optional */}
      {item.image_url && (
        <div className="absolute top-5 right-5 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
