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

function classifySupabaseError(error) {
  if (!error) return { needsSetup: false, setupReason: null, message: '' };
  const msg = String(error.message || '');
  const lower = msg.toLowerCase();

  if (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    lower.includes('could not find the table') ||
    lower.includes('does not exist')
  ) {
    return {
      needsSetup: true,
      setupReason: 'missing_table',
      message: "Supabase connected, কিন্তু 'mahim_life_os' টেবিল এখনো তৈরি করা হয়নি।"
    };
  }

  if (error.code === '42501' || lower.includes('row-level security')) {
    return {
      needsSetup: true,
      setupReason: 'rls_blocked',
      message: "টেবিল তৈরি হয়েছে, কিন্তু RLS Policy চালু নেই — SQL-এর POLICY অংশটি রান করুন।"
    };
  }

  return {
    needsSetup: false,
    setupReason: null,
    message: msg || 'Unknown Supabase error'
  };
}

/**
 * Test real connectivity, table existence & read cloud row summary
 */
export async function testSupabaseConnection(slotId = 'primary_os') {
  try {
    const { data, error } = await supabase
      .from('mahim_life_os')
      .select('data, updated_at')
      .eq('slot', slotId)
      .maybeSingle();

    if (error) {
      const classified = classifySupabaseError(error);
      return {
        success: false,
        needsSetup: classified.needsSetup,
        setupReason: classified.setupReason,
        empty: false,
        cloudData: null,
        timestamp: null,
        message: classified.message
      };
    }

    return {
      success: true,
      needsSetup: false,
      setupReason: null,
      empty: !data,
      cloudData: data?.data || null,
      timestamp: data?.updated_at || null,
      message: data
        ? 'Supabase Database Live & Connected 🟢'
        : 'Supabase Live Connected (Cloud টেবিল এখনো খালি — Upload করুন)'
    };
  } catch (err) {
    return {
      success: false,
      needsSetup: false,
      setupReason: null,
      empty: false,
      cloudData: null,
      timestamp: null,
      message: err.message || 'Network unreachable'
    };
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
      .select('slot, updated_at');

    if (error) {
      const classified = classifySupabaseError(error);
      return {
        success: false,
        needsSetup: classified.needsSetup,
        setupReason: classified.setupReason,
        message: classified.message
      };
    }

    return {
      success: true,
      needsSetup: false,
      setupReason: null,
      data,
      message: 'ডেটা সফলভাবে Supabase ডাটাবেসে সেভ হয়েছে! ☁️',
      timestamp: data?.[0]?.updated_at || updatedAt
    };
  } catch (err) {
    return { success: false, needsSetup: false, setupReason: null, message: err.message };
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
      const classified = classifySupabaseError(error);
      return {
        success: false,
        needsSetup: classified.needsSetup,
        setupReason: classified.setupReason,
        message: classified.message
      };
    }

    if (!data) {
      return {
        success: true,
        needsSetup: false,
        empty: true,
        data: null,
        message: 'No cloud record uploaded yet.'
      };
    }

    return {
      success: true,
      needsSetup: false,
      empty: false,
      data: data.data,
      timestamp: data.updated_at
    };
  } catch (err) {
    return { success: false, needsSetup: false, setupReason: null, message: err.message };
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
