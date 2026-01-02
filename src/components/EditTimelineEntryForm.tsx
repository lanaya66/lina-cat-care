/**
 * 编辑时间线记录表单
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { TimelineEntry, MEDICINE_TYPE_NAMES, MedicineType } from '@/types';

interface EditTimelineEntryFormProps {
  entry: TimelineEntry;
  onClose: () => void;
  onSave: (updates: Partial<TimelineEntry>) => void;
}

export default function EditTimelineEntryForm({ entry, onClose, onSave }: EditTimelineEntryFormProps) {
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
      case 'pee': return '编辑尿团记录';
      case 'poop': return '编辑大便记录';
      case 'medicine': return '编辑用药记录';
      case 'breathing_rate': return '编辑呼吸数记录';
      case 'status': return '编辑状态记录';
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
      case 'pee':
      case 'poop':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重量 (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={payload.weight ?? ''}
              onChange={(e) => setPayload({ ...payload, weight: parseFloat(e.target.value) })}
              className="input"
              required
            />
          </div>
        );

      case 'medicine':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                药物类型
              </label>
              <select
                value={payload.medicineType}
                onChange={(e) => setPayload({ ...payload, medicineType: e.target.value as MedicineType })}
                className="input"
              >
                {(Object.keys(MEDICINE_TYPE_NAMES) as MedicineType[]).map((type) => (
                  <option key={type} value={type}>
                    {MEDICINE_TYPE_NAMES[type]}
                  </option>
                ))}
              </select>
            </div>

            {payload.medicineType === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  药物名称
                </label>
                <input
                  type="text"
                  value={payload.medicineName || ''}
                  onChange={(e) => setPayload({ ...payload, medicineName: e.target.value })}
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用量 (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={payload.dosage ?? ''}
                onChange={(e) => setPayload({ ...payload, dosage: parseFloat(e.target.value) })}
                className="input"
                required
              />
            </div>
          </>
        );

      case 'breathing_rate':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              呼吸数 (次/分钟) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={payload.rate ?? ''}
              onChange={(e) => setPayload({ ...payload, rate: parseFloat(e.target.value) })}
              className="input"
              required
            />
          </div>
        );

      case 'status':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={payload.note || ''}
              onChange={(e) => setPayload({ ...payload, note: e.target.value })}
              className="input min-h-[100px] resize-none"
              required
            />
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            此类型记录暂不支持编辑
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

