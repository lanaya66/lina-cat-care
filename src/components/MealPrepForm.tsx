/**
 * 备餐表单组件
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { FoodType, FOOD_TYPE_NAMES, MealPrepFormData } from '@/types';

interface MealPrepFormProps {
  onClose: () => void;
  onSubmit: (data: MealPrepFormData) => Promise<void>;
}

export default function MealPrepForm({ onClose, onSubmit }: MealPrepFormProps) {
  const [foodType, setFoodType] = useState<FoodType>('wet_food');
  const [foodName, setFoodName] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [initialWaterAdded, setInitialWaterAdded] = useState('0');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isFullyConsumed, setIsFullyConsumed] = useState(false); // 是否已经全部吃完
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交中状态

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // 防止重复提交
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        foodType,
        foodName,
        initialWeight,
        initialWaterAdded,
        timestamp,
        isFullyConsumed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 格式化时间用于输入框（5分钟取整）
  const formatDateTimeLocal = (ts: number) => {
    const date = new Date(ts);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    // 将分钟数取整到5的倍数
    const minutes = Math.round(date.getMinutes() / 5) * 5;
    const minutesStr = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutesStr}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-0">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">备餐</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 食物类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              食物类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FOOD_TYPE_NAMES) as FoodType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFoodType(type)}
                  className={`py-2 px-3 rounded-lg border-2 transition-all ${
                    foodType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {FOOD_TYPE_NAMES[type]}
                </button>
              ))}
            </div>
          </div>

          {/* 食物名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              食物名称
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="input"
              placeholder="例如：鸡肉罐头"
            />
          </div>

          {/* 备餐重量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备餐重量 (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={initialWeight}
              onChange={(e) => setInitialWeight(e.target.value)}
              className="input"
              placeholder="0"
              required
            />
          </div>

          {/* 加水量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              加水量 (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={initialWaterAdded}
              onChange={(e) => setInitialWaterAdded(e.target.value)}
              className="input"
              placeholder="0"
            />
          </div>

          {/* 时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              时间
            </label>
            <input
              type="datetime-local"
              step="300"
              value={formatDateTimeLocal(timestamp)}
              onChange={(e) => setTimestamp(new Date(e.target.value).getTime())}
              className="input"
            />
          </div>

          {/* 已经全部吃完 */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="isFullyConsumed"
              checked={isFullyConsumed}
              onChange={(e) => setIsFullyConsumed(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isFullyConsumed" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              已经全部吃完
              <span className="block text-xs text-gray-500 mt-0.5">
                勾选后将直接结算该食物，全部食物和水量计入统计
              </span>
            </label>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

