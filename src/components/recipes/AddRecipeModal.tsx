/**
 * Add Recipe Modal Component
 *
 * Modal for adding a new recipe manually (simplified version).
 * Full multi-step form can be implemented later.
 */

import { X } from 'lucide-react';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRecipeModal({
  isOpen,
  onClose,
}: AddRecipeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">
            Add Recipe
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👨‍🍳</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Manual Recipe Entry
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This feature is coming soon! For now, you can generate recipes using
            AI or save recipes from the library.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
