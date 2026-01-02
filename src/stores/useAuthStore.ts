/**
 * 认证状态管理
 */

import { create } from 'zustand';
import { supabase, onAuthStateChange } from '@/lib/supabase';

interface AuthState {
  userId: string | null;
  loading: boolean;
  error: string | null;
  
  // 操作方法
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  loading: true,
  error: null,

  /**
   * 登录
   */
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ userId: data.user?.id || null, loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('登录失败:', error);
      return false;
    }
  },

  /**
   * 注册
   */
  signUp: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({ userId: data.user?.id || null, loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('注册失败:', error);
      return false;
    }
  },

  /**
   * 登出
   */
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ userId: null, error: null });
    } catch (error: any) {
      console.error('登出失败:', error);
    }
  },

  /**
   * 初始化认证状态
   */
  initialize: () => {
    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange((userId) => {
      set({ userId, loading: false });
    });

    // 清理函数
    return () => {
      subscription?.unsubscribe();
    };
  },
}));

