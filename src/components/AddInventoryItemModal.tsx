/**
 * Add Inventory Item Modal Component
 *
 * Modal form for adding new inventory items using React Hook Form and Zod validation.
 * Features glassmorphism design and comprehensive form fields.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  createInventoryItemSchema,
  type CreateInventoryItemFormData,
  CATEGORY_OPTIONS,
  UNIT_OPTIONS,
  LOCATION_OPTIONS,
} from '../schemas/inventorySchemas';
import type { UUID } from '../types/database';

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateInventoryItemFormData & { user_id: UUID }) => Promise<void>;
  userId: UUID;
}

export default function AddInventoryItemModal({
  isOpen,
  onClose,
  onAdd,
  userId,
}: AddInventoryItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInventoryItemFormData>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 1,
      unit: 'piece',
      location: 'fridge',
      expiry_date: null,
      purchase_date: new Date().toISOString().split('T')[0],
      barcode: null,
      image_url: null,
      notes: null,
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateInventoryItemFormData) => {
    setIsSubmitting(true);
    try {
      await onAdd({
        ...data,
        user_id: userId,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white">Add New Item</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="e.g., Organic Milk"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                id="category"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.category
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                {...register('quantity', { valueAsNumber: true })}
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.quantity
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Unit and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit */}
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unit')}
                id="unit"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.unit ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.unit.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <select
                {...register('location')}
                id="location"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.location
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.icon} {loc.label}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Date */}
            <div>
              <label
                htmlFor="purchase_date"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Purchase Date
              </label>
              <input
                {...register('purchase_date')}
                id="purchase_date"
                type="date"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.purchase_date
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.purchase_date && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.purchase_date.message}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="expiry_date"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                Expiry Date
              </label>
              <input
                {...register('expiry_date')}
                id="expiry_date"
                type="date"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all ${
                  errors.expiry_date
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.expiry_date && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.expiry_date.message}
                </p>
              )}
            </div>
          </div>

          {/* Barcode (Optional) */}
          <div>
            <label
              htmlFor="barcode"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Barcode (Optional)
            </label>
            <input
              {...register('barcode')}
              id="barcode"
              type="text"
              placeholder="Scan or enter barcode"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all"
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              id="notes"
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all resize-none"
            />
            {errors.notes && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
