import { createClient } from '@supabase/supabase-js';

// Prefer REACT_APP_ env vars (Create React App), but also support plain names
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development, log a helpful warning so it's easier to debug misconfigured env vars
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn('[Supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY env vars');
  }
}

// Create a single Supabase client instance for the app.
// We set the apikey header, and let supabase-js attach the current user's
// Authorization bearer token automatically when a session exists.
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  // Match the Functions URL shape used in curl:
  //   https://<ref>.supabase.co/functions/v1/<fn-name>
  functions: supabaseUrl
    ? {
        url: `${supabaseUrl}/functions/v1`,
      }
    : undefined,
  global: {
    headers: {
      // Public anon key – safe to send to Supabase
      apikey: supabaseAnonKey || '',
      // Do NOT set Authorization here. supabase-js will use the logged-in
      // user's access token for auth.getUser() and Edge Functions.
    },
  },
});

export default supabase;
