/**
 * 食物卡片状态管理
 */

import { create } from 'zustand';
import { FoodCard, FoodType } from '@/types';
import { supabase, getCurrentUserId } from '@/lib/supabase';

interface FoodCardState {
  cards: FoodCard[];
  loading: boolean;
  error: string | null;
  
  // 操作方法
  fetchActiveCards: () => Promise<void>;
  createCard: (card: Omit<FoodCard, 'id' | 'user_id' | 'created_at' | 'status'>) => Promise<FoodCard | null>;
  updateCard: (id: string, updates: Partial<FoodCard>) => Promise<void>;
  settleCard: (id: string) => Promise<void>;
  clearCards: () => void;
}

export const useFoodCardStore = create<FoodCardState>((set, get) => ({
  cards: [],
  loading: false,
  error: null,

  /**
   * 获取所有活动中的食物卡片
   */
  fetchActiveCards: async () => {
    set({ loading: true, error: null });
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('未登录');
      }

      const { data, error } = await supabase
        .from('food_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;

      set({ cards: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('获取食物卡片失败:', error);
    }
  },

  /**
   * 创建新的食物卡片
   */
  createCard: async (card) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('未登录');
      }

      const newCard = {
        ...card,
        user_id: userId,
        status: 'active' as const,
      };

      const { data, error } = await supabase
        .from('food_cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;

      // 添加到本地状态并重新排序
      set((state) => ({
        cards: [data, ...state.cards].sort((a, b) => b.start_time - a.start_time),
      }));

      return data;
    } catch (error: any) {
      console.error('创建食物卡片失败:', error);
      set({ error: error.message });
      return null;
    }
  },

  /**
   * 更新食物卡片
   */
  updateCard: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('food_cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // 更新本地状态
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, ...updates } : card
        ),
      }));
    } catch (error: any) {
      console.error('更新食物卡片失败:', error);
      set({ error: error.message });
    }
  },

  /**
   * 结算食物卡片（设置为已结算状态）
   */
  settleCard: async (id) => {
    try {
      const { error } = await supabase
        .from('food_cards')
        .update({ status: 'settled' })
        .eq('id', id);

      if (error) throw error;

      // 从本地状态移除（因为只显示 active 的）
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
      }));
    } catch (error: any) {
      console.error('结算食物卡片失败:', error);
      set({ error: error.message });
    }
  },

  /**
   * 清空卡片
   */
  clearCards: () => {
    set({ cards: [], error: null });
  },
}));

