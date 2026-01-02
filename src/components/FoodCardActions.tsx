/**
 * 食物卡片操作模态框
 */

import { useState } from 'react';
import { X, Edit, Droplet, Plus, CheckCircle } from 'lucide-react';
import { FoodCard, FOOD_TYPE_NAMES } from '@/types';
import { formatTimestamp } from '@/utils/dateHelpers';

interface FoodCardActionsProps {
  card: FoodCard;
  onClose: () => void;
  onEditMealPrep: (data: any) => void;
  onAddWater: (waterAdded: number, timestamp: number) => void;
  onAddFood: (foodAdded: number, timestamp: number) => void;
  onUpdateRemaining: (remaining: number, timestamp: number) => void;
  onSettle: (finalRemaining: number, timestamp: number) => void;
}

type ActionType = 'menu' | 'edit' | 'add_water' | 'add_food' | 'update_remaining' | 'settle';

export default function FoodCardActions({
  card,
  onClose,
  onEditMealPrep,
  onAddWater,
  onAddFood,
  onUpdateRemaining,
  onSettle,
}: FoodCardActionsProps) {
  const [currentAction, setCurrentAction] = useState<ActionType>('menu');
  const [value, setValue] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());

  // 重置表单
  const resetForm = () => {
    setValue('');
    setTimestamp(Date.now());
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

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      alert('请输入有效的数值');
      return;
    }

    switch (currentAction) {
      case 'add_water':
        onAddWater(numValue, timestamp);
        break;
      case 'add_food':
        onAddFood(numValue, timestamp);
        break;
      case 'update_remaining':
        onUpdateRemaining(numValue, timestamp);
        break;
      case 'settle':
        onSettle(numValue, timestamp);
        break;
    }

    onClose();
  };

  // 渲染主菜单
  if (currentAction === 'menu') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className="bg-white rounded-t-3xl w-full max-w-2xl animate-slide-up">
          {/* 头部 */}
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">管理食物</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* 卡片信息 */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  {FOOD_TYPE_NAMES[card.food_type]}
                </span>
                {card.food_name && (
                  <span className="ml-2 text-sm font-medium">{card.food_name}</span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatTimestamp(card.start_time, 'MM-dd HH:mm')}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              剩余：<span className="font-semibold">{card.current_remaining.toFixed(1)}g</span>
              <span className="mx-2">|</span>
              水分：<span className="font-semibold">{(card.current_water_ratio * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-4 space-y-2">
            <button
              onClick={() => setCurrentAction('edit')}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Edit size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">编辑备餐数据</p>
                <p className="text-xs text-gray-500">修改初始重量和加水量</p>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentAction('add_water');
                resetForm();
              }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                <Droplet size={20} className="text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">加水</p>
                <p className="text-xs text-gray-500">记录增加的水量</p>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentAction('add_food');
                resetForm();
              }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Plus size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">加食物</p>
                <p className="text-xs text-gray-500">添加同类食物</p>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentAction('update_remaining');
                resetForm();
              }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Edit size={20} className="text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">记录吃剩的</p>
                <p className="text-xs text-gray-500">更新当前剩余量</p>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentAction('settle');
                resetForm();
              }}
              className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <CheckCircle size={20} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">结算</p>
                <p className="text-xs text-gray-500">记录最终剩余量并结束</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 渲染输入表单
  const getTitle = () => {
    switch (currentAction) {
      case 'add_water': return '加水';
      case 'add_food': return '加食物';
      case 'update_remaining': return '记录吃剩的';
      case 'settle': return '结算';
      default: return '';
    }
  };

  const getPlaceholder = () => {
    switch (currentAction) {
      case 'add_water': return '增加的水量 (g)';
      case 'add_food': return '增加的食物量 (g)';
      case 'update_remaining': return '当前剩余量 (g)';
      case 'settle': return '最终剩余量 (g)';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl animate-slide-up">
        {/* 头部 */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentAction('menu')}
            className="text-primary-600 font-medium"
          >
            返回
          </button>
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getPlaceholder()} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input text-lg"
              placeholder="0"
              autoFocus
              required
            />
          </div>

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

          <button type="submit" className="btn btn-primary w-full py-3">
            保存
          </button>
        </form>
      </div>
    </div>
  );
}

