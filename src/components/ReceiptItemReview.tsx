/**
 * Receipt Item Review Component
 *
 * Allows users to review, edit, and batch-add items extracted from receipt OCR.
 * Provides a table-like interface with inline editing and selection.
 */

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShoppingBag,
  Calendar,
  Package,
} from 'lucide-react';
import type { ParsedReceipt, ReceiptItem } from '../services/receiptOCRService';
import type { StorageLocation, UUID } from '../types/database';
import type { CreateInventoryItemFormData } from '../schemas/inventorySchemas';
import {
  LOCATION_OPTIONS,
  CATEGORY_OPTIONS,
  UNIT_OPTIONS,
} from '../schemas/inventorySchemas';

interface ReceiptItemReviewProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ParsedReceipt | null;
  onBatchAdd: (items: Array<CreateInventoryItemFormData & { user_id: UUID }>) => Promise<void>;
  userId: UUID;
}

interface EditableReceiptItem extends ReceiptItem {
  id: string;
  location: StorageLocation;
  expiryDate?: string;
  purchaseDate?: string;
  isSelected: boolean;
  isEditing: boolean;
}

export default function ReceiptItemReview({
  isOpen,
  onClose,
  receiptData,
  onBatchAdd,
  userId,
}: ReceiptItemReviewProps) {
  const [items, setItems] = useState<EditableReceiptItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  /**
   * Initialize items from receipt data
   */
  useEffect(() => {
    if (receiptData && receiptData.items.length > 0) {
      const initialItems: EditableReceiptItem[] = receiptData.items.map(
        (item, index) => ({
          ...item,
          id: `receipt-item-${index}`,
          location: 'pantry' as StorageLocation,
          purchaseDate: receiptData.date || new Date().toISOString().split('T')[0],
          isSelected: true,
          isEditing: false,
        })
      );
      setItems(initialItems);
    }
  }, [receiptData]);

  /**
   * Toggle item selection
   */
  const toggleItemSelection = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  /**
   * Toggle select all
   */
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: newSelectAll }))
    );
  };

  /**
   * Update item field
   */
  const updateItem = (id: string, field: keyof EditableReceiptItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  /**
   * Delete item from list
   */
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Toggle edit mode for item
   */
  const toggleEditMode = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  /**
   * Handle batch add to inventory
   */
  const handleBatchAdd = async () => {
    const selectedItems = items.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      alert('Please select at least one item to add');
      return;
    }

    setIsAdding(true);

    try {
      const inventoryItems: Array<CreateInventoryItemFormData & { user_id: UUID }> =
        selectedItems.map((item) => ({
          user_id: userId,
          name: item.name,
          category: item.category || 'other',
          quantity: item.quantity,
          unit: item.unit,
          location: item.location,
          purchase_date: item.purchaseDate || null,
          expiry_date: item.expiryDate || null,
          barcode: null,
          image_url: null,
          notes: item.price ? `Price: $${item.price.toFixed(2)}` : null,
        }));

      await onBatchAdd(inventoryItems);
      onClose();
    } catch (error) {
      console.error('Error batch adding items:', error);
      alert('Failed to add some items. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen || !receiptData) return null;

  const selectedCount = items.filter((item) => item.isSelected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-white">Review Receipt Items</h2>
              </div>
              {receiptData.storeName && (
                <p className="text-emerald-100 text-sm ml-13">
                  {receiptData.storeName} {receiptData.date && `• ${receiptData.date}`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Summary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-700 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-emerald-900">{items.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 mb-1">Selected</p>
              <p className="text-2xl font-bold text-blue-900">{selectedCount}</p>
            </div>
            {receiptData.totalAmount && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-700 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${receiptData.totalAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-gray-50 rounded-2xl p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Item Name
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Unit
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Location
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="pb-3 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 ${
                      item.isSelected ? 'bg-emerald-50/50' : 'bg-white'
                    } hover:bg-emerald-50 transition-colors`}
                  >
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3">
                      {item.isEditing ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{item.name}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.isEditing ? (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, 'quantity', parseFloat(e.target.value))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          min="0"
                          step="0.1"
                        />
                      ) : (
                        <span className="text-gray-700">{item.quantity}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.isEditing ? (
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700">{item.unit}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.isEditing ? (
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 capitalize">{item.category}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <select
                        value={item.location}
                        onChange={(e) =>
                          updateItem(item.id, 'location', e.target.value as StorageLocation)
                        }
                        className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      >
                        {LOCATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-700">
                        {item.price ? `$${item.price.toFixed(2)}` : '-'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleEditMode(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isEditing
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          title={item.isEditing ? 'Save' : 'Edit'}
                        >
                          {item.isEditing ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Edit2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items extracted from receipt</p>
              </div>
            )}
          </div>

          {/* Additional Options */}
          {items.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Set Purchase Date (Optional)
                  </p>
                  <input
                    type="date"
                    value={items[0]?.purchaseDate || ''}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setItems((prev) =>
                        prev.map((item) => ({ ...item, purchaseDate: newDate }))
                      );
                    }}
                    className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    This will be applied to all selected items
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{selectedCount}</span> of{' '}
              <span className="font-semibold">{items.length}</span> items selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchAdd}
                disabled={isAdding || selectedCount === 0}
                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>
                  {isAdding
                    ? 'Adding...'
                    : `Add ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
