/**
 * 添加记录表单（尿团、大便、用药、状态）
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { AddRecordFormData, MedicineType, MEDICINE_TYPE_NAMES } from '@/types';

interface AddRecordFormProps {
  onClose: () => void;
  onSubmit: (data: AddRecordFormData) => Promise<void>;
}

export default function AddRecordForm({ onClose, onSubmit }: AddRecordFormProps) {
  const [type, setType] = useState<'pee' | 'poop' | 'medicine' | 'status' | 'breathing_rate'>('pee');
  const [weight, setWeight] = useState('');
  const [medicineType, setMedicineType] = useState<MedicineType>('diuretic');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [note, setNote] = useState('');
  const [breathingRate, setBreathingRate] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交中状态

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // 防止重复提交

    const data: AddRecordFormData = {
      type,
      timestamp,
    };

    if (type === 'pee' || type === 'poop') {
      if (!weight) {
        alert('请输入重量');
        return;
      }
      data.weight = weight;
    } else if (type === 'medicine') {
      if (!dosage) {
        alert('请输入用量');
        return;
      }
      data.medicineType = medicineType;
      data.medicineName = medicineType === 'other' ? medicineName : undefined;
      data.dosage = dosage;
    } else if (type === 'status') {
      if (!note) {
        alert('请输入状态描述');
        return;
      }
      data.note = note;
    } else if (type === 'breathing_rate') {
      if (!breathingRate) {
        alert('请输入呼吸数');
        return;
      }
      data.breathingRate = breathingRate;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">添加记录</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 类型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('pee')}
                className={`py-2 px-3 rounded-lg border-2 transition-all ${
                  type === 'pee'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                尿团
              </button>
              <button
                type="button"
                onClick={() => setType('poop')}
                className={`py-2 px-3 rounded-lg border-2 transition-all ${
                  type === 'poop'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                大便
              </button>
              <button
                type="button"
                onClick={() => setType('medicine')}
                className={`py-2 px-3 rounded-lg border-2 transition-all ${
                  type === 'medicine'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                用药
              </button>
              <button
                type="button"
                onClick={() => setType('breathing_rate')}
                className={`py-2 px-3 rounded-lg border-2 transition-all ${
                  type === 'breathing_rate'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                呼吸数
              </button>
              <button
                type="button"
                onClick={() => setType('status')}
                className={`py-2 px-3 rounded-lg border-2 transition-all col-span-2 ${
                  type === 'status'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                状态
              </button>
            </div>
          </div>

          {/* 根据类型显示不同的输入 */}
          {(type === 'pee' || type === 'poop') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                重量 (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input"
                placeholder="0"
                required
              />
            </div>
          )}

          {type === 'medicine' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  药物类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(MEDICINE_TYPE_NAMES) as MedicineType[]).map((mt) => (
                    <button
                      key={mt}
                      type="button"
                      onClick={() => setMedicineType(mt)}
                      className={`py-2 px-3 rounded-lg border-2 transition-all ${
                        medicineType === mt
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {MEDICINE_TYPE_NAMES[mt]}
                    </button>
                  ))}
                </div>
              </div>

              {medicineType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    药物名称
                  </label>
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="input"
                    placeholder="请输入药物名称"
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
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="input"
                  placeholder="0"
                  required
                />
              </div>
            </>
          )}

          {type === 'breathing_rate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                安静呼吸数 (次/分钟) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={breathingRate}
                onChange={(e) => setBreathingRate(e.target.value)}
                className="input"
                placeholder="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                正常范围：猫咪安静时 20-30 次/分钟
              </p>
            </div>
          )}

          {type === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="记录猫咪的状态、行为等..."
                required
              />
            </div>
          )}

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

