/**
 * Empty Recipes State Component
 *
 * Displayed when user has no recipes in the current tab.
 */

import { BookOpen, Sparkles, Star } from 'lucide-react';

interface EmptyRecipesProps {
  type: 'saved' | 'ai' | 'favorites';
  onGenerateClick?: () => void;
}

export default function EmptyRecipes({ type, onGenerateClick }: EmptyRecipesProps) {
  const getContent = () => {
    switch (type) {
      case 'saved':
        return {
          icon: BookOpen,
          title: 'No saved recipes yet',
          description: 'Start building your recipe collection by saving recipes from our library or generating personalized ones with AI',
          buttonText: 'Generate Recipe',
        };
      case 'ai':
        return {
          icon: Sparkles,
          title: 'No AI-generated recipes yet',
          description: 'Create personalized recipes using AI based on your inventory and preferences',
          buttonText: 'Generate with AI',
        };
      case 'favorites':
        return {
          icon: Star,
          title: 'No favorite recipes yet',
          description: 'Mark recipes as favorites by clicking the heart icon to find them easily later',
          buttonText: 'Browse Recipes',
        };
      default:
        return {
          icon: BookOpen,
          title: 'No recipes',
          description: 'Get started by adding or generating recipes',
          buttonText: 'Get Started',
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-12 lg:p-20 text-center shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in">
      {/* Icon */}
      <div className="relative w-28 h-24 mx-auto mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="relative w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Icon className="w-12 h-12 text-emerald-500 animate-pulse" strokeWidth={2} />
        </div>
        <Star
          className="absolute -top-2 -right-4 w-6 h-6 text-emerald-400 fill-emerald-400 animate-bounce"
          style={{ animationDuration: '3s' }}
        />
        <Star
          className="absolute -bottom-2 -left-4 w-5 h-5 text-green-400 fill-green-400 animate-bounce"
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
      </div>

      {/* Content */}
      <h3 className="text-3xl font-bold text-emerald-900 mb-4">
        {content.title}
      </h3>
      <p className="text-emerald-700 text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
        {content.description}
      </p>

      {/* CTA Button */}
      {onGenerateClick && (
        <button
          onClick={onGenerateClick}
          className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span>{content.buttonText}</span>
        </button>
      )}

      {/* Pro Tip */}
      <div className="mt-12 pt-8 border-t border-emerald-100">
        <p className="text-sm font-bold text-emerald-600/60 uppercase tracking-widest">
          {type === 'saved' && 'Pro Tip: Use AI to generate recipes from your inventory'}
          {type === 'ai' && 'Pro Tip: Add more items to your inventory for better matches'}
          {type === 'favorites' && 'Pro Tip: Favorite recipes sync across all your devices'}
        </p>
      </div>
    </div>
  );
}
