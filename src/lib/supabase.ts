import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to check connection
export const testSupabaseConnection = async () => {
  try {
    // Use underscore prefix to indicate intentionally unused variable
    const { error } = await supabase.from("profiles").select("count");

    if (error) {
      console.error("Supabase connection error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Connected to Supabase!" };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected connection error" };
  }
};
