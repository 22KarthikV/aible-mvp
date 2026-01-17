/**
 * OpenFoodFacts Service
 *
 * Integration with OpenFoodFacts API for barcode lookups.
 * OpenFoodFacts is a free, open-source food product database.
 *
 * API Documentation: https://wiki.openfoodfacts.org/API
 * No API key required.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Product information from OpenFoodFacts
 */
export interface OpenFoodFactsProduct {
  code: string; // barcode
  product_name: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  quantity?: string;
  serving_size?: string;
  nutriscore_grade?: string;
  nutrition_grades?: string;
  categories_tags?: string[];
  allergens_tags?: string[];
}

/**
 * OpenFoodFacts API response
 */
interface OpenFoodFactsResponse {
  status: number; // 1 = found, 0 = not found
  code: string;
  product?: OpenFoodFactsProduct;
  status_verbose?: string;
}

/**
 * Normalized product data for our application
 */
export interface NormalizedProduct {
  barcode: string;
  name: string;
  category: string;
  brand?: string;
  imageUrl?: string;
  quantity?: string;
  servingSize?: string;
  allergens?: string[];
  found: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OPENFOODFACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'Aible - Kitchen Assistant - Web App';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Lookup product by barcode
 *
 * @param barcode - Product barcode (EAN, UPC, etc.)
 * @returns Product information or null if not found
 */
export async function lookupProductByBarcode(
  barcode: string
): Promise<{ data: NormalizedProduct | null; error: string | null }> {
  try {
    // Validate barcode
    if (!barcode || barcode.trim().length === 0) {
      return { data: null, error: 'Barcode is required' };
    }

    const cleanedBarcode = barcode.trim();

    // Fetch product data
    const response = await fetch(
      `${OPENFOODFACTS_API_URL}/product/${cleanedBarcode}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('OpenFoodFacts API error:', response.statusText);
      return {
        data: null,
        error: `API request failed: ${response.statusText}`,
      };
    }

    const data: OpenFoodFactsResponse = await response.json();

    // Check if product was found
    if (data.status === 0 || !data.product) {
      console.log('Product not found in OpenFoodFacts:', cleanedBarcode);
      return {
        data: {
          barcode: cleanedBarcode,
          name: '',
          category: 'other',
          found: false,
        },
        error: null,
      };
    }

    // Normalize product data
    const normalizedProduct = normalizeProductData(data.product);

    return { data: normalizedProduct, error: null };
  } catch (error) {
    console.error('Error fetching product from OpenFoodFacts:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Search products by name
 *
 * @param query - Search query
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of results per page
 * @returns Array of product results
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: NormalizedProduct[] | null; error: string | null }> {
  try {
    if (!query || query.trim().length < 2) {
      return { data: null, error: 'Search query must be at least 2 characters' };
    }

    const cleanedQuery = encodeURIComponent(query.trim());

    const response = await fetch(
      `${OPENFOODFACTS_API_URL}/search?search_terms=${cleanedQuery}&page=${page}&page_size=${pageSize}&json=true`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        data: null,
        error: `API request failed: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return { data: [], error: null };
    }

    const normalized = data.products.map((p: OpenFoodFactsProduct) =>
      normalizeProductData(p)
    );

    return { data: normalized, error: null };
  } catch (error) {
    console.error('Error searching products:', error);
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
 * Normalize OpenFoodFacts product data to our application format
 */
function normalizeProductData(
  product: OpenFoodFactsProduct
): NormalizedProduct {
  return {
    barcode: product.code,
    name: product.product_name || 'Unknown Product',
    category: mapCategoryToInventoryCategory(product.categories_tags),
    brand: product.brands,
    imageUrl: product.image_url,
    quantity: product.quantity,
    servingSize: product.serving_size,
    allergens: product.allergens_tags?.map((tag) =>
      tag.replace('en:', '').replace(/-/g, ' ')
    ),
    found: true,
  };
}

/**
 * Map OpenFoodFacts categories to our inventory categories
 */
function mapCategoryToInventoryCategory(
  categoriesTags?: string[]
): string {
  if (!categoriesTags || categoriesTags.length === 0) {
    return 'other';
  }

  const categories = categoriesTags.map((tag) => tag.toLowerCase());

  // Fruits
  if (
    categories.some((c) =>
      c.includes('fruit') || c.includes('fresh-fruit')
    )
  ) {
    return 'fruits';
  }

  // Vegetables
  if (
    categories.some((c) =>
      c.includes('vegetable') || c.includes('fresh-vegetables')
    )
  ) {
    return 'vegetables';
  }

  // Dairy
  if (
    categories.some((c) =>
      c.includes('dairy') ||
      c.includes('milk') ||
      c.includes('cheese') ||
      c.includes('yogurt')
    )
  ) {
    return 'dairy';
  }

  // Meat
  if (
    categories.some((c) =>
      c.includes('meat') || c.includes('poultry') || c.includes('beef')
    )
  ) {
    return 'meat';
  }

  // Seafood
  if (
    categories.some((c) =>
      c.includes('seafood') || c.includes('fish') || c.includes('shellfish')
    )
  ) {
    return 'seafood';
  }

  // Grains & Cereals
  if (
    categories.some((c) =>
      c.includes('cereal') ||
      c.includes('grain') ||
      c.includes('pasta') ||
      c.includes('rice')
    )
  ) {
    return 'grains';
  }

  // Bakery
  if (
    categories.some((c) =>
      c.includes('bread') || c.includes('bakery') || c.includes('pastries')
    )
  ) {
    return 'bakery';
  }

  // Snacks
  if (
    categories.some((c) =>
      c.includes('snack') || c.includes('chips') || c.includes('cookies')
    )
  ) {
    return 'snacks';
  }

  // Beverages
  if (
    categories.some((c) =>
      c.includes('beverage') || c.includes('drink') || c.includes('juice')
    )
  ) {
    return 'beverages';
  }

  // Condiments
  if (
    categories.some((c) =>
      c.includes('condiment') || c.includes('sauce') || c.includes('dressing')
    )
  ) {
    return 'condiments';
  }

  // Spices
  if (
    categories.some((c) =>
      c.includes('spice') || c.includes('seasoning') || c.includes('herb')
    )
  ) {
    return 'spices';
  }

  // Canned goods
  if (
    categories.some((c) =>
      c.includes('canned') || c.includes('tinned') || c.includes('preserved')
    )
  ) {
    return 'canned';
  }

  // Frozen foods
  if (categories.some((c) => c.includes('frozen'))) {
    return 'frozen';
  }

  return 'other';
}

/**
 * Extract quantity and unit from OpenFoodFacts quantity string
 *
 * @param quantityString - e.g., "500 g", "1 L", "250 ml"
 * @returns Parsed quantity and unit
 */
export function parseQuantityString(quantityString?: string): {
  quantity: number;
  unit: string;
} {
  if (!quantityString) {
    return { quantity: 1, unit: 'piece' };
  }

  // Common patterns: "500g", "500 g", "1L", "1.5 L"
  const match = quantityString.match(/^([\d.]+)\s*([a-zA-Z]+)$/);

  if (match) {
    const quantity = parseFloat(match[1]);
    const unit = normalizeUnit(match[2]);
    return { quantity, unit };
  }

  // Fallback
  return { quantity: 1, unit: 'piece' };
}

/**
 * Normalize unit names to match our inventory units
 */
function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase();

  // Weight
  if (normalized === 'kg' || normalized === 'kilogram') return 'kg';
  if (normalized === 'g' || normalized === 'gram' || normalized === 'gr') return 'g';
  if (normalized === 'lb' || normalized === 'pound') return 'lb';
  if (normalized === 'oz' || normalized === 'ounce') return 'oz';

  // Volume
  if (normalized === 'l' || normalized === 'liter' || normalized === 'litre') return 'L';
  if (normalized === 'ml' || normalized === 'milliliter' || normalized === 'millilitre') return 'mL';

  // Count
  if (normalized === 'piece' || normalized === 'pc' || normalized === 'pcs') return 'piece';

  // Default
  return normalized;
}
