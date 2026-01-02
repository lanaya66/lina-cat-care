/**
 * 核心计算逻辑：摄入量、剩余量、水分比例等
 * 
 * 重要概念：
 * - 食物重量：食物本身的重量（包含其自身的水分）
 * - 额外加水：后续添加的纯水重量
 * - 总剩余量 = 食物重量 + 额外加水
 * 
 * 水分比例 = (食物重量 × 食物类型含水比 + 额外加水) / 总剩余量
 */

import { WATER_RATIO_CONFIG, FoodType } from '@/types';

/**
 * 计算食物和水的摄入量（新版本 - 正确区分食物和水）
 * @param consumedAmount 消耗总量（克）
 * @param foodWeight 当前食物重量（克）
 * @param addedWater 当前额外加水量（克）
 * @param foodType 食物类型
 * @returns { foodConsumed: 食物摄入量, waterConsumed: 水摄入量, 详细分解 }
 */
export function calculateIntakeDetailed(
  consumedAmount: number,
  foodWeight: number,
  addedWater: number,
  foodType: FoodType
) {
  const totalRemaining = foodWeight + addedWater;
  
  if (totalRemaining === 0) {
    return {
      foodConsumed: 0,
      waterConsumed: 0,
      pureFoodConsumed: 0,
      foodWaterConsumed: 0,
      addedWaterConsumed: 0,
      newFoodWeight: 0,
      newAddedWater: 0,
    };
  }
  
  // 按比例计算消耗的食物和水
  const foodRatio = foodWeight / totalRemaining;
  const waterRatio = addedWater / totalRemaining;
  
  const consumedFood = consumedAmount * foodRatio;
  const consumedAddedWater = consumedAmount * waterRatio;
  
  // 食物本身的水分
  const foodWaterRatio = WATER_RATIO_CONFIG[foodType];
  const consumedFoodWater = consumedFood * foodWaterRatio;
  const consumedPureFood = consumedFood * (1 - foodWaterRatio);
  
  // 更新后的重量
  const newFoodWeight = Math.max(0, foodWeight - consumedFood);
  const newAddedWater = Math.max(0, addedWater - consumedAddedWater);
  
  return {
    foodConsumed: Math.max(0, consumedFood),              // 食物摄入量（包含其自身水分）
    waterConsumed: Math.max(0, consumedFoodWater + consumedAddedWater), // 总水摄入
    pureFoodConsumed: Math.max(0, consumedPureFood),     // 纯固体摄入
    foodWaterConsumed: Math.max(0, consumedFoodWater),   // 食物中的水
    addedWaterConsumed: Math.max(0, consumedAddedWater), // 额外加的水
    newFoodWeight,
    newAddedWater,
  };
}

/**
 * 计算加水后的新水分比例
 * @param currentFoodWeight 当前食物重量（克）
 * @param currentAddedWater 当前额外加水量（克）
 * @param waterAdded 新加水量（克）
 * @param foodType 食物类型
 * @returns { newWaterRatio, newAddedWater }
 */
export function calculateAfterAddingWater(
  currentFoodWeight: number,
  currentAddedWater: number,
  waterAdded: number,
  foodType: FoodType
) {
  const newAddedWater = currentAddedWater + waterAdded;
  const totalRemaining = currentFoodWeight + newAddedWater;
  
  if (totalRemaining === 0) {
    return { newWaterRatio: 0, newAddedWater: 0 };
  }
  
  // 食物本身的水分
  const foodWaterRatio = WATER_RATIO_CONFIG[foodType];
  const foodWater = currentFoodWeight * foodWaterRatio;
  
  // 总水分 = 食物中的水 + 额外加的水
  const totalWater = foodWater + newAddedWater;
  const newWaterRatio = Math.min(1, totalWater / totalRemaining);
  
  return { newWaterRatio, newAddedWater };
}

/**
 * 计算加食物后的新水分比例
 * @param currentFoodWeight 当前食物重量（克）
 * @param currentAddedWater 当前额外加水量（克）
 * @param foodAdded 加食物量（克）
 * @param foodType 食物类型
 * @returns { newWaterRatio, newFoodWeight }
 */
export function calculateAfterAddingFood(
  currentFoodWeight: number,
  currentAddedWater: number,
  foodAdded: number,
  foodType: FoodType
) {
  const newFoodWeight = currentFoodWeight + foodAdded;
  const totalRemaining = newFoodWeight + currentAddedWater;
  
  if (totalRemaining === 0) {
    return { newWaterRatio: 0, newFoodWeight: 0 };
  }
  
  // 食物本身的水分
  const foodWaterRatio = WATER_RATIO_CONFIG[foodType];
  const foodWater = newFoodWeight * foodWaterRatio;
  
  // 总水分 = 食物中的水 + 额外加的水
  const totalWater = foodWater + currentAddedWater;
  const newWaterRatio = Math.min(1, totalWater / totalRemaining);
  
  return { newWaterRatio, newFoodWeight };
}

/**
 * 计算初始水分比例（备餐时）
 * @param initialWeight 初始食物重量（克）
 * @param initialWaterAdded 初始加水量（克）
 * @param foodType 食物类型
 * @returns { waterRatio, totalRemaining }
 */
export function calculateInitialWaterRatio(
  initialWeight: number,
  initialWaterAdded: number,
  foodType: FoodType
) {
  const totalRemaining = initialWeight + initialWaterAdded;
  
  if (totalRemaining === 0) {
    return { waterRatio: 0, totalRemaining: 0 };
  }
  
  // 食物本身的水分
  const foodWaterRatio = WATER_RATIO_CONFIG[foodType];
  const foodWater = initialWeight * foodWaterRatio;
  
  // 总水分 = 食物本身的水分 + 加的水
  const totalWater = foodWater + initialWaterAdded;
  const waterRatio = Math.min(1, totalWater / totalRemaining);
  
  return { waterRatio, totalRemaining };
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
