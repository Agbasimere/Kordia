import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

/**
 * Check if connection and tables are ready
 */
export async function checkSupabaseStatus() {
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, tablesReady: false, url: '' };
  }
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      // Table doesn't exist yet (PGRST205)
      return { 
        configured: true, 
        tablesReady: false, 
        url: supabaseUrl, 
        message: error.message 
      };
    }
    return { 
      configured: true, 
      tablesReady: true, 
      url: supabaseUrl 
    };
  } catch (err) {
    return { 
      configured: true, 
      tablesReady: false, 
      url: supabaseUrl, 
      error: err.message 
    };
  }
}

/**
 * Helper to fetch profiles with verified tags from Supabase or fallback
 */
export async function getVerifiedProfiles(fallbackProfiles) {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProfiles;
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_verified', true);
    if (error || !data || data.length === 0) return fallbackProfiles;
    return data;
  } catch (err) {
    console.warn('Supabase fetch profiles error, using local fallback:', err);
    return fallbackProfiles;
  }
}

/**
 * Helper to sync agreement to Supabase
 */
export async function syncAgreementToSupabase(agreement) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('agreements')
      .upsert({
        id: agreement.id,
        creator_tag: agreement.creator_tag,
        client_tag: agreement.client_tag,
        freelancer_tag: agreement.freelancer_tag,
        title: agreement.title,
        description: agreement.description,
        category: agreement.category,
        total_amount: agreement.total_amount,
        currency: agreement.currency || 'USD',
        equivalent_zec: agreement.equivalent_zec || 0,
        status: agreement.status,
        deadline: agreement.deadline,
        objection_window_days: agreement.dispute_terms?.objection_window_days || 7,
        updated_at: new Date().toISOString()
      });
    if (error) {
      console.warn('Supabase agreement upsert notice (schema migration pending):', error.message);
    }
    return !error;
  } catch (err) {
    console.warn('Supabase sync skipped:', err);
    return false;
  }
}

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Upload a deliverable image or file to Supabase Storage 'images' bucket
 */
export async function uploadDeliverableFile(file, agreementId = 'general') {
  const isImage = file.type?.startsWith('image/');
  const formattedSize = formatBytes(file.size);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${agreementId}/${Date.now()}_${cleanName}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.path);

        return {
          name: file.name,
          size: formattedSize,
          type: isImage ? 'image' : 'file',
          url: publicUrlData?.publicUrl || URL.createObjectURL(file),
          path: data.path,
          isUploadedToSupabase: true
        };
      } else {
        console.warn('Supabase storage upload notice, using client preview:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Resilient fallback (DataURL for images, ObjectURL for files)
  return new Promise((resolve) => {
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          size: formattedSize,
          type: 'image',
          url: e.target.result,
          isUploadedToSupabase: false
        });
      };
      reader.onerror = () => {
        resolve({
          name: file.name,
          size: formattedSize,
          type: 'file',
          url: URL.createObjectURL(file),
          isUploadedToSupabase: false
        });
      };
      reader.readAsDataURL(file);
    } else {
      resolve({
        name: file.name,
        size: formattedSize,
        type: 'file',
        url: URL.createObjectURL(file),
        isUploadedToSupabase: false
      });
    }
  });
}
