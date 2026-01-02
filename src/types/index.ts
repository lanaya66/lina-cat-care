/**
 * 核心数据类型定义
 */

//-------------- 食物类型定义 --------------

/** 食物类型枚举 */
export type FoodType = 'water' | 'dry_food' | 'wet_food' | 'treat' | 'freeze_dried';

/** 食物类型的水分比例配置 */
export const WATER_RATIO_CONFIG: Record<FoodType, number> = {
  water: 1.0,        // 水或奶：100% 水分
  dry_food: 0.08,    // 猫粮：8% 水分
  wet_food: 0.78,    // 罐头：78% 水分
  treat: 0.78,       // 猫条：78% 水分
  freeze_dried: 0.0, // 冻干：0% 水分
};

/** 食物类型中文名称 */
export const FOOD_TYPE_NAMES: Record<FoodType, string> = {
  water: '水/奶',
  dry_food: '猫粮',
  wet_food: '罐头',
  treat: '猫条',
  freeze_dried: '冻干',
};

//-------------- 时间线记录类型 --------------

/** 时间线记录类型枚举 */
export type TimelineEntryType =
  | 'meal_prep'          // 备餐
  | 'add_water'          // 加水
  | 'add_food'           // 加食物
  | 'update_remaining'   // 记录剩余
  | 'settle'             // 结算
  | 'pee'                // 尿团
  | 'poop'               // 大便
  | 'medicine'           // 用药
  | 'status'             // 状态记录
  | 'breathing_rate';    // 安静呼吸数

/** 药物类型 */
export type MedicineType = 'diuretic' | 'mirtazapine' | 'other';

/** 药物类型中文名称 */
export const MEDICINE_TYPE_NAMES: Record<MedicineType, string> = {
  diuretic: '利尿剂',
  mirtazapine: '米氮平',
  other: '其他',
};

//-------------- Payload 类型定义 --------------

/** 备餐记录 */
export interface MealPrepPayload {
  foodType: FoodType;
  foodName: string;
  initialWeight: number;
  initialWaterAdded: number;
  waterRatio: number; // 初始水分比例
}

/** 加水记录 */
export interface AddWaterPayload {
  waterAdded: number;
  previousRemaining: number;
  newRemaining: number;
  previousWaterRatio: number;
  newWaterRatio: number;
}

/** 加食物记录 */
export interface AddFoodPayload {
  foodAdded: number;
  previousRemaining: number;
  newRemaining: number;
  previousWaterRatio: number;
  newWaterRatio: number;
}

/** 更新剩余量记录 */
export interface UpdateRemainingPayload {
  previousRemaining: number;
  currentRemaining: number;
  consumedAmount: number;
  foodConsumed: number;    // 食物摄入量（纯食物，不包括额外加的水）
  waterConsumed: number;   // 水摄入量（食物自身的水 + 额外加的水）
  waterRatio: number;      // 当时的水分比例
  // 新增：详细追踪
  previousFoodWeight?: number;
  currentFoodWeight?: number;
  previousAddedWater?: number;
  currentAddedWater?: number;
  pureFoodConsumed?: number;    // 纯食物摄入（不包括食物自身的水）
  foodWaterConsumed?: number;   // 食物自身水分摄入
  addedWaterConsumed?: number;  // 额外加水摄入
}

/** 结算记录 */
export interface SettlePayload {
  previousRemaining: number;
  finalRemaining: number;
  consumedAmount: number;
  foodConsumed: number;
  waterConsumed: number;
  waterRatio: number;
  // 新增：详细追踪
  previousFoodWeight?: number;
  currentFoodWeight?: number;
  previousAddedWater?: number;
  currentAddedWater?: number;
  pureFoodConsumed?: number;
  foodWaterConsumed?: number;
  addedWaterConsumed?: number;
}

/** 尿团记录 */
export interface PeePayload {
  weight: number; // 克
}

/** 大便记录 */
export interface PoopPayload {
  weight: number; // 克
}

/** 用药记录 */
export interface MedicinePayload {
  medicineType: MedicineType;
  medicineName?: string; // 当类型为 'other' 时填写
  dosage: number; // 克
}

/** 状态记录 */
export interface StatusPayload {
  note: string;
}

/** 安静呼吸数记录 */
export interface BreathingRatePayload {
  rate: number; // 次/分钟
}

/** 时间线记录的 payload 联合类型 */
export type TimelinePayload =
  | MealPrepPayload
  | AddWaterPayload
  | AddFoodPayload
  | UpdateRemainingPayload
  | SettlePayload
  | PeePayload
  | PoopPayload
  | MedicinePayload
  | StatusPayload
  | BreathingRatePayload;

//-------------- 数据库表结构 --------------

/** 时间线记录（数据库表） */
export interface TimelineEntry {
  id: string;
  user_id: string;
  timestamp: number;              // Unix 时间戳（毫秒）
  type: TimelineEntryType;
  related_entity_id?: string;     // 关联的 FoodCard ID
  payload: TimelinePayload;
  created_at: string;             // ISO 8601 字符串
}

/** 食物卡片（数据库表） */
export interface FoodCard {
  id: string;
  user_id: string;
  food_type: FoodType;
  food_name: string;
  start_time: number;             // Unix 时间戳（毫秒）
  initial_weight: number;
  initial_water_added: number;
  current_remaining: number;
  current_water_ratio: number;    // 动态变化的水分比例
  status: 'active' | 'settled';
  created_at: string;
  // 新增：分别追踪食物和额外加水
  current_food_weight?: number;   // 当前食物重量（不包括额外加的水）
  current_added_water?: number;   // 当前额外加的水量
}

//-------------- 统计数据结构 --------------

/** 每日统计 */
export interface DailySummary {
  date: string;                   // YYYY-MM-DD
  foodIntake: number;             // 干物质食物摄入总量（克，不含水分）
  waterIntake: number;            // 水摄入总量（克）
  peeTotal: number;               // 尿团总重量（克）
  poopTotal: number;              // 大便总重量（克）
  medicineTotal: number;          // 药物总量（克）
  breathingRates: number[];       // 安静呼吸数列表（次/分钟）
  statusNotes: string[];          // 状态记录列表
}

//-------------- UI 表单数据结构 --------------

/** 备餐表单数据 */
export interface MealPrepFormData {
  foodType: FoodType;
  foodName: string;
  initialWeight: string;
  initialWaterAdded: string;
  timestamp: number;
  isFullyConsumed?: boolean; // 是否已经全部吃完（创建时直接结算）
}

// 表单提交回调类型
export type FormSubmitHandler<T> = (data: T) => Promise<void> | void;

/** 添加记录表单数据 */
export interface AddRecordFormData {
  type: 'pee' | 'poop' | 'medicine' | 'status' | 'breathing_rate';
  timestamp: number;
  weight?: string;                // 尿团/大便重量
  medicineType?: MedicineType;
  medicineName?: string;
  dosage?: string;
  note?: string;
  breathingRate?: string;         // 安静呼吸数（次/分钟）
}

