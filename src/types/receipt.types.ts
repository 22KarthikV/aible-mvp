/**
 * Receipt Types
 *
 * Type definitions for receipt scanning and processing.
 */

import type { StorageLocation } from './database';

// ============================================================================
// RECEIPT ITEM TYPES
// ============================================================================

/**
 * Receipt item from OCR parsing
 */
export interface ReceiptItem {
  id?: string; // Unique ID for React keys
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category?: string;
}

/**
 * Receipt item with inventory metadata for adding to inventory
 */
export interface ReceiptItemWithInventoryData extends ReceiptItem {
  location: StorageLocation;
  expiryDate?: string | null;
  purchaseDate?: string | null;
  notes?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  isSelected: boolean; // For batch selection
}

/**
 * Parsed receipt data
 */
export interface ParsedReceipt {
  items: ReceiptItem[];
  totalAmount?: number;
  date?: string;
  storeName?: string;
  rawText: string;
}

// ============================================================================
// RECEIPT PROCESSING STATE
// ============================================================================

/**
 * Receipt processing state
 */
export type ReceiptProcessingState =
  | 'idle'
  | 'capturing'
  | 'uploading'
  | 'processing'
  | 'parsed'
  | 'error';

/**
 * Receipt scan result
 */
export interface ReceiptScanResult {
  receiptData: ParsedReceipt;
  imageData?: string; // Base64 image for storage
  processedAt: Date;
}
