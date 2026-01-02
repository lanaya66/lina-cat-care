/**
 * "正在吃的"页面
 */

import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useFoodCardStore } from '@/stores/useFoodCardStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { FoodCard, MealPrepFormData } from '@/types';
import {
  calculateInitialWaterRatio,
  calculateAfterAddingWater,
  calculateAfterAddingFood,
  calculateIntakeDetailed,
} from '@/utils/calculations';
import MealPrepForm from '@/components/MealPrepForm';
import FoodCardItem from '@/components/FoodCardItem';
import FoodCardActions from '@/components/FoodCardActions';

export default function ActiveMealsPage() {
  const { cards, loading, fetchActiveCards, createCard, updateCard, settleCard } = useFoodCardStore();
  const { addEntry } = useTimelineStore();
  
  const [showMealPrepForm, setShowMealPrepForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FoodCard | null>(null);

  // 加载食物卡片
  useEffect(() => {
    fetchActiveCards();
  }, [fetchActiveCards]);

  // 当页面重新获得焦点时刷新数据
  useEffect(() => {
    const handleFocus = () => {
      fetchActiveCards();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchActiveCards]);

  // 处理备餐提交
  const handleMealPrepSubmit = async (data: MealPrepFormData) => {
    try {
      const initialWeight = parseFloat(data.initialWeight);
      const initialWaterAdded = parseFloat(data.initialWaterAdded);

      // 计算初始水分比例
      const { waterRatio, totalRemaining } = calculateInitialWaterRatio(
        initialWeight,
        initialWaterAdded,
        data.foodType
      );

      // 创建食物卡片
      const card = await createCard({
        food_type: data.foodType,
        food_name: data.foodName,
        start_time: data.timestamp,
        initial_weight: initialWeight,
        initial_water_added: initialWaterAdded,
        current_remaining: totalRemaining,
        current_water_ratio: waterRatio,
        current_food_weight: initialWeight,
        current_added_water: initialWaterAdded,
      });

      if (!card) {
        alert('创建食物卡片失败，请检查控制台查看详细错误信息');
        return;
      }

      // 添加备餐时间线记录
      const timelineEntry = await addEntry({
        timestamp: data.timestamp,
        type: 'meal_prep',
        related_entity_id: card.id,
        payload: {
          foodType: data.foodType,
          foodName: data.foodName,
          initialWeight,
          initialWaterAdded,
          waterRatio,
        },
      });

      if (!timelineEntry) {
        alert('创建时间线记录失败，请检查控制台查看详细错误信息');
        return;
      }

      // 如果勾选了"已经全部吃完"，则立即结算
      if (data.isFullyConsumed) {
        const consumedAmount = totalRemaining; // 全部消耗
        const {
          foodConsumed,
          waterConsumed,
          pureFoodConsumed,
          foodWaterConsumed,
          addedWaterConsumed,
        } = calculateIntakeDetailed(
          consumedAmount,
          initialWeight,
          initialWaterAdded,
          data.foodType
        );

        // 添加结算时间线记录
        await addEntry({
          timestamp: data.timestamp + 1, // 略微延后1ms，确保在备餐记录之后
          type: 'settle',
          related_entity_id: card.id,
          payload: {
            previousRemaining: totalRemaining,
            finalRemaining: 0,
            consumedAmount,
            foodConsumed,
            waterConsumed,
            waterRatio,
            previousFoodWeight: initialWeight,
            currentFoodWeight: 0,
            previousAddedWater: initialWaterAdded,
            currentAddedWater: 0,
            pureFoodConsumed,
            foodWaterConsumed,
            addedWaterConsumed,
          },
        });

        // 结算卡片
        await settleCard(card.id);
      }

      // 刷新卡片列表以确保显示
      await fetchActiveCards();

      // 成功后关闭表单
      setShowMealPrepForm(false);
      alert(data.isFullyConsumed ? '备餐添加并结算成功！' : '备餐添加成功！');
    } catch (error: any) {
      console.error('添加备餐时发生错误:', error);
      alert(`添加备餐失败: ${error.message || '未知错误'}`);
    }
  };

  // 编辑备餐数据（暂时简化，直接提示用户）
  const handleEditMealPrep = () => {
    alert('编辑备餐功能开发中');
    setSelectedCard(null);
  };

  // 加水
  const handleAddWater = async (waterAdded: number, timestamp: number) => {
    if (!selectedCard) return;

    const currentFoodWeight = selectedCard.current_food_weight || selectedCard.initial_weight;
    const currentAddedWater = selectedCard.current_added_water || selectedCard.initial_water_added;

    const { newWaterRatio, newAddedWater } = calculateAfterAddingWater(
      currentFoodWeight,
      currentAddedWater,
      waterAdded,
      selectedCard.food_type
    );

    const newRemaining = currentFoodWeight + newAddedWater;

    // 更新卡片
    await updateCard(selectedCard.id, {
      current_remaining: newRemaining,
      current_water_ratio: newWaterRatio,
      current_added_water: newAddedWater,
    });

    // 添加时间线记录
    await addEntry({
      timestamp,
      type: 'add_water',
      related_entity_id: selectedCard.id,
      payload: {
        waterAdded,
        previousRemaining: selectedCard.current_remaining,
        newRemaining,
        previousWaterRatio: selectedCard.current_water_ratio,
        newWaterRatio,
      },
    });

    setSelectedCard(null);
  };

  // 加食物
  const handleAddFood = async (foodAdded: number, timestamp: number) => {
    if (!selectedCard) return;

    const currentFoodWeight = selectedCard.current_food_weight || selectedCard.initial_weight;
    const currentAddedWater = selectedCard.current_added_water || selectedCard.initial_water_added;

    const { newWaterRatio, newFoodWeight } = calculateAfterAddingFood(
      currentFoodWeight,
      currentAddedWater,
      foodAdded,
      selectedCard.food_type
    );

    const newRemaining = newFoodWeight + currentAddedWater;

    // 更新卡片
    await updateCard(selectedCard.id, {
      current_remaining: newRemaining,
      current_water_ratio: newWaterRatio,
      current_food_weight: newFoodWeight,
    });

    // 添加时间线记录
    await addEntry({
      timestamp,
      type: 'add_food',
      related_entity_id: selectedCard.id,
      payload: {
        foodAdded,
        previousRemaining: selectedCard.current_remaining,
        newRemaining,
        previousWaterRatio: selectedCard.current_water_ratio,
        newWaterRatio,
      },
    });

    setSelectedCard(null);
  };

  // 记录剩余
  const handleUpdateRemaining = async (remaining: number, timestamp: number) => {
    if (!selectedCard) return;

    const consumedAmount = selectedCard.current_remaining - remaining;
    
    // 摄入量不能为负
    if (consumedAmount < 0) {
      alert('剩余量不能大于当前剩余量');
      return;
    }

    const currentFoodWeight = selectedCard.current_food_weight || selectedCard.initial_weight;
    const currentAddedWater = selectedCard.current_added_water || selectedCard.initial_water_added;

    const {
      foodConsumed,
      waterConsumed,
      pureFoodConsumed,
      foodWaterConsumed,
      addedWaterConsumed,
      newFoodWeight,
      newAddedWater,
    } = calculateIntakeDetailed(
      consumedAmount,
      currentFoodWeight,
      currentAddedWater,
      selectedCard.food_type
    );

    // 更新卡片
    await updateCard(selectedCard.id, {
      current_remaining: remaining,
      current_food_weight: newFoodWeight,
      current_added_water: newAddedWater,
    });

    // 添加时间线记录
    await addEntry({
      timestamp,
      type: 'update_remaining',
      related_entity_id: selectedCard.id,
      payload: {
        previousRemaining: selectedCard.current_remaining,
        currentRemaining: remaining,
        consumedAmount,
        foodConsumed,
        waterConsumed,
        waterRatio: selectedCard.current_water_ratio,
        previousFoodWeight: currentFoodWeight,
        currentFoodWeight: newFoodWeight,
        previousAddedWater: currentAddedWater,
        currentAddedWater: newAddedWater,
        pureFoodConsumed,
        foodWaterConsumed,
        addedWaterConsumed,
      },
    });

    setSelectedCard(null);
  };

  // 结算
  const handleSettle = async (finalRemaining: number, timestamp: number) => {
    if (!selectedCard) return;

    const consumedAmount = selectedCard.current_remaining - finalRemaining;
    
    if (consumedAmount < 0) {
      alert('剩余量不能大于当前剩余量');
      return;
    }

    const currentFoodWeight = selectedCard.current_food_weight || selectedCard.initial_weight;
    const currentAddedWater = selectedCard.current_added_water || selectedCard.initial_water_added;

    const {
      foodConsumed,
      waterConsumed,
      pureFoodConsumed,
      foodWaterConsumed,
      addedWaterConsumed,
      newFoodWeight,
      newAddedWater,
    } = calculateIntakeDetailed(
      consumedAmount,
      currentFoodWeight,
      currentAddedWater,
      selectedCard.food_type
    );

    // 添加时间线记录
    await addEntry({
      timestamp,
      type: 'settle',
      related_entity_id: selectedCard.id,
      payload: {
        previousRemaining: selectedCard.current_remaining,
        finalRemaining,
        consumedAmount,
        foodConsumed,
        waterConsumed,
        waterRatio: selectedCard.current_water_ratio,
        previousFoodWeight: currentFoodWeight,
        currentFoodWeight: newFoodWeight,
        previousAddedWater: currentAddedWater,
        currentAddedWater: newAddedWater,
        pureFoodConsumed,
        foodWaterConsumed,
        addedWaterConsumed,
      },
    });

    // 结算卡片
    await settleCard(selectedCard.id);

    setSelectedCard(null);
  };

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">正在吃的</h1>
          <button
            onClick={() => fetchActiveCards()}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="刷新列表"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="page-content">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg mb-2">还没有食物</p>
            <p className="text-sm">点击下方按钮添加备餐</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <FoodCardItem
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => setShowMealPrepForm(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all z-10"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* 备餐表单 */}
      {showMealPrepForm && (
        <MealPrepForm
          onClose={() => setShowMealPrepForm(false)}
          onSubmit={handleMealPrepSubmit}
        />
      )}

      {/* 食物卡片操作 */}
      {selectedCard && (
        <FoodCardActions
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onEditMealPrep={handleEditMealPrep}
          onAddWater={handleAddWater}
          onAddFood={handleAddFood}
          onUpdateRemaining={handleUpdateRemaining}
          onSettle={handleSettle}
        />
      )}
    </div>
  );
}

