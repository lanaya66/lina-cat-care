/**
 * 日期处理工具函数
 */

import { format, startOfDay, endOfDay, subDays, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化时间戳为日期字符串
 * @param timestamp Unix 时间戳（毫秒）
 * @param formatStr 格式字符串
 */
export function formatTimestamp(timestamp: number, formatStr: string = 'yyyy-MM-dd HH:mm'): string {
  return format(timestamp, formatStr, { locale: zhCN });
}

/**
 * 获取日期的开始时间戳（00:00:00）
 */
export function getStartOfDay(date: Date | number): number {
  return startOfDay(date).getTime();
}

/**
 * 获取日期的结束时间戳（23:59:59.999）
 */
export function getEndOfDay(date: Date | number): number {
  return endOfDay(date).getTime();
}

/**
 * 获取相对日期描述（今天、昨天、具体日期）
 */
export function getRelativeDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return '今天';
  }
  
  if (isYesterday(date)) {
    return '昨天';
  }
  
  return format(date, 'MM月dd日', { locale: zhCN });
}

/**
 * 获取指定天数前的日期时间戳
 */
export function getDaysAgo(days: number): number {
  return subDays(new Date(), days).getTime();
}

/**
 * 将时间戳转换为 YYYY-MM-DD 格式
 */
export function timestampToDateString(timestamp: number): string {
  return format(timestamp, 'yyyy-MM-dd');
}

/**
 * 将 YYYY-MM-DD 转换为当天开始的时间戳
 */
export function dateStringToTimestamp(dateStr: string): number {
  return new Date(dateStr).getTime();
}

