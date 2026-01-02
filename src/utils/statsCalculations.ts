/**
 * 统计计算工具函数
 */

import { TimelineEntry, DailySummary } from '@/types';
import { getStartOfDay, getEndOfDay } from './dateHelpers';

/**
 * 计算指定日期的统计数据
 * @param entries 时间线记录
 * @param date 日期（Date 或时间戳）
 * @returns 每日统计
 */
export function calculateDailyStats(entries: TimelineEntry[], date: Date | number): DailySummary {
  const startTime = getStartOfDay(date);
  const endTime = getEndOfDay(date);

  // 筛选该日期范围内的记录
  const dailyEntries: TimelineEntry[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.timestamp >= startTime && entry.timestamp <= endTime) {
      dailyEntries.push(entry);
    }
  }

  let foodIntake = 0;
  let waterIntake = 0;
  let peeTotal = 0;
  let poopTotal = 0;
  let medicineTotal = 0;
  const breathingRates: number[] = [];
  const statusNotes: string[] = [];

  // 遍历该日期的记录并累加统计
  for (let i = 0; i < dailyEntries.length; i++) {
    const entry = dailyEntries[i];
    const payload = entry.payload as any;

    switch (entry.type) {
      case 'update_remaining':
      case 'settle':
        // 这两种类型会产生摄入量
        // 使用干物质食物量（不包含食物自身水分）
        if (payload.pureFoodConsumed !== undefined) {
          // 新数据：使用 pureFoodConsumed（干物质）
          foodIntake += payload.pureFoodConsumed;
        } else if (payload.foodConsumed !== undefined && payload.waterRatio !== undefined) {
          // 旧数据兼容：从 foodConsumed 计算干物质
          const pureFoodConsumed = payload.foodConsumed * (1 - payload.waterRatio);
          foodIntake += pureFoodConsumed;
        }
        
        if (payload.waterConsumed !== undefined) {
          waterIntake += payload.waterConsumed;
        }
        break;

      case 'pee':
        peeTotal += payload.weight || 0;
        break;

      case 'poop':
        poopTotal += payload.weight || 0;
        break;

      case 'medicine':
        medicineTotal += payload.dosage || 0;
        break;

      case 'breathing_rate':
        if (payload.rate !== undefined) {
          breathingRates.push(payload.rate);
        }
        break;

      case 'status':
        if (payload.note) {
          statusNotes.push(payload.note);
        }
        break;

      default:
        break;
    }
  }

  // 格式化日期字符串
  const dateObj = new Date(startTime);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  return {
    date: dateString,
    foodIntake: Math.max(0, foodIntake),
    waterIntake: Math.max(0, waterIntake),
    peeTotal: Math.max(0, peeTotal),
    poopTotal: Math.max(0, poopTotal),
    medicineTotal: Math.max(0, medicineTotal),
    breathingRates,
    statusNotes,
  };
}

/**
 * 计算多天的统计数据
 * @param entries 时间线记录
 * @param days 天数数组（Date 或时间戳）
 * @returns 每日统计数组
 */
export function calculateMultipleDaysStats(
  entries: TimelineEntry[],
  days: (Date | number)[]
): DailySummary[] {
  const results: DailySummary[] = [];
  
  for (let i = 0; i < days.length; i++) {
    const stats = calculateDailyStats(entries, days[i]);
    results.push(stats);
  }
  
  return results;
}

