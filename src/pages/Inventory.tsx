/**
 * Inventory Page Component for Aible
 *
 * Complete inventory management with CRUD operations, filtering, and real-time updates.
 * Features glassmorphism design and emerald/green color scheme.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Plus,
  Package,
  Scan,
  LogOut,
  User,
  Menu,
  Search,
  ArrowLeft,
  Sparkles,
  ChefHat,
  Loader2,
  AlertCircle,
  Filter,
  Receipt,
  LayoutGrid,
  List as ListIcon,
  Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import InventoryItemCard from '../components/InventoryItemCard';
import InventoryGroupedList from '../components/InventoryGroupedList';
import AddInventoryItemModal from '../components/AddInventoryItemModal';
import EditInventoryItemModal from '../components/EditInventoryItemModal';
import InventoryFilters from '../components/InventoryFilters';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import ReceiptScannerModal from '../components/ReceiptScannerModal';
import ReceiptItemReview from '../components/ReceiptItemReview';
import { useInventoryStore } from '../stores/inventoryStore';
import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../services/inventoryService';
import { createTransaction } from '../services/transactionService';
import type {
  InventoryItemWithStatus,
  UUID,
} from '../types/database';
import type {
  CreateInventoryItemFormData,
  UpdateInventoryItemFormData,
} from '../schemas/inventorySchemas';
import type { ParsedReceipt } from '../services/receiptOCRService';

export default function Inventory() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showReceiptScannerModal, setShowReceiptScannerModal] = useState(false);
  const [showReceiptReviewModal, setShowReceiptReviewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithStatus | null>(
    null
  );
  const [receiptData, setReceiptData] = useState<ParsedReceipt | null>(null);
  const [scannedProductData, setScannedProductData] = useState<{
    name: string;
    category: string;
    barcode: string;
    image_url: string | null;
  } | null>(null);

  // View Preferences
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('inventoryViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });
  
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'location'>(() => {
    const saved = localStorage.getItem('inventoryGroupBy');
    return (saved === 'none' || saved === 'category' || saved === 'location') ? saved : 'none';
  });

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('inventoryViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('inventoryGroupBy', groupBy);
  }, [groupBy]);

  // Inventory Store
  const {
    loading,
    error,
    searchQuery,
    selectedCategory,
    selectedLocation,
    showExpiredOnly,
    showExpiringSoon,
    setItems,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    setSelectedLocation,
    setShowExpiredOnly,
    setShowExpiringSoon,
    clearFilters,
    getFilteredItems,
    getStats,
    addItem: addItemToStore,
    updateItem: updateItemInStore,
    deleteItem: deleteItemFromStore,
  } = useInventoryStore();

  const filteredItems = getFilteredItems();
  const stats = getStats();

  /**
   * Fetch inventory items on mount
   */
  useEffect(() => {
    async function loadInventory() {
      if (!user?.id) return;

      setLoading(true);
      const { data, error } = await fetchInventoryItems(user.id);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      if (data) {
        setItems(data);
      }
      setLoading(false);
    }

    loadInventory();
  }, [user?.id, setItems, setLoading, setError]);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      console.error('Failed to sign out:', error.message);
      alert('Failed to sign out. Please try again.');
    }
  };

  /**
   * Handle add item
   */
  const handleAddItem = async (
    data: CreateInventoryItemFormData & { user_id: UUID }
  ) => {
    // Convert undefined to null for optional fields
    const itemData = {
      ...data,
      expiry_date: data.expiry_date || null,
      purchase_date: data.purchase_date || null,
      barcode: data.barcode || null,
      image_url: data.image_url || null,
      notes: data.notes || null,
    };

    const { data: newItem, error } = await createInventoryItem(itemData);

    if (error) {
      alert(`Failed to add item: ${error}`);
      throw new Error(error);
    }

    if (newItem) {
      addItemToStore(newItem);
    }
  };

  /**
   * Handle edit item
   */
  const handleEditItem = (item: InventoryItemWithStatus) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  /**
   * Handle update item
   */
  const handleUpdateItem = async (
    itemId: UUID,
    updates: UpdateInventoryItemFormData
  ) => {
    const { data: updatedItem, error } = await updateInventoryItem(
      itemId,
      updates
    );

    if (error) {
      alert(`Failed to update item: ${error}`);
      throw new Error(error);
    }

    if (updatedItem) {
      updateItemInStore(itemId, updatedItem);
    }
  };

  /**
   * Handle delete item
   */
  const handleDeleteItem = async (itemId: UUID) => {
    const { error } = await deleteInventoryItem(itemId);

    if (error) {
      alert(`Failed to delete item: ${error}`);
      return;
    }

    deleteItemFromStore(itemId);
  };

  /**
   * Handle barcode scan success
   */
  const handleBarcodeScan = (_barcode: string) => {
    // Open add modal (future: pre-fill with barcode)
    setShowAddModal(true);
  };

  /**
   * Handle product data from barcode scanner
   */
  const handleBarcodeProductData = (productData: {
    name: string;
    category: string;
    barcode: string;
    image_url: string | null;
  }) => {
    setScannedProductData(productData);
    setShowAddModal(true);
    setShowScannerModal(false);
  };

  /**
   * Handle receipt processed
   */
  const handleReceiptProcessed = (receipt: ParsedReceipt, _imageData: string) => {
    setReceiptData(receipt);
    setShowReceiptScannerModal(false);
    setShowReceiptReviewModal(true);
  };

  /**
   * Handle batch add from receipt
   */
  const handleBatchAddFromReceipt = async (
    items: Array<CreateInventoryItemFormData & { user_id: UUID }>
  ) => {
    let successCount = 0;
    let errorCount = 0;

    for (const itemData of items) {
      // Ensure undefined values are converted to null
      const cleanedData = {
        ...itemData,
        expiry_date: itemData.expiry_date || null,
        purchase_date: itemData.purchase_date || null,
        barcode: itemData.barcode || null,
        image_url: itemData.image_url || null,
        notes: itemData.notes || null,
      };

      const { data: newItem, error } = await createInventoryItem(cleanedData);

      if (error) {
        console.error(`Failed to add item ${itemData.name}:`, error);
        errorCount++;
      } else if (newItem) {
        addItemToStore(newItem);
        successCount++;
      }
    }

    // Log transaction if items were added
    if (successCount > 0) {
      try {
        const categoryBreakdown: Record<string, number> = {};
        let calculatedTotal = 0;
        
        items.forEach((item) => {
          let price = 0;
          // Try to parse price from notes (e.g. "Price: $12.99")
          if (item.notes) {
            const match = item.notes.match(/Price: [^0-9]*([\d.]+)/);
            if (match) {
              price = parseFloat(match[1]);
            }
          }
          
          const cat = item.category || 'other';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + price;
          calculatedTotal += price;
        });

        // Use calculated total if > 0, otherwise fallback to receipt total if available
        const finalTotal = calculatedTotal > 0 ? calculatedTotal : (receiptData?.totalAmount || 0);

        await createTransaction({
          user_id: items[0].user_id,
          store_name: receiptData?.storeName || 'Unknown Store',
          transaction_date: receiptData?.date || new Date().toISOString().split('T')[0],
          total_amount: finalTotal,
          currency: 'GBP',
          category_breakdown: categoryBreakdown,
          is_verified: true,
          source: 'scan',
        });
      } catch (err) {
        console.error('Error creating transaction log:', err);
      }
    }

    if (errorCount > 0) {
      alert(
        `Added ${successCount} items successfully. ${errorCount} items failed to add.`
      );
    }

    // Reset receipt state
    setReceiptData(null);
    setShowReceiptReviewModal(false);
  };

  /**
   * Get user's first name from full name or email
   */
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  /**
   * Get user's profile picture or default avatar
   */
  const getProfilePicture = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-x-hidden flex flex-col">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      {/* Header - Floating Island Style */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <header className="max-w-[1600px] mx-auto bg-white/70 backdrop-blur-md border border-emerald-200/50 rounded-2xl shadow-sm transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and App Name */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Go back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-emerald-700" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ border: 'none', outline: 'none', background: 'none', padding: 0 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <ChefHat className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight hidden sm:block animate-shine">
                    Aible
                  </h1>
                </button>
              </div>

              {/* Desktop: User Profile */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 hover:bg-emerald-50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer border border-transparent hover:border-emerald-100"
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border border-emerald-200"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div className="text-sm text-left">
                    <p className="font-semibold text-emerald-900 leading-tight">{getFirstName()}</p>
                    <p className="text-emerald-600 text-xs leading-tight">{user?.email}</p>
                  </div>
                </button>
              </div>

              {/* Mobile: Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-100 transition-colors text-emerald-600"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 px-4 border-t border-emerald-100 bg-white/90 rounded-b-2xl">
              <div className="flex items-center gap-3 mb-4">
                {getProfilePicture() ? (
                  <img
                    src={getProfilePicture()}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-emerald-200"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-bold text-emerald-900">{getFirstName()}</p>
                  <p className="text-emerald-700">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2 animate-slide-in-left">
              Inventory
            </h2>
            <p className="text-emerald-700 animate-slide-in-left animation-delay-100 font-medium">
              Track and manage your kitchen items
            </p>
          </div>

          {/* Add Item Button - Desktop */}
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer animate-fade-in animation-delay-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 animate-fade-in animation-delay-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-emerald-100/30 border border-emerald-200/50 rounded-2xl text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-300 transition-all duration-200 font-medium"
              />
            </div>

            {/* Controls Row on Mobile / Inline on Desktop */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-emerald-200/50 rounded-2xl p-1.5 shadow-sm flex-shrink-0">
                <div className="flex bg-gray-100/80 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
                    title="List View"
                  >
                    <ListIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Group By Dropdown */}
              <div className="flex items-center px-4 bg-white border border-emerald-200/50 rounded-2xl shadow-sm flex-shrink-0">
                <Layers className="w-5 h-5 text-emerald-500 mr-2" />
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="bg-transparent py-3.5 text-sm font-bold text-gray-600 focus:outline-none cursor-pointer hover:text-emerald-700 min-w-[100px]"
                >
                  <option value="none">No Grouping</option>
                  <option value="location">Group by Location</option>
                  <option value="category">Group by Category</option>
                </select>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 border font-bold rounded-2xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 whitespace-nowrap flex-shrink-0 ${
                  showFilters || selectedCategory || selectedLocation || showExpiredOnly || showExpiringSoon
                    ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    : 'bg-white text-emerald-700 border-emerald-200/50 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {(selectedCategory || selectedLocation || showExpiredOnly || showExpiringSoon) && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    {
                      [
                        selectedCategory !== null,
                        selectedLocation !== null,
                        showExpiredOnly,
                        showExpiringSoon,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Filters Panel */}
          {showFilters && (
            <InventoryFilters
              selectedCategory={selectedCategory}
              selectedLocation={selectedLocation}
              showExpiredOnly={showExpiredOnly}
              showExpiringSoon={showExpiringSoon}
              onCategoryChange={setSelectedCategory}
              onLocationChange={setSelectedLocation}
              onShowExpiredOnlyChange={setShowExpiredOnly}
              onShowExpiringSoonChange={setShowExpiringSoon}
              onClearFilters={clearFilters}
            />
          )}
        </div>

        {/* Stats Bar */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
            </div>
            <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 rounded-2xl p-4">
              <p className="text-sm text-amber-700 mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-700 mb-1">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-4">
              <p className="text-sm text-blue-700 mb-1">Locations</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(stats.byLocation).filter(
                  (loc) => stats.byLocation[loc as keyof typeof stats.byLocation] > 0
                ).length}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-emerald-700 font-semibold">
              Loading your inventory...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">Error Loading Inventory</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && stats.total === 0 && (
          <div className="animate-fade-in animation-delay-400">
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 sm:p-16 text-center shadow-sm hover:shadow-md transition-all duration-500">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in-up animation-delay-500">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-3 animate-fade-in-up animation-delay-600">
                Your inventory is empty
              </h3>
              <p className="text-emerald-700 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed animate-fade-in-up animation-delay-700 font-medium opacity-80">
                Start tracking your kitchen items by adding them manually, scanning barcodes, or uploading receipts
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-800">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Item</span>
                </button>
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-blue-300 text-blue-700 font-bold rounded-xl shadow-md hover:shadow-xl hover:bg-blue-50 hover:border-blue-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
                >
                  <Scan className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Scan Barcode</span>
                </button>
                <button
                  onClick={() => setShowReceiptScannerModal(true)}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-purple-300 text-purple-700 font-bold rounded-xl shadow-md hover:shadow-xl hover:bg-purple-50 hover:border-purple-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 cursor-pointer"
                >
                  <Receipt className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Scan Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Results (when filters applied) */}
        {!loading && !error && filteredItems.length === 0 && stats.total > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center animate-fade-in">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Inventory List / Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <InventoryGroupedList
            items={filteredItems}
            viewMode={viewMode}
            groupBy={groupBy}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}

        {/* Quick Actions */}
        <div className="mt-10 animate-fade-in animation-delay-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Action 1: Add Item */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-emerald-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-emerald-100 animate-fade-in-up animation-delay-600"
            >
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                <Plus className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Add Item</h4>
              <p className="text-sm text-gray-600">
                Manually add items
              </p>
            </button>

            {/* Action 2: Scan Barcode */}
            <button
              onClick={() => setShowScannerModal(true)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-blue-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-blue-100 animate-fade-in-up animation-delay-700"
            >
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Scan className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Scan Barcode</h4>
              <p className="text-sm text-gray-600">
                Quick add items
              </p>
            </button>

            {/* Action 3: Scan Receipt */}
            <button
              onClick={() => setShowReceiptScannerModal(true)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-purple-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-purple-100 animate-fade-in-up animation-delay-800"
            >
              <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Receipt className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Scan Receipt</h4>
              <p className="text-sm text-gray-600">
                Batch add from receipt
              </p>
            </button>

            {/* Action 4: Generate Recipe */}
            <button
              onClick={() => navigate('/recipes')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-50 p-6 hover:shadow-xl hover:border-pink-400 hover:scale-[1.02] transition-all duration-300 text-left group focus:outline-none focus:ring-4 focus:ring-pink-100 animate-fade-in-up animation-delay-900"
            >
              <div className="w-14 h-14 bg-pink-100 group-hover:bg-pink-500 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="w-7 h-7 text-pink-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Generate Recipe</h4>
              <p className="text-sm text-gray-600">
                AI-powered suggestions
              </p>
            </button>
          </div>
        </div>

        {/* Mobile Add Item Button - Fixed at bottom */}
        <button
          onClick={() => setShowAddModal(true)}
          className="sm:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 cursor-pointer flex items-center justify-center z-50 animate-bounce-slow"
          aria-label="Add item"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Footer */}
        <Footer />
      </main>

      {/* Modals */}
      {user && (
        <>
          <AddInventoryItemModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setScannedProductData(null);
            }}
            onAdd={handleAddItem}
            userId={user.id}
            initialData={scannedProductData}
          />
          <EditInventoryItemModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
            onUpdate={handleUpdateItem}
            item={editingItem}
          />
          <BarcodeScannerModal
            isOpen={showScannerModal}
            onClose={() => setShowScannerModal(false)}
            onScanSuccess={handleBarcodeScan}
            onAddProduct={handleBarcodeProductData}
            userId={user.id}
          />
          <ReceiptScannerModal
            isOpen={showReceiptScannerModal}
            onClose={() => setShowReceiptScannerModal(false)}
            onReceiptProcessed={handleReceiptProcessed}
          />
          <ReceiptItemReview
            isOpen={showReceiptReviewModal}
            onClose={() => {
              setShowReceiptReviewModal(false);
              setReceiptData(null);
            }}
            receiptData={receiptData}
            onBatchAdd={handleBatchAddFromReceipt}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
}