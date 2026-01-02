/**
 * 今日统计页面
 */

import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { calculateDailyStats } from '@/utils/statsCalculations';
import { formatTimestamp } from '@/utils/dateHelpers';
import { useNavigate } from 'react-router-dom';
import DataFixerButton from '@/components/DataFixerButton';

export default function DailyStatsPage() {
  const navigate = useNavigate();
  const { entries, fetchEntries } = useTimelineStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 加载时间线数据
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // 计算当前选中日期的统计
  const stats = useMemo(() => {
    return calculateDailyStats(entries, selectedDate);
  }, [entries, selectedDate]);

  // 切换到前一天
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // 切换到后一天
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // 跳转到时间线
  const handleViewTimeline = () => {
    navigate('/timeline');
  };

  // 格式化日期用于输入框
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="page-header">
        <h1 className="text-xl font-bold">今日统计</h1>
      </div>

      {/* 内容 */}
      <div className="page-content">
        {/* 日期选择器 */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Calendar size={20} />
              <span className="font-semibold text-lg">
                {formatTimestamp(selectedDate.getTime(), 'yyyy年MM月dd日')}
              </span>
            </button>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 日期输入框（展开时显示） */}
          {showDatePicker && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e) => {
                  setSelectedDate(new Date(e.target.value));
                  setShowDatePicker(false);
                }}
                className="input"
              />
            </div>
          )}
        </div>

        {/* 统计卡片 */}
        <div className="space-y-3 mb-4">
          {/* 干物质食物摄入 */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600">干物质食物</span>
                <p className="text-xs text-gray-400 mt-0.5">不含水分的营养部分</p>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stats.foodIntake.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">g</span>
              </span>
            </div>
          </div>

          {/* 水摄入 */}
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">水摄入</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.waterIntake.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">g</span>
              </span>
            </div>
          </div>

          {/* 尿团 */}
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">尿团</span>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.peeTotal.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">g</span>
              </span>
            </div>
          </div>

          {/* 大便 */}
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">大便</span>
              <span className="text-2xl font-bold text-amber-600">
                {stats.poopTotal.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">g</span>
              </span>
            </div>
          </div>

          {/* 用药 */}
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">用药</span>
              <span className="text-2xl font-bold text-red-600">
                {stats.medicineTotal.toFixed(2)}
                <span className="text-sm text-gray-500 ml-1">g</span>
              </span>
            </div>
          </div>
        </div>

        {/* 安静呼吸数 */}
        {stats.breathingRates.length > 0 && (
          <div className="card mt-3">
            <h3 className="font-semibold text-gray-800 mb-2">安静呼吸数</h3>
            <div className="flex items-baseline gap-3">
              {stats.breathingRates.map((rate, index) => {
                const isAbnormal = rate > 40 || rate < 15;
                return (
                  <div key={index} className="text-center">
                    <span className={`text-2xl font-bold ${isAbnormal ? 'text-red-600' : 'text-indigo-600'}`}>
                      {rate}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">次/分</span>
                  </div>
                );
              })}
            </div>
            {stats.breathingRates.some(r => r > 40 || r < 15) && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ 有异常呼吸数，建议关注
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              正常范围：20-30 次/分钟
            </p>
          </div>
        )}

        {/* 状态记录 */}
        {stats.statusNotes.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-2">状态记录</h3>
            <div className="space-y-2">
              {stats.statusNotes.map((note, index) => (
                <p key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 查看时间线按钮 */}
        <button
          onClick={handleViewTimeline}
          className="btn btn-outline w-full py-3 mt-4"
        >
          查看时间线
        </button>
      </div>

      {/* 数据修复按钮 */}
      <DataFixerButton />
    </div>
  );
}

