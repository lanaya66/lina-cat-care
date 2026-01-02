/**
 * Supabase 客户端配置
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置（需要替换为实际的值）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 检查配置是否有效
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         !supabaseUrl.includes('placeholder') && 
         !supabaseAnonKey.includes('placeholder');
};

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * 获取当前用户 ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id || null);
  });
}

