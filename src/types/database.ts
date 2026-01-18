/**
 * Database Type Definitions
 *
 * Comprehensive TypeScript type definitions for all Supabase tables
 * in the Aible kitchen assistant application.
 *
 * These types provide full type safety for database operations and
 * ensure consistency across the application.
 *
 * Tables:
 * - profiles: User data and preferences
 * - inventory_items: Food items with expiry tracking
 * - recipes: AI and API-sourced recipes
 * - user_recipes: Saved/favorited recipes
 * - shopping_lists: Shopping list management
 * - shopping_list_items: Items in shopping lists
 * - recipe_history: User interaction tracking
 * - notifications: Expiry alerts and suggestions
 * - gemini_requests: AI usage tracking
 * - gemini_cache: Token optimization cache
 * - ai_recipe_feedback: Quality monitoring
 * - safety_flags: Dangerous recipe detection
 * - user_preferences: Detailed taste profiles
 * - ingredient_substitutions: AI learning from modifications
 */

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * UUID type for better semantic meaning
 */
export type UUID = string;

/**
 * ISO timestamp string
 */
export type Timestamp = string;

/**
 * Common timestamp fields for all tables
 */
export interface TimestampFields {
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Base fields with only created_at
 */
export interface CreatedAtField {
  created_at: Timestamp;
}

/**
 * Foreign key reference to users
 */
export interface UserReference {
  user_id: UUID;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/**
 * User cooking skill levels
 */
export type CookingSkillLevel = "beginner" | "intermediate" | "advanced";

/**
 * Recipe source types
 */
export type RecipeSource = "api" | "ai" | "manual";

/**
 * Meal types
 */
export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert"
  | "appetizer"
  | "beverage";

/**
 * Recipe difficulty levels
 */
export type RecipeDifficulty = "easy" | "medium" | "hard";

/**
 * Inventory storage locations
 */
export type StorageLocation = "fridge" | "freezer" | "pantry";

/**
 * Shopping list status
 */
export type ShoppingListStatus = "active" | "completed" | "archived";

/**
 * Shopping item priority
 */
export type ShoppingItemPriority = "high" | "medium" | "low";

/**
 * User recipe actions for tracking
 */
export type RecipeAction = "viewed" | "cooked" | "rated" | "saved";

/**
 * Notification types
 */
export type NotificationType =
  | "expiry_warning"
  | "expiry_urgent"
  | "restocking"
  | "recipe_suggestion";

/**
 * AI prompt types for Gemini requests
 */
export type GeminiPromptType =
  | "recipe_generation"
  | "substitution"
  | "meal_plan";

/**
 * Feedback types for AI recipes
 */
export type FeedbackType = "positive" | "negative" | "unsafe";

/**
 * Safety flag types
 */
export type SafetyFlagType =
  | "undercooked_meat"
  | "allergen_risk"
  | "toxic_combination"
  | "unsafe_temperature";

/**
 * Safety flag severity levels
 */
export type SafetySeverity = "low" | "medium" | "high" | "critical";

/**
 * AI feedback issues
 */
export type AIFeedbackIssue =
  | "too_complex"
  | "missing_steps"
  | "wrong_quantities"
  | "unsafe";

/**
 * Cooking time preferences
 */
export type CookingTimePreference = "quick" | "medium" | "leisurely";

// ============================================================================
// COMPLEX FIELD TYPES
// ============================================================================

/**
 * Recipe ingredient structure
 */
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

/**
 * Recipe instruction step
 */
export interface RecipeInstruction {
  step: number;
  description: string;
  duration_minutes?: number;
  temperature?: {
    value: number;
    unit: "celsius" | "fahrenheit";
  };
}

/**
 * Nutritional information
 */
export interface NutritionalInfo {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  cholesterol_mg?: number;
  servings?: number;
}

/**
 * Dietary restrictions
 */
export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "egg-free"
  | "soy-free"
  | "halal"
  | "kosher"
  | "low-carb"
  | "keto"
  | "paleo";

/**
 * Common cuisine types
 */
export type CuisineType =
  | "italian"
  | "chinese"
  | "indian"
  | "mexican"
  | "japanese"
  | "thai"
  | "french"
  | "mediterranean"
  | "american"
  | "korean"
  | "vietnamese"
  | "spanish"
  | "greek"
  | "middle-eastern"
  | "caribbean"
  | "african"
  | "fusion";

/**
 * Kitchen equipment types
 */
export type KitchenEquipment =
  | "oven"
  | "stovetop"
  | "microwave"
  | "air-fryer"
  | "slow-cooker"
  | "pressure-cooker"
  | "blender"
  | "food-processor"
  | "mixer"
  | "grill"
  | "toaster-oven"
  | "rice-cooker"
  | "sous-vide";

// ============================================================================
// TABLE 1: PROFILES
// ============================================================================

/**
 * User profile with preferences and settings
 *
 * Stores extended user data beyond auth.users, including
 * cooking preferences, dietary restrictions, and skill level.
 *
 * Primary Key: id (references auth.users.id)
 */
export interface Profile extends TimestampFields {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  cooking_skill_level: CookingSkillLevel;
  dietary_restrictions: DietaryRestriction[];
  allergies: string[];
  favorite_cuisines: CuisineType[];
}

/**
 * Input type for creating/updating profiles
 * (excludes auto-generated fields)
 */
export type ProfileInput = Omit<Profile, "id" | "created_at" | "updated_at">;

/**
 * Partial update type for profiles
 */
export type ProfileUpdate = Partial<ProfileInput>;

// ============================================================================
// TABLE 2: INVENTORY_ITEMS
// ============================================================================

/**
 * Food inventory item with expiry tracking
 *
 * Tracks user's food items with quantities, expiry dates,
 * and storage locations for smart inventory management.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id
 */
export interface InventoryItem extends TimestampFields, UserReference {
  id: UUID;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: Timestamp | null;
  purchase_date: Timestamp | null;
  location: StorageLocation;
  barcode: string | null;
  image_url: string | null;
  notes: string | null;
}

/**
 * Input type for creating inventory items
 */
export type InventoryItemInput = Omit<
  InventoryItem,
  "id" | "created_at" | "updated_at"
>;

/**
 * Partial update type for inventory items
 */
export type InventoryItemUpdate = Partial<Omit<InventoryItemInput, "user_id">>;

/**
 * Inventory item with expiry status calculated
 */
export interface InventoryItemWithStatus extends InventoryItem {
  expiry_status: "fresh" | "expiring_soon" | "expired";
  days_until_expiry: number | null;
}

// ============================================================================
// TABLE 3: RECIPES
// ============================================================================

/**
 * Recipe from API, AI generation, or manual entry
 *
 * Central recipe storage supporting multiple sources.
 * Can be user-specific or public recipes.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id (nullable for public recipes)
 */
export interface Recipe extends TimestampFields {
  id: UUID;
  user_id: UUID | null;
  title: string;
  description: string | null;
  source: RecipeSource;
  source_id: string | null;
  image_url: string | null;
  prep_time: number; // minutes
  cook_time: number; // minutes
  servings: number;
  difficulty: RecipeDifficulty;
  cuisine_type: CuisineType | null;
  meal_type: MealType[];
  instructions: RecipeInstruction[];
  ingredients: RecipeIngredient[];
  nutritional_info: NutritionalInfo | null;
}

/**
 * Input type for creating recipes
 */
export type RecipeInput = Omit<Recipe, "id" | "created_at" | "updated_at">;

/**
 * Partial update type for recipes
 */
export type RecipeUpdate = Partial<Omit<RecipeInput, "user_id">>;

/**
 * Recipe with computed fields
 */
export interface RecipeWithMetadata extends Recipe {
  total_time: number; // prep_time + cook_time
  ingredient_count: number;
  step_count: number;
  is_favorited?: boolean; // populated when querying with user context
  user_rating?: number | null; // populated when querying with user context
}

// ============================================================================
// TABLE 4: USER_RECIPES
// ============================================================================

/**
 * User's saved/favorited recipes with personal notes
 *
 * Junction table tracking which recipes a user has saved,
 * their ratings, notes, and cooking history.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id, recipe_id -> recipes.id
 * Unique Constraint: (user_id, recipe_id)
 */
export interface UserRecipe extends CreatedAtField, UserReference {
  id: UUID;
  recipe_id: UUID;
  is_favorite: boolean;
  rating: number | null; // 1-5
  notes: string | null;
  cooked_count: number;
  last_cooked_at: Timestamp | null;
}

/**
 * Input type for creating user recipes
 */
export type UserRecipeInput = Omit<UserRecipe, "id" | "created_at">;

/**
 * Partial update type for user recipes
 */
export type UserRecipeUpdate = Partial<
  Omit<UserRecipeInput, "user_id" | "recipe_id">
>;

// ============================================================================
// TABLE 5: SHOPPING_LISTS
// ============================================================================

/**
 * Shopping list container
 *
 * Organizes shopping items into lists that can be
 * active, completed, or archived.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id
 */
export interface ShoppingList extends TimestampFields, UserReference {
  id: UUID;
  name: string;
  status: ShoppingListStatus;
  completed_at: Timestamp | null;
}

/**
 * Input type for creating shopping lists
 */
export type ShoppingListInput = Omit<
  ShoppingList,
  "id" | "created_at" | "updated_at"
>;

/**
 * Partial update type for shopping lists
 */
export type ShoppingListUpdate = Partial<Omit<ShoppingListInput, "user_id">>;

/**
 * Shopping list with item count
 */
export interface ShoppingListWithItems extends ShoppingList {
  item_count: number;
  checked_count: number;
  completion_percentage: number;
}

// ============================================================================
// TABLE 6: SHOPPING_LIST_ITEMS
// ============================================================================

/**
 * Individual items in a shopping list
 *
 * Tracks specific items to purchase, with optional
 * recipe references for ingredient tracking.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - shopping_list_id -> shopping_lists.id
 *   - added_from_recipe_id -> recipes.id (nullable)
 */
export interface ShoppingListItem extends CreatedAtField {
  id: UUID;
  shopping_list_id: UUID;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  is_checked: boolean;
  priority: ShoppingItemPriority;
  added_from_recipe_id: UUID | null;
  notes: string | null;
}

/**
 * Input type for creating shopping list items
 */
export type ShoppingListItemInput = Omit<ShoppingListItem, "id" | "created_at">;

/**
 * Partial update type for shopping list items
 */
export type ShoppingListItemUpdate = Partial<
  Omit<ShoppingListItemInput, "shopping_list_id">
>;

/**
 * Shopping list item with recipe reference
 */
export interface ShoppingListItemWithRecipe extends ShoppingListItem {
  recipe_title?: string | null;
}

// ============================================================================
// TABLE 7: RECIPE_HISTORY
// ============================================================================

/**
 * User interaction history for personalization
 *
 * Tracks every user interaction with recipes to enable
 * AI-powered personalization and recommendations.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - user_id -> profiles.id
 *   - recipe_id -> recipes.id
 */
export interface RecipeHistory extends CreatedAtField, UserReference {
  id: UUID;
  recipe_id: UUID;
  action: RecipeAction;
  rating: number | null; // 1-5, only for 'rated' actions
  cook_duration: number | null; // actual cooking time in minutes
  notes: string | null;
}

/**
 * Input type for creating recipe history entries
 */
export type RecipeHistoryInput = Omit<RecipeHistory, "id" | "created_at">;

/**
 * Recipe history with recipe details
 */
export interface RecipeHistoryWithRecipe extends RecipeHistory {
  recipe_title: string;
  recipe_image_url: string | null;
}

// ============================================================================
// TABLE 8: NOTIFICATIONS
// ============================================================================

/**
 * User notifications for expiry alerts and suggestions
 *
 * System-generated notifications for inventory management
 * and recipe recommendations.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - user_id -> profiles.id
 *   - related_item_id -> inventory_items.id (nullable)
 *   - related_recipe_id -> recipes.id (nullable)
 */
export interface Notification extends CreatedAtField, UserReference {
  id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  related_item_id: UUID | null;
  related_recipe_id: UUID | null;
  is_read: boolean;
  sent_at: Timestamp;
  read_at: Timestamp | null;
}

/**
 * Input type for creating notifications
 */
export type NotificationInput = Omit<Notification, "id" | "created_at">;

/**
 * Partial update type for notifications (mainly for marking as read)
 */
export type NotificationUpdate = {
  is_read?: boolean;
  read_at?: Timestamp | null;
};

/**
 * Notification with related entity details
 */
export interface NotificationWithDetails extends Notification {
  item_name?: string | null;
  recipe_title?: string | null;
}

// ============================================================================
// TABLE 9: GEMINI_REQUESTS
// ============================================================================

/**
 * AI usage tracking for Gemini API
 *
 * Logs all requests to Google Gemini for usage monitoring,
 * debugging, and optimization.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id
 */
export interface GeminiRequest extends CreatedAtField, UserReference {
  id: UUID;
  prompt_type: GeminiPromptType;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  tokens_used: number;
  success: boolean;
  error_message: string | null;
}

/**
 * Input type for creating Gemini request logs
 */
export type GeminiRequestInput = Omit<GeminiRequest, "id" | "created_at">;

/**
 * Gemini request analytics summary
 */
export interface GeminiRequestStats {
  total_requests: number;
  total_tokens: number;
  success_rate: number;
  average_tokens: number;
  requests_by_type: Record<GeminiPromptType, number>;
}

// ============================================================================
// TABLE 10: GEMINI_CACHE
// ============================================================================

/**
 * Token optimization cache for identical requests
 *
 * Caches Gemini responses to avoid redundant API calls
 * and reduce token consumption.
 *
 * Primary Key: id
 * Unique Constraint: cache_key
 */
export interface GeminiCache extends CreatedAtField {
  id: UUID;
  cache_key: string; // hash of ingredients/request
  response: Record<string, unknown>;
  tokens_saved: number;
  hit_count: number;
  expires_at: Timestamp;
  last_accessed_at: Timestamp;
}

/**
 * Input type for creating cache entries
 */
export type GeminiCacheInput = Omit<
  GeminiCache,
  "id" | "created_at" | "hit_count" | "last_accessed_at"
>;

/**
 * Cache statistics
 */
export interface GeminiCacheStats {
  total_entries: number;
  total_hits: number;
  total_tokens_saved: number;
  cache_hit_rate: number;
}

// ============================================================================
// TABLE 11: AI_RECIPE_FEEDBACK
// ============================================================================

/**
 * User feedback on AI-generated recipes
 *
 * Collects user feedback to monitor and improve
 * AI recipe generation quality.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - user_id -> profiles.id
 *   - recipe_id -> recipes.id
 *   - gemini_request_id -> gemini_requests.id
 */
export interface AIRecipeFeedback extends CreatedAtField, UserReference {
  id: UUID;
  recipe_id: UUID;
  gemini_request_id: UUID;
  feedback_type: FeedbackType;
  rating: number; // 1-5
  issues: AIFeedbackIssue[];
  comments: string | null;
}

/**
 * Input type for creating AI recipe feedback
 */
export type AIRecipeFeedbackInput = Omit<AIRecipeFeedback, "id" | "created_at">;

/**
 * AI recipe feedback summary
 */
export interface AIRecipeFeedbackStats {
  total_feedback: number;
  average_rating: number;
  positive_count: number;
  negative_count: number;
  unsafe_count: number;
  common_issues: Array<{ issue: AIFeedbackIssue; count: number }>;
}

// ============================================================================
// TABLE 12: SAFETY_FLAGS
// ============================================================================

/**
 * Safety flags for dangerous recipe detection
 *
 * Automatically or manually created flags for recipes
 * that may pose health or safety risks.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - recipe_id -> recipes.id (nullable)
 *   - gemini_request_id -> gemini_requests.id (nullable)
 */
export interface SafetyFlag extends CreatedAtField {
  id: UUID;
  recipe_id: UUID | null;
  gemini_request_id: UUID | null;
  flag_type: SafetyFlagType;
  severity: SafetySeverity;
  description: string;
  resolved: boolean;
  resolved_at: Timestamp | null;
}

/**
 * Input type for creating safety flags
 */
export type SafetyFlagInput = Omit<SafetyFlag, "id" | "created_at">;

/**
 * Partial update type for resolving safety flags
 */
export type SafetyFlagUpdate = {
  resolved?: boolean;
  resolved_at?: Timestamp | null;
};

/**
 * Safety flag with recipe details
 */
export interface SafetyFlagWithRecipe extends SafetyFlag {
  recipe_title?: string | null;
}

/**
 * Safety statistics
 */
export interface SafetyStats {
  total_flags: number;
  unresolved_flags: number;
  flags_by_type: Record<SafetyFlagType, number>;
  flags_by_severity: Record<SafetySeverity, number>;
}

// ============================================================================
// TABLE 13: USER_PREFERENCES
// ============================================================================

/**
 * Detailed user preferences for personalization
 *
 * Extended preferences beyond the basic profile,
 * including detailed taste profiles and equipment availability.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id (unique)
 */
export interface UserPreferences extends TimestampFields {
  id: UUID;
  user_id: UUID; // unique constraint
  dietary_restrictions: DietaryRestriction[];
  allergies: string[];
  disliked_ingredients: string[];
  favorite_cuisines: CuisineType[];
  spice_tolerance: number; // 1-5
  cooking_time_preference: CookingTimePreference;
  equipment_available: KitchenEquipment[];
}

/**
 * Input type for creating user preferences
 */
export type UserPreferencesInput = Omit<
  UserPreferences,
  "id" | "created_at" | "updated_at"
>;

/**
 * Partial update type for user preferences
 */
export type UserPreferencesUpdate = Partial<
  Omit<UserPreferencesInput, "user_id">
>;

// ============================================================================
// TABLE 14: INGREDIENT_SUBSTITUTIONS
// ============================================================================

/**
 * User-created ingredient substitutions
 *
 * Learns from user modifications to suggest better
 * substitutions in future recipes.
 *
 * Primary Key: id
 * Foreign Keys:
 *   - user_id -> profiles.id
 *   - recipe_id -> recipes.id (nullable)
 */
export interface IngredientSubstitution extends CreatedAtField, UserReference {
  id: UUID;
  original_ingredient: string;
  substitute_ingredient: string;
  reason: string | null;
  success_rating: number; // 1-5
  recipe_id: UUID | null;
}

/**
 * Input type for creating ingredient substitutions
 */
export type IngredientSubstitutionInput = Omit<
  IngredientSubstitution,
  "id" | "created_at"
>;

/**
 * Partial update type for ingredient substitutions
 */
export type IngredientSubstitutionUpdate = Partial<
  Omit<IngredientSubstitutionInput, "user_id">
>;

/**
 * Substitution suggestion based on user history
 */
export interface SubstitutionSuggestion {
  original: string;
  substitutes: Array<{
    ingredient: string;
    average_rating: number;
    times_used: number;
    common_reason: string | null;
  }>;
}

// ============================================================================
// TABLE 15: USER_BUDGETS
// ============================================================================

/**
 * User spending budget configuration
 *
 * Settings for the Financial Health dashboard to track
 * spending against monthly limits.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id (unique)
 */
export interface UserBudget extends TimestampFields {
  id: UUID;
  user_id: UUID;
  monthly_limit: number;
  currency: string;
  alert_threshold: number; // percentage (e.g. 80)
  rollover_savings: boolean;
  budget_start_day: number;
}

export type UserBudgetInput = Omit<UserBudget, "id" | "created_at" | "updated_at">;
export type UserBudgetUpdate = Partial<UserBudgetInput>;

// ============================================================================
// TABLE 16: TRANSACTIONS
// ============================================================================

/**
 * Financial transactions (Receipts)
 *
 * Logs spending history derived from scanned receipts
 * or manual entry for financial analysis.
 *
 * Primary Key: id
 * Foreign Keys: user_id -> profiles.id
 */
export interface Transaction extends TimestampFields, UserReference {
  id: UUID;
  store_name: string;
  transaction_date: string; // YYYY-MM-DD
  total_amount: number;
  currency: string;
  category_breakdown: Record<string, number>; // { "dairy": 12.50 }
  receipt_image_path?: string | null;
  is_verified: boolean;
  source: 'scan' | 'manual' | 'import';
}

export type TransactionInput = Omit<Transaction, "id" | "created_at" | "updated_at">;
export type TransactionUpdate = Partial<Omit<TransactionInput, "user_id">>;

// ============================================================================
// DATABASE VIEWS AND AGGREGATES
// ============================================================================

/**
 * User dashboard summary
 * Aggregated data for dashboard display
 */
export interface UserDashboardSummary {
  user_id: UUID;
  total_recipes: number;
  favorite_recipes: number;
  total_cooked: number;
  inventory_items: number;
  expiring_soon_count: number;
  active_shopping_lists: number;
  unread_notifications: number;
}

/**
 * Recipe with full user context
 * Recipe enriched with user-specific data
 */
export interface RecipeWithUserContext extends RecipeWithMetadata {
  is_favorited: boolean;
  user_rating: number | null;
  user_notes: string | null;
  cooked_count: number;
  last_cooked_at: Timestamp | null;
  missing_ingredients: RecipeIngredient[];
  available_ingredients: RecipeIngredient[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a recipe is AI-generated
 */
export function isAIGeneratedRecipe(recipe: Recipe): boolean {
  return recipe.source === "ai";
}

/**
 * Type guard to check if a recipe is from an external API
 */
export function isAPIRecipe(recipe: Recipe): boolean {
  return recipe.source === "api";
}

/**
 * Type guard to check if an inventory item is expiring soon
 */
export function isExpiringSoon(
  item: InventoryItem,
  daysThreshold: number = 3
): boolean {
  if (!item.expiry_date) return false;

  const expiryDate = new Date(item.expiry_date);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= daysThreshold && diffDays > 0;
}

/**
 * Type guard to check if an inventory item is expired
 */
export function isExpired(item: InventoryItem): boolean {
  if (!item.expiry_date) return false;

  const expiryDate = new Date(item.expiry_date);
  const now = new Date();

  return expiryDate <= now;
}

/**
 * Type guard to check if a notification is unread
 */
export function isUnreadNotification(notification: Notification): boolean {
  return !notification.is_read;
}

/**
 * Type guard to check if a safety flag is critical
 */
export function isCriticalSafetyFlag(flag: SafetyFlag): boolean {
  return flag.severity === "critical" && !flag.resolved;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total recipe time
 */
export function calculateTotalTime(recipe: Recipe): number {
  return recipe.prep_time + recipe.cook_time;
}

/**
 * Calculate shopping list completion percentage
 */
export function calculateCompletionPercentage(
  totalItems: number,
  checkedItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((checkedItems / totalItems) * 100);
}

/**
 * Calculate days until expiry
 */
export function calculateDaysUntilExpiry(
  expiryDate: Timestamp | null
): number | null {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get expiry status based on days until expiry
 */
export function getExpiryStatus(
  daysUntilExpiry: number | null
): "fresh" | "expiring_soon" | "expired" {
  if (daysUntilExpiry === null) return "fresh";
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 3) return "expiring_soon";
  return "fresh";
}

/**
 * Format recipe rating for display
 */
export function formatRating(rating: number | null): string {
  if (rating === null) return "Not rated";
  return `${rating}/5 ⭐`;
}

/**
 * Format cooking time for display
 */
export function formatCookingTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/**
 * Generate cache key from ingredients
 */
export function generateCacheKey(ingredients: string[]): string {
  return ingredients
    .map((i) => i.toLowerCase().trim())
    .sort()
    .join("|");
}

/**
 * Check if user has dietary restriction
 */
export function hasDietaryRestriction(
  profile: Profile | UserPreferences,
  restriction: DietaryRestriction
): boolean {
  return profile.dietary_restrictions.includes(restriction);
}

/**
 * Check if recipe matches user dietary restrictions
 */
export function matchesDietaryRestrictions(
  _recipe: Recipe,
  _restrictions: DietaryRestriction[]
): boolean {
  // This is a simplified check - in reality, you'd need to analyze ingredients
  // For now, return true (implement logic based on recipe tags/ingredients)
  return true;
}

/**
 * Calculate recipe compatibility score with user preferences
 */
export function calculateCompatibilityScore(
  recipe: Recipe,
  preferences: UserPreferences
): number {
  let score = 100;

  // Deduct points for disliked ingredients
  const recipeIngredients = recipe.ingredients.map((i) =>
    i.name.toLowerCase()
  );
  const disliked = preferences.disliked_ingredients.filter((d) =>
    recipeIngredients.some((ri) => ri.includes(d.toLowerCase()))
  );
  score -= disliked.length * 20;

  // Add points for favorite cuisines
  if (
    recipe.cuisine_type &&
    preferences.favorite_cuisines.includes(recipe.cuisine_type)
  ) {
    score += 10;
  }

  // Deduct points for cooking time mismatch
  const totalTime = calculateTotalTime(recipe);
  if (preferences.cooking_time_preference === "quick" && totalTime > 30) {
    score -= 15;
  }
  if (preferences.cooking_time_preference === "leisurely" && totalTime < 60) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}
