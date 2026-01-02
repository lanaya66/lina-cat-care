/**
 * 时间线条目组件
 */

import { TimelineEntry, FoodType, MedicineType, FOOD_TYPE_NAMES, MEDICINE_TYPE_NAMES } from '@/types';
import { formatTimestamp } from '@/utils/dateHelpers';
import { 
  UtensilsCrossed, 
  Droplet, 
  Plus, 
  Edit, 
  CheckCircle,
  Circle,
  Pill,
  FileText,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TimelineItemProps {
  entry: TimelineEntry;
  onEdit?: () => void;
}

export default function TimelineItem({ entry, onEdit }: TimelineItemProps) {
  const [foodName, setFoodName] = useState<string>('');

  // 获取关联的食物名称
  useEffect(() => {
    if (entry.related_entity_id) {
      supabase
        .from('food_cards')
        .select('food_name, food_type')
        .eq('id', entry.related_entity_id)
        .single()
        .then(({ data }) => {
          if (data) {
            const name = data.food_name || FOOD_TYPE_NAMES[data.food_type as keyof typeof FOOD_TYPE_NAMES];
            setFoodName(name);
          }
        });
    }
  }, [entry.related_entity_id]);

  // 获取图标和颜色
  const getIconAndColor = () => {
    switch (entry.type) {
      case 'meal_prep':
        return { icon: UtensilsCrossed, color: 'bg-green-100 text-green-600' };
      case 'add_water':
        return { icon: Droplet, color: 'bg-cyan-100 text-cyan-600' };
      case 'add_food':
        return { icon: Plus, color: 'bg-green-100 text-green-600' };
      case 'update_remaining':
        return { icon: Edit, color: 'bg-orange-100 text-orange-600' };
      case 'settle':
        return { icon: CheckCircle, color: 'bg-purple-100 text-purple-600' };
      case 'pee':
        return { icon: Circle, color: 'bg-yellow-100 text-yellow-600' };
      case 'poop':
        return { icon: Circle, color: 'bg-amber-100 text-amber-600' };
      case 'medicine':
        return { icon: Pill, color: 'bg-red-100 text-red-600' };
      case 'breathing_rate':
        return { icon: Activity, color: 'bg-indigo-100 text-indigo-600' };
      case 'status':
        return { icon: FileText, color: 'bg-blue-100 text-blue-600' };
      default:
        return { icon: FileText, color: 'bg-gray-100 text-gray-600' };
    }
  };

  // 获取标题
  const getTitle = () => {
    switch (entry.type) {
      case 'meal_prep':
        const mealPrep = entry.payload as { foodType: FoodType; foodName?: string };
        return `备餐 - ${FOOD_TYPE_NAMES[mealPrep.foodType]}${mealPrep.foodName ? ` (${mealPrep.foodName})` : ''}`;
      case 'add_water':
        return '加水';
      case 'add_food':
        return '加食物';
      case 'update_remaining':
        return '记录吃剩的';
      case 'settle':
        return '结算';
      case 'pee':
        return '尿团';
      case 'poop':
        return '大便';
      case 'medicine':
        const medicine = entry.payload as { medicineType: MedicineType; medicineName?: string };
        return `用药 - ${MEDICINE_TYPE_NAMES[medicine.medicineType]}${medicine.medicineName ? ` (${medicine.medicineName})` : ''}`;
      case 'breathing_rate':
        return '安静呼吸数';
      case 'status':
        return '状态记录';
      default:
        return '未知记录';
    }
  };

  // 获取详细信息
  const getDetails = () => {
    const payload = entry.payload as any;
    
    switch (entry.type) {
      case 'meal_prep':
        return (
          <div className="text-sm text-gray-600">
            <p>重量: {payload.initialWeight}g</p>
            {payload.initialWaterAdded > 0 && <p>加水: {payload.initialWaterAdded}g</p>}
          </div>
        );
      
      case 'add_water':
        return (
          <div className="text-sm text-gray-600">
            <p>加水量: {payload.waterAdded}g</p>
          </div>
        );
      
      case 'add_food':
        return (
          <div className="text-sm text-gray-600">
            <p>加食物量: {payload.foodAdded}g</p>
          </div>
        );
      
      case 'update_remaining':
      case 'settle':
        return (
          <div className="text-sm text-gray-600">
            {/* 食物名称 */}
            {foodName && (
              <p className="font-medium text-gray-700 mb-1">
                🍽️ {foodName}
              </p>
            )}
            
            {/* 消耗总量 */}
            <p className="mb-1">消耗总量: {payload.consumedAmount?.toFixed(1)}g</p>
            
            {/* 详细分解 */}
            <div className="mt-2 p-2 bg-gray-50 rounded space-y-1">
              <p className="text-xs font-medium text-gray-700">摄入详情：</p>
              
              {/* 干物质食物摄入（不包含水分） */}
              <p className="text-xs">
                <span className="text-orange-600">▪ 干物质食物</span>: {
                  payload.pureFoodConsumed !== undefined 
                    ? payload.pureFoodConsumed?.toFixed(1)
                    : (payload.foodConsumed * (1 - (payload.waterRatio || 0)))?.toFixed(1)
                }g
                {payload.pureFoodConsumed !== undefined && (
                  <span className="text-gray-500 ml-1">
                    (不含水分的营养部分)
                  </span>
                )}
              </p>
              
              {/* 水摄入 */}
              <p className="text-xs">
                <span className="text-blue-600">▪ 水摄入</span>: {payload.waterConsumed?.toFixed(1)}g
                {payload.addedWaterConsumed !== undefined && payload.foodWaterConsumed !== undefined && (
                  <span className="text-gray-500 ml-1">
                    (食物中 {payload.foodWaterConsumed?.toFixed(1)}g + 额外加水 {payload.addedWaterConsumed?.toFixed(1)}g)
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      
      case 'pee':
      case 'poop':
        return (
          <div className="text-sm text-gray-600">
            <p>重量: {payload.weight}g</p>
          </div>
        );
      
      case 'medicine':
        return (
          <div className="text-sm text-gray-600">
            <p>用量: {payload.dosage}g</p>
          </div>
        );
      
      case 'breathing_rate':
        return (
          <div className="text-sm text-gray-600">
            <p>{payload.rate} 次/分钟</p>
            {payload.rate > 40 && (
              <p className="text-xs text-red-600 mt-1">⚠️ 偏快，注意观察</p>
            )}
            {payload.rate < 15 && (
              <p className="text-xs text-red-600 mt-1">⚠️ 偏慢，注意观察</p>
            )}
          </div>
        );
      
      case 'status':
        return (
          <div className="text-sm text-gray-700">
            <p>{payload.note}</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const { icon: Icon, color } = getIconAndColor();

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
      {/* 图标 */}
      <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
        <Icon size={20} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-medium text-gray-800">{getTitle()}</h3>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {formatTimestamp(entry.timestamp, 'HH:mm')}
          </span>
        </div>
        {getDetails()}
      </div>

      {/* 编辑按钮（所有记录都可以编辑） */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title={entry.related_entity_id ? '编辑食物记录' : '编辑记录'}
        >
          <Edit size={16} />
        </button>
      )}
    </div>
  );
}

