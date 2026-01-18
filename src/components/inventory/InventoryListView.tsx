import { Edit2, Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { InventoryItemWithStatus, UUID } from '../../types/database';

interface InventoryListViewProps {
  item: InventoryItemWithStatus;
  onEdit: (item: InventoryItemWithStatus) => void;
  onDelete: (itemId: UUID) => void;
}

export default function InventoryListView({
  item,
  onEdit,
  onDelete,
}: InventoryListViewProps) {
  // Determine status color/icon
  return (
    <div className="group flex items-center gap-4 p-3 bg-white/80 backdrop-blur-sm border border-emerald-100/50 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:shadow-md hover:bg-white">
      {/* Status Indicator */}
      <div className={`flex-shrink-0 w-2 h-full self-stretch rounded-full ${
        item.expiry_status === 'expired' ? 'bg-red-500' : 
        item.expiry_status === 'expiring_soon' ? 'bg-amber-500' : 'bg-emerald-500'
      }`}></div>

      {/* Image / Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl">
            {item.category === 'fruits' ? '🍎' :
             item.category === 'vegetables' ? '🥦' :
             item.category === 'dairy' ? '🥛' :
             item.category === 'meat' ? '🥩' :
             item.category === 'pantry' ? '🥫' : '📦'}
          </span>
        )}
      </div>

      {/* Main Info: Name & Category */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
      </div>

      {/* Quantity */}
      <div className="hidden sm:flex flex-col items-end w-20">
        <span className="font-bold text-emerald-700">
          {item.quantity} {item.unit}
        </span>
      </div>

      {/* Location */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 capitalize w-24 justify-center">
        {item.location}
      </div>

      {/* Expiry */}
      <div className="w-32 flex flex-col items-end">
        {item.expiry_date ? (
          <>
            <div className={`flex items-center gap-1 text-xs font-bold ${
              item.expiry_status === 'expired' ? 'text-red-600' : 
              item.expiry_status === 'expiring_soon' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {item.expiry_status === 'expired' && <AlertCircle className="w-3 h-3" />}
              {item.expiry_status === 'expiring_soon' && <Clock className="w-3 h-3" />}
              {item.expiry_status === 'fresh' && <CheckCircle className="w-3 h-3" />}
              <span>
                {item.days_until_expiry !== null && item.days_until_expiry < 0
                  ? `${Math.abs(item.days_until_expiry)} days ago`
                  : item.days_until_expiry === 0
                    ? 'Today'
                    : item.days_until_expiry !== null
                      ? `${item.days_until_expiry} days left`
                      : 'No expiry date'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {format(new Date(item.expiry_date), 'MMM d, yyyy')}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400">No expiry date</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit Item"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
