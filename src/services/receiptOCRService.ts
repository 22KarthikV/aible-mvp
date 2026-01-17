/**
 * Receipt OCR Service
 *
 * Integration with Google Vision API for receipt text extraction.
 * Uses OCR to extract item names, quantities, prices, and dates from receipt images.
 *
 * API Documentation: https://cloud.google.com/vision/docs/ocr
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parsed receipt item
 */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category?: string;
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

/**
 * Google Vision API text annotation
 */
interface TextAnnotation {
  description: string;
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>;
  };
}

/**
 * Google Vision API response
 */
interface VisionAPIResponse {
  responses: Array<{
    textAnnotations?: TextAnnotation[];
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
      status: string;
    };
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Common grocery item keywords for filtering
const COMMON_ITEM_KEYWORDS = [
  'milk', 'bread', 'eggs', 'cheese', 'butter', 'yogurt',
  'chicken', 'beef', 'pork', 'fish', 'salmon',
  'apple', 'banana', 'orange', 'tomato', 'potato', 'onion',
  'rice', 'pasta', 'cereal', 'flour', 'sugar', 'salt',
  'coffee', 'tea', 'juice', 'water', 'soda',
  'chips', 'cookies', 'crackers', 'snack',
];

// Receipt noise words to filter out
const NOISE_WORDS = [
  'total', 'subtotal', 'tax', 'thank', 'you', 'receipt',
  'store', 'cashier', 'transaction', 'credit', 'debit',
  'card', 'change', 'cash', 'payment', 'balance',
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Extract text from receipt image using Google Vision API
 *
 * @param imageData - Base64 encoded image or image URL
 * @returns Extracted text from receipt
 */
export async function extractTextFromReceipt(
  imageData: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

    if (!apiKey) {
      return {
        data: null,
        error: 'Google Vision API key is not configured. Please add VITE_GOOGLE_VISION_API_KEY to your .env file.',
      };
    }

    // Prepare request body
    const requestBody = {
      requests: [
        {
          image: {
            content: imageData.includes('base64')
              ? imageData.split('base64,')[1]
              : imageData,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Call Google Vision API
    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision API error:', errorText);
      return {
        data: null,
        error: `Vision API request failed: ${response.statusText}`,
      };
    }

    const data: VisionAPIResponse = await response.json();

    // Check for API errors
    if (data.responses[0]?.error) {
      const error = data.responses[0].error;
      console.error('Vision API error:', error);
      return {
        data: null,
        error: `Vision API error: ${error.message}`,
      };
    }

    // Extract text
    const fullText =
      data.responses[0]?.fullTextAnnotation?.text ||
      data.responses[0]?.textAnnotations?.[0]?.description ||
      '';

    if (!fullText) {
      return {
        data: null,
        error: 'No text detected in the image. Please ensure the receipt is clear and well-lit.',
      };
    }

    return { data: fullText, error: null };
  } catch (error) {
    console.error('Error calling Google Vision API:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Parse extracted text into structured receipt data
 *
 * @param text - Raw text from OCR
 * @returns Parsed receipt data with items
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  const items: ReceiptItem[] = [];
  let totalAmount: number | undefined;
  let date: string | undefined;
  let storeName: string | undefined;

  // Extract store name (usually first few lines)
  if (lines.length > 0) {
    storeName = lines[0];
  }

  // Extract date (look for common date patterns)
  for (const line of lines) {
    const dateMatch = line.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
    if (dateMatch && !date) {
      date = dateMatch[0];
      break;
    }
  }

  // Parse items
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip noise lines
    if (isNoiseLine(line)) {
      continue;
    }

    // Check for total amount
    if (line.toLowerCase().includes('total') && !line.toLowerCase().includes('subtotal')) {
      const totalMatch = line.match(/[\d,]+\.?\d{0,2}/);
      if (totalMatch) {
        totalAmount = parseFloat(totalMatch[0].replace(',', ''));
      }
      continue;
    }

    // Try to parse as item line
    const item = parseItemLine(line);
    if (item) {
      items.push(item);
    }
  }

  // If no items found, try a more aggressive parsing approach
  if (items.length === 0) {
    items.push(...fallbackItemParsing(lines));
  }

  return {
    items,
    totalAmount,
    date,
    storeName,
    rawText: text,
  };
}

/**
 * Process receipt image and return parsed data
 *
 * @param imageData - Base64 encoded image
 * @returns Parsed receipt data
 */
export async function processReceiptImage(
  imageData: string
): Promise<{ data: ParsedReceipt | null; error: string | null }> {
  try {
    // Extract text using OCR
    const { data: text, error: ocrError } = await extractTextFromReceipt(imageData);

    if (ocrError || !text) {
      return { data: null, error: ocrError || 'Failed to extract text' };
    }

    // Parse text into structured data
    const parsedReceipt = parseReceiptText(text);

    // Validate that we got at least some items
    if (parsedReceipt.items.length === 0) {
      return {
        data: parsedReceipt,
        error: 'No items could be extracted from the receipt. Please try a clearer image or add items manually.',
      };
    }

    return { data: parsedReceipt, error: null };
  } catch (error) {
    console.error('Error processing receipt image:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a line is noise (non-item text)
 */
function isNoiseLine(line: string): boolean {
  const lowerLine = line.toLowerCase();

  // Check for noise words
  for (const noise of NOISE_WORDS) {
    if (lowerLine.includes(noise) && !COMMON_ITEM_KEYWORDS.some((k) => lowerLine.includes(k))) {
      return true;
    }
  }

  // Check if line is too short (likely not an item)
  if (line.length < 3) {
    return true;
  }

  // Check if line is only numbers or symbols
  if (/^[\d\s.,\-$€£¥]+$/.test(line)) {
    return true;
  }

  return false;
}

/**
 * Parse a single line as a receipt item
 *
 * Common patterns:
 * - "Milk 2.99"
 * - "2x Bread 4.98"
 * - "Bananas 1.5kg 3.50"
 */
function parseItemLine(line: string): ReceiptItem | null {
  // Pattern 1: "Quantity x Item Price" (e.g., "2x Milk 5.98")
  const pattern1 = /^(\d+)\s*x\s+(.+?)\s+([\d.,]+)$/i;
  const match1 = line.match(pattern1);
  if (match1) {
    return {
      name: match1[2].trim(),
      quantity: parseInt(match1[1]),
      unit: 'piece',
      price: parseFloat(match1[3].replace(',', '.')),
      category: guessCategory(match1[2]),
    };
  }

  // Pattern 2: "Item Quantity Unit Price" (e.g., "Bananas 1.5 kg 3.50")
  const pattern2 = /^(.+?)\s+([\d.]+)\s*(kg|g|lb|oz|L|ml|piece|pc)?\s+([\d.,]+)$/i;
  const match2 = line.match(pattern2);
  if (match2) {
    return {
      name: match2[1].trim(),
      quantity: parseFloat(match2[2]),
      unit: match2[3]?.toLowerCase() || 'piece',
      price: parseFloat(match2[4].replace(',', '.')),
      category: guessCategory(match2[1]),
    };
  }

  // Pattern 3: "Item Price" (e.g., "Milk 2.99")
  const pattern3 = /^(.+?)\s+([\d.,]+)$/;
  const match3 = line.match(pattern3);
  if (match3 && !isNoiseLine(match3[1])) {
    return {
      name: match3[1].trim(),
      quantity: 1,
      unit: 'piece',
      price: parseFloat(match3[2].replace(',', '.')),
      category: guessCategory(match3[1]),
    };
  }

  return null;
}

/**
 * Fallback parsing when structured parsing fails
 * Looks for any line containing common item keywords
 */
function fallbackItemParsing(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if line contains a common item keyword
    const hasItemKeyword = COMMON_ITEM_KEYWORDS.some((keyword) =>
      lowerLine.includes(keyword)
    );

    if (hasItemKeyword && !isNoiseLine(line)) {
      // Extract price if present
      const priceMatch = line.match(/([\d.,]+)\s*$/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : undefined;

      // Remove price from name
      const name = priceMatch ? line.replace(priceMatch[0], '').trim() : line;

      items.push({
        name,
        quantity: 1,
        unit: 'piece',
        price,
        category: guessCategory(name),
      });
    }
  }

  return items;
}

/**
 * Guess category based on item name
 */
function guessCategory(itemName: string): string {
  const lower = itemName.toLowerCase();

  // Fruits
  if (
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('orange') ||
    lower.includes('grape') ||
    lower.includes('berry') ||
    lower.includes('fruit')
  ) {
    return 'fruits';
  }

  // Vegetables
  if (
    lower.includes('tomato') ||
    lower.includes('potato') ||
    lower.includes('onion') ||
    lower.includes('carrot') ||
    lower.includes('lettuce') ||
    lower.includes('vegetable')
  ) {
    return 'vegetables';
  }

  // Dairy
  if (
    lower.includes('milk') ||
    lower.includes('cheese') ||
    lower.includes('yogurt') ||
    lower.includes('butter') ||
    lower.includes('cream')
  ) {
    return 'dairy';
  }

  // Meat
  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('meat')
  ) {
    return 'meat';
  }

  // Seafood
  if (
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('tuna') ||
    lower.includes('seafood')
  ) {
    return 'seafood';
  }

  // Bakery
  if (
    lower.includes('bread') ||
    lower.includes('baguette') ||
    lower.includes('bagel') ||
    lower.includes('pastry')
  ) {
    return 'bakery';
  }

  // Beverages
  if (
    lower.includes('juice') ||
    lower.includes('soda') ||
    lower.includes('water') ||
    lower.includes('coffee') ||
    lower.includes('tea')
  ) {
    return 'beverages';
  }

  // Snacks
  if (
    lower.includes('chips') ||
    lower.includes('cookie') ||
    lower.includes('cracker') ||
    lower.includes('snack')
  ) {
    return 'snacks';
  }

  return 'other';
}

/**
 * Convert image file to base64
 */
export async function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
