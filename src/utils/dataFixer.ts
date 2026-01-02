/**
 * 数据修复工具 - 重新计算历史数据
 * 
 * 用于将旧的计算逻辑数据迁移到新逻辑
 */

import { supabase } from '@/lib/supabase';
import { TimelineEntry, FoodCard, WATER_RATIO_CONFIG } from '@/types';
import { calculateIntakeDetailed } from './calculations';

/**
 * 修复所有历史数据
 */
export async function fixAllHistoricalData(userId: string) {
  console.log('🔧 开始修复历史数据...');
  
  try {
    // 1. 获取所有食物卡片
    const { data: foodCards, error: cardsError } = await supabase
      .from('food_cards')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (cardsError) throw cardsError;
    if (!foodCards || foodCards.length === 0) {
      console.log('✅ 没有食物卡片，无需修复');
      return { success: true, message: '没有需要修复的数据' };
    }

    // 2. 获取所有时间线记录
    const { data: entries, error: entriesError } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (entriesError) throw entriesError;

    // 3. 按食物卡片分组处理
    let fixedCount = 0;
    
    for (let i = 0; i < foodCards.length; i++) {
      const card = foodCards[i];
      const result = await fixCardData(card, entries || []);
      fixedCount += result.fixedEntries;
    }

    console.log(`✅ 修复完成！共修复 ${fixedCount} 条记录`);
    return { 
      success: true, 
      message: `成功修复 ${fixedCount} 条记录`,
      fixedCount 
    };
    
  } catch (error: any) {
    console.error('❌ 修复失败:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

/**
 * 修复单个食物卡片的相关数据
 */
async function fixCardData(card: FoodCard, allEntries: TimelineEntry[]) {
  // 筛选该卡片相关的记录
  const cardEntries: TimelineEntry[] = [];
  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    if (entry.related_entity_id === card.id) {
      cardEntries.push(entry);
    }
  }

  // 按时间排序
  cardEntries.sort((a, b) => a.timestamp - b.timestamp);

  // 初始化追踪变量
  let currentFoodWeight = card.initial_weight;
  let currentAddedWater = card.initial_water_added;
  let currentTotalRemaining = card.initial_weight + card.initial_water_added;

  let fixedEntries = 0;

  // 遍历每条记录
  for (let i = 0; i < cardEntries.length; i++) {
    const entry = cardEntries[i];
    const payload = entry.payload as any;

    switch (entry.type) {
      case 'add_water': {
        // 加水：只增加额外加水量
        currentAddedWater += payload.waterAdded || 0;
        currentTotalRemaining = currentFoodWeight + currentAddedWater;
        break;
      }

      case 'add_food': {
        // 加食物：只增加食物重量
        currentFoodWeight += payload.foodAdded || 0;
        currentTotalRemaining = currentFoodWeight + currentAddedWater;
        break;
      }

      case 'update_remaining':
      case 'settle': {
        // 这些是需要重新计算的记录
        const previousRemaining = currentTotalRemaining;
        const newRemaining = entry.type === 'settle' 
          ? payload.finalRemaining 
          : payload.currentRemaining;
        
        const consumedAmount = previousRemaining - newRemaining;

        if (consumedAmount >= 0) {
          // 使用新逻辑重新计算
          const result = calculateIntakeDetailed(
            consumedAmount,
            currentFoodWeight,
            currentAddedWater,
            card.food_type
          );

          // 更新 payload
          const newPayload = {
            ...payload,
            foodConsumed: result.foodConsumed,
            waterConsumed: result.waterConsumed,
            previousFoodWeight: currentFoodWeight,
            currentFoodWeight: result.newFoodWeight,
            previousAddedWater: currentAddedWater,
            currentAddedWater: result.newAddedWater,
            pureFoodConsumed: result.pureFoodConsumed,
            foodWaterConsumed: result.foodWaterConsumed,
            addedWaterConsumed: result.addedWaterConsumed,
          };

          // 更新数据库
          const { error } = await supabase
            .from('timeline_entries')
            .update({ payload: newPayload })
            .eq('id', entry.id);

          if (error) {
            console.error(`更新记录 ${entry.id} 失败:`, error);
          } else {
            fixedEntries++;
            console.log(`✓ 修复记录: ${entry.id}`);
          }

          // 更新追踪变量
          currentFoodWeight = result.newFoodWeight;
          currentAddedWater = result.newAddedWater;
          currentTotalRemaining = currentFoodWeight + currentAddedWater;
        }
        break;
      }

      default:
        break;
    }
  }

  // 更新食物卡片的当前状态
  const { error: cardError } = await supabase
    .from('food_cards')
    .update({
      current_food_weight: currentFoodWeight,
      current_added_water: currentAddedWater,
      current_remaining: currentTotalRemaining,
    })
    .eq('id', card.id);

  if (cardError) {
    console.error(`更新卡片 ${card.id} 失败:`, cardError);
  }

  return { fixedEntries };
}

/**
 * 验证修复结果
 */
export async function verifyFixedData(userId: string) {
  console.log('🔍 验证修复结果...');
  
  try {
    const { data: entries, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['update_remaining', 'settle']);

    if (error) throw error;

    let verifiedCount = 0;
    let needsFixCount = 0;

    if (entries) {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const payload = entry.payload as any;
        
        if (payload.pureFoodConsumed !== undefined) {
          verifiedCount++;
        } else {
          needsFixCount++;
        }
      }
    }

    console.log(`✅ 验证完成: ${verifiedCount} 条已修复, ${needsFixCount} 条待修复`);
    return { verifiedCount, needsFixCount };
    
  } catch (error: any) {
    console.error('验证失败:', error);
    return { verifiedCount: 0, needsFixCount: 0 };
  }
}

