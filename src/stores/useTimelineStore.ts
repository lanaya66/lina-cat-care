/**
 * 时间线数据状态管理
 */

import { create } from 'zustand';
import { TimelineEntry } from '@/types';
import { supabase, getCurrentUserId } from '@/lib/supabase';

interface TimelineState {
  entries: TimelineEntry[];
  loading: boolean;
  error: string | null;
  
  // 操作方法
  fetchEntries: (startTime?: number, endTime?: number) => Promise<void>;
  addEntry: (entry: Omit<TimelineEntry, 'id' | 'user_id' | 'created_at'>) => Promise<TimelineEntry | null>;
  updateEntry: (id: string, updates: Partial<TimelineEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearEntries: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  /**
   * 获取时间线记录
   */
  fetchEntries: async (startTime?: number, endTime?: number) => {
    set({ loading: true, error: null });
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('未登录');
      }

      let query = supabase
        .from('timeline_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      // 如果指定了时间范围
      if (startTime !== undefined) {
        query = query.gte('timestamp', startTime);
      }
      if (endTime !== undefined) {
        query = query.lte('timestamp', endTime);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ entries: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('获取时间线失败:', error);
    }
  },

  /**
   * 添加时间线记录
   */
  addEntry: async (entry) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('未登录');
      }

      const newEntry = {
        ...entry,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('timeline_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;

      // 添加到本地状态
      set((state) => ({
        entries: [data, ...state.entries].sort((a, b) => b.timestamp - a.timestamp),
      }));

      return data;
    } catch (error: any) {
      console.error('添加时间线记录失败:', error);
      set({ error: error.message });
      return null;
    }
  },

  /**
   * 更新时间线记录
   */
  updateEntry: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('timeline_entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // 更新本地状态
      set((state) => ({
        entries: state.entries
          .map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
          .sort((a, b) => b.timestamp - a.timestamp),
      }));
    } catch (error: any) {
      console.error('更新时间线记录失败:', error);
      set({ error: error.message });
    }
  },

  /**
   * 删除时间线记录
   */
  deleteEntry: async (id) => {
    try {
      const { error } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 从本地状态移除
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));
    } catch (error: any) {
      console.error('删除时间线记录失败:', error);
      set({ error: error.message });
    }
  },

  /**
   * 清空时间线
   */
  clearEntries: () => {
    set({ entries: [], error: null });
  },
}));

