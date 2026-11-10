import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_REF = 'uqupazmycylfcqvsajnx';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_1zG_J9GBQqccT5G9Rm9DuQ_mZEfrnaD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

function isMissingTableError(error) {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    (error.message && error.message.includes('Could not find the table'))
  );
}

/**
 * Test real connectivity & table existence in Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('mahim_life_os').select('slot').limit(1);
    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          needsSetup: true,
          message: "Supabase connected, কিন্তু 'mahim_life_os' টেবিল এখনো তৈরি করা হয়নি!"
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, needsSetup: false, message: 'Supabase Database Live & Connected 🟢' };
  } catch (err) {
    return { success: false, message: err.message || 'Network unreachable' };
  }
}

/**
 * Upload entire Mahim Life OS state to Supabase PostgreSQL table
 */
export async function uploadLifeOSData(slotId = 'primary_os', osData) {
  try {
    const updatedAt = new Date().toISOString();
    const payload = {
      slot: slotId,
      owner: 'KM Mahim',
      data: osData,
      updated_at: updatedAt
    };

    const { data, error } = await supabase
      .from('mahim_life_os')
      .upsert(payload, { onConflict: 'slot' })
      .select();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          needsSetup: true,
          message: "ডাটাবেস টেবিল 'mahim_life_os' নেই — নিচের ১-ক্লিক SQL রান করে টেবিল তৈরি করুন।"
        };
      }
      return { success: false, message: error.message };
    }

    return {
      success: true,
      needsSetup: false,
      data,
      message: 'ডেটা সফলভাবে Supabase ডাটাবেসে সেভ হয়েছে! ☁️',
      timestamp: updatedAt
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetch latest Mahim Life OS state from Supabase PostgreSQL table
 */
export async function fetchLifeOSData(slotId = 'primary_os') {
  try {
    const { data, error } = await supabase
      .from('mahim_life_os')
      .select('data, updated_at')
      .eq('slot', slotId)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return {
          success: false,
          needsSetup: true,
          message: "ডাটাবেস টেবিল 'mahim_life_os' এখনো তৈরি করা হয়নি।"
        };
      }
      return { success: false, message: error.message };
    }

    if (!data) {
      return { success: true, empty: true, data: null, message: 'No cloud record uploaded yet.' };
    }

    return {
      success: true,
      needsSetup: false,
      data: data.data,
      timestamp: data.updated_at
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Subscribe to real-time updates from Supabase (Laptop <-> Mobile instant sync)
 */
export function subscribeToLifeOS(slotId = 'primary_os', onRemoteUpdate) {
  const channel = supabase
    .channel(`life_os_${slotId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mahim_life_os',
        filter: `slot=eq.${slotId}`
      },
      (payload) => {
        if (payload.new && payload.new.data) {
          onRemoteUpdate(payload.new.data, payload.new.updated_at);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
