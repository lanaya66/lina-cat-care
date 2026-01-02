/**
 * 食物卡片组件
 */

import { FoodCard, FOOD_TYPE_NAMES } from '@/types';
import { formatTimestamp } from '@/utils/dateHelpers';
import { Clock, Droplet } from 'lucide-react';

interface FoodCardItemProps {
  card: FoodCard;
  onClick: () => void;
}

export default function FoodCardItem({ card, onClick }: FoodCardItemProps) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-md transition-shadow active:scale-98"
    >
      {/* 食物类型标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
          {FOOD_TYPE_NAMES[card.food_type]}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={14} className="mr-1" />
          {formatTimestamp(card.start_time, 'HH:mm')}
        </div>
      </div>

      {/* 食物名称 */}
      {card.food_name && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {card.food_name}
        </h3>
      )}

      {/* 剩余量和水分比例 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">剩余量</p>
          <p className="text-2xl font-bold text-gray-800">
            {card.current_remaining.toFixed(1)}
            <span className="text-sm text-gray-500 ml-1">g</span>
          </p>
        </div>
        
        <div className="flex items-center text-blue-500">
          <Droplet size={16} className="mr-1" />
          <span className="text-sm font-medium">
            {(card.current_water_ratio * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 点击提示 */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
        点击管理此食物
      </div>
    </div>
  );
}

