import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import InventoryItemCard from './InventoryItemCard';
import InventoryListView from './InventoryListView';
import type { InventoryItemWithStatus, UUID } from '../types/database';

interface InventoryGroupedListProps {
  items: InventoryItemWithStatus[];
  viewMode: 'grid' | 'list';
  groupBy: 'none' | 'category' | 'location';
  onEdit: (item: InventoryItemWithStatus) => void;
  onDelete: (itemId: UUID) => void;
}

export default function InventoryGroupedList({
  items,
  viewMode,
  groupBy,
  onEdit,
  onDelete,
}: InventoryGroupedListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Helper to render the list of items based on view mode
  const renderItems = (itemList: InventoryItemWithStatus[]) => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {itemList.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 animate-fade-in">
        {itemList.map((item) => (
          <InventoryListView
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  };

  // If no grouping, just render all items
  if (groupBy === 'none') {
    return renderItems(items);
  }

  // Group items
  const groupedItems = items.reduce((acc, item) => {
    const key = String(item[groupBy] || 'Uncategorized');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, InventoryItemWithStatus[]>);

  const groupKeys = Object.keys(groupedItems).sort();

  return (
    <div className="space-y-8">
      {groupKeys.map((group) => {
        const isCollapsed = collapsedGroups[group];
        const count = groupedItems[group].length;
        
        return (
          <div key={group} className="space-y-4">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group)}
              className="flex items-center gap-2 w-full text-left group focus:outline-none"
            >
              <div className="p-1.5 rounded-lg bg-emerald-100/50 text-emerald-700 group-hover:bg-emerald-200/50 transition-colors">
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800 capitalize">
                  {group === 'fridge' ? '🧊 Fridge' : 
                   group === 'pantry' ? '🥫 Pantry' : 
                   group === 'freezer' ? '❄️ Freezer' : 
                   group}
                </span>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
              
              <div className="flex-1 h-px bg-gray-100 ml-4 group-hover:bg-gray-200 transition-colors"></div>
            </button>

            {/* Group Content */}
            {!isCollapsed && (
              <div className="pl-2 border-l-2 border-gray-50 ml-3.5">
                {renderItems(groupedItems[group])}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
