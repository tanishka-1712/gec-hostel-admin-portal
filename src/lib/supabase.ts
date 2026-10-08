import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Checks if Supabase credentials have been configured with real values.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    envUrl &&
    envKey &&
    envUrl.startsWith('https://') &&
    envUrl.includes('.supabase.co') &&
    !envUrl.includes('your-project-id') &&
    !envKey.includes('your-anon-key')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase] Valid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'The app will fall back to localStorage / mock data until these are configured.'
  );
}

// Provide a safe placeholder URL so createClient does not throw at startup if env is empty
export const supabase = createClient(
  envUrl && envUrl.startsWith('https://') ? envUrl : 'https://placeholder.supabase.co',
  envKey || 'placeholder-anon-key'
);

// ─── Typed helpers ────────────────────────────────────────────────────────────
// Re-export for convenience so consumers only need to import from this file.
export type { SupabaseClient } from '@supabase/supabase-js';

