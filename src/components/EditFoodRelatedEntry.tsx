/**
 * 编辑食物相关记录表单
 * 用于编辑备餐、加水、加食物、记录剩余、结算等记录
 */

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { TimelineEntry } from '@/types';

interface EditFoodRelatedEntryProps {
  entry: TimelineEntry;
  foodName: string;
  onClose: () => void;
  onSave: (updates: Partial<TimelineEntry>) => void;
}

export default function EditFoodRelatedEntry({ 
  entry, 
  foodName,
  onClose, 
  onSave 
}: EditFoodRelatedEntryProps) {
  const [timestamp, setTimestamp] = useState(entry.timestamp);
  const [payload, setPayload] = useState(entry.payload as any);

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

  // 获取标题
  const getTitle = () => {
    switch (entry.type) {
      case 'meal_prep': return '编辑备餐记录';
      case 'add_water': return '编辑加水记录';
      case 'add_food': return '编辑加食物记录';
      case 'update_remaining': return '编辑记录剩余';
      case 'settle': return '编辑结算记录';
      default: return '编辑记录';
    }
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      timestamp,
      payload,
    });
  };

  // 渲染编辑字段
  const renderFields = () => {
    switch (entry.type) {
      case 'meal_prep':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                初始重量 (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={payload.initialWeight ?? ''}
                onChange={(e) => setPayload({ ...payload, initialWeight: parseFloat(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                初始加水量 (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={payload.initialWaterAdded ?? ''}
                onChange={(e) => setPayload({ ...payload, initialWaterAdded: parseFloat(e.target.value) })}
                className="input"
              />
            </div>
          </>
        );

      case 'add_water':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              加水量 (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={payload.waterAdded ?? ''}
              onChange={(e) => setPayload({ ...payload, waterAdded: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
        );

      case 'add_food':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              加食物量 (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={payload.foodAdded ?? ''}
              onChange={(e) => setPayload({ ...payload, foodAdded: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
        );

      case 'update_remaining':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当时剩余量 (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={payload.currentRemaining ?? ''}
              onChange={(e) => setPayload({ ...payload, currentRemaining: parseFloat(e.target.value) })}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              修改此值会影响摄入量的计算
            </p>
          </div>
        );

      case 'settle':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最终剩余量 (g)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={payload.finalRemaining ?? ''}
              onChange={(e) => setPayload({ ...payload, finalRemaining: parseFloat(e.target.value) })}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              修改此值会影响摄入量的计算
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <p className="text-xs text-gray-500 mt-1">食物：{foodName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* 警告提示 */}
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">⚠️ 注意</p>
              <p>修改此记录可能会影响相关的统计数据。</p>
              <p className="mt-1">
                {entry.type === 'update_remaining' || entry.type === 'settle' 
                  ? '修改剩余量会重新计算摄入量，但不会自动更新后续记录。'
                  : '如果这是已结算食物的记录，修改后统计可能不准确。'
                }
              </p>
              <p className="mt-1 font-medium">建议：如需大幅度修改，请使用"修复历史数据"功能。</p>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          {/* 具体字段 */}
          {renderFields()}

          {/* 当前值显示（仅供参考） */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">当前记录的值：</p>
            <div className="text-xs text-gray-600 space-y-1">
              {entry.type === 'meal_prep' && (
                <>
                  <p>• 初始重量: {payload.initialWeight}g</p>
                  <p>• 初始加水: {payload.initialWaterAdded}g</p>
                </>
              )}
              {entry.type === 'add_water' && (
                <p>• 加水量: {payload.waterAdded}g</p>
              )}
              {entry.type === 'add_food' && (
                <p>• 加食物量: {payload.foodAdded}g</p>
              )}
              {entry.type === 'update_remaining' && (
                <>
                  <p>• 剩余量: {payload.currentRemaining}g</p>
                  <p>• 消耗量: {payload.consumedAmount?.toFixed(1)}g</p>
                </>
              )}
              {entry.type === 'settle' && (
                <>
                  <p>• 最终剩余: {payload.finalRemaining}g</p>
                  <p>• 消耗量: {payload.consumedAmount?.toFixed(1)}g</p>
                </>
              )}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 py-3"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary flex-1 py-3">
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

