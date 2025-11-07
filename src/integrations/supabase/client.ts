// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";

// Fallback mock client to avoid crashes when credentials are missing
const mockSupabase = {
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    eq: () => ({
      select: async () => ({ data: [], error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      order: () => ({ select: async () => ({ data: [], error: null }) }),
    }),
  }),
  rpc: async () => ({ data: null, error: null }),
  auth: {
    signInWithPassword: async () => ({ data: null, error: null } as any),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null } as any),
  },
} as unknown as ReturnType<typeof createClient<Database>>;

export const supabase =
  (SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : mockSupabase) as any;

if (!(SUPABASE_URL && SUPABASE_KEY)) {
  console.warn("[cloud] Supabase credentials not configured. Using mock client.");
}
