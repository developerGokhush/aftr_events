import { createClient } from "@supabase/supabase-js";

// In production, make sure these are set in your .env.local file!
// If you're doing server-side operations that need to bypass RLS, it's recommended to 
// create a separate export using the SUPABASE_SERVICE_ROLE_KEY environment variable.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbG..";

export const supabase = createClient(supabaseUrl, supabaseKey);
