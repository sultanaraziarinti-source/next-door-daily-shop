import { createClient } from "@supabase/supabase-js";

// These come from your Supabase project: Settings → API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket used for product/category images
export const IMAGE_BUCKET = "product-images";
