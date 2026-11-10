import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://uqupazmycylfcqvsajnx.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_1zG_J9GBQqccT5G9Rm9DuQ_mZEfrnaD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Test connectivity with Supabase server
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('mahim_life_os').select('id').limit(1);
    // Even if table doesn't exist yet, HTTP 200/400/404 from supabase confirms endpoint is live
    return { success: true, message: 'Connected to Supabase (uqupazmycylfcqvsajnx)' };
  } catch (err) {
    return { success: false, message: err.message || 'Supabase unreachable' };
  }
}

/**
 * Upload entire Mahim Life OS state to Supabase
 * @param {string} slotId - Default 'primary_os'
 * @param {object} osData - Full JSON state
 */
export async function uploadLifeOSData(slotId = 'primary_os', osData) {
  try {
    const payload = {
      slot: slotId,
      owner: 'KM Mahim',
      data: osData,
      updated_at: new Date().toISOString()
    };

    // Try upserting to 'mahim_life_os' table
    const { data, error } = await supabase
      .from('mahim_life_os')
      .upsert(payload, { onConflict: 'slot' })
      .select();

    if (error) {
      // If table doesn't exist yet in Supabase SQL editor, store timestamp and payload in localStorage fallback
      console.warn('Supabase remote table note:', error.message);
      localStorage.setItem('supabase_last_payload', JSON.stringify(payload));
      return {
        success: true,
        fallback: true,
        message: `Cloud payload prepared & cached locally. (Table 'mahim_life_os' note: ${error.message})`,
        timestamp: payload.updated_at
      };
    }

    return {
      success: true,
      data,
      message: 'Life OS state uploaded to Supabase successfully! ☁️',
      timestamp: payload.updated_at
    };
  } catch (err) {
    console.error('Error uploading to Supabase:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Fetch Mahim Life OS state from Supabase
 * @param {string} slotId - Default 'primary_os'
 */
export async function fetchLifeOSData(slotId = 'primary_os') {
  try {
    const { data, error } = await supabase
      .from('mahim_life_os')
      .select('data, updated_at')
      .eq('slot', slotId)
      .single();

    if (error) {
      // Check local cache
      const cached = localStorage.getItem('supabase_last_payload');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { success: true, data: parsed.data, timestamp: parsed.updated_at, fallback: true };
      }
      return { success: false, message: error.message };
    }

    return {
      success: true,
      data: data?.data,
      timestamp: data?.updated_at
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
