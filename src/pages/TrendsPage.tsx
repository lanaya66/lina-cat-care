/**
 * 趋势对比页面
 */

import { useEffect, useState, useMemo } from 'react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { calculateMultipleDaysStats } from '@/utils/statsCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type PeriodType = 7 | 30;

export default function TrendsPage() {
  const { entries, fetchEntries } = useTimelineStore();
  const [period, setPeriod] = useState<PeriodType>(7);

  // 加载时间线数据
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // 生成日期数组（倒序，从今天往前推）
  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push(date);
    }
    
    return result;
  }, [period]);

  // 计算统计数据
  const stats = useMemo(() => {
    return calculateMultipleDaysStats(entries, dates);
  }, [entries, dates]);

  // 格式化图表数据
  const chartData = useMemo(() => {
    return stats.map((stat) => {
      // 计算呼吸数平均值
      const avgBreathingRate = stat.breathingRates.length > 0
        ? stat.breathingRates.reduce((a, b) => a + b, 0) / stat.breathingRates.length
        : 0;
      
      return {
        date: stat.date.slice(5), // 只显示 MM-DD
        干物质: parseFloat(stat.foodIntake.toFixed(1)),
        水: parseFloat(stat.waterIntake.toFixed(1)),
        尿团: parseFloat(stat.peeTotal.toFixed(1)),
        大便: parseFloat(stat.poopTotal.toFixed(1)),
        用药: parseFloat(stat.medicineTotal.toFixed(2)),
        呼吸数: parseFloat(avgBreathingRate.toFixed(1)),
      };
    });
  }, [stats]);

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}g
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="page-header">
        <h1 className="text-xl font-bold">趋势对比</h1>
      </div>

      {/* 内容 */}
      <div className="page-content">
        {/* 周期选择 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPeriod(7)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              period === 7
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            最近 7 天
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              period === 30
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            最近 30 天
          </button>
        </div>

        {/* 图表区域 */}
        <div className="space-y-6">
          {/* 干物质食物摄入趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">干物质食物摄入 (g)</h3>
            <p className="text-xs text-gray-500 mb-2">不含水分的营养部分</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="干物质" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 水摄入趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">水摄入 (g)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="水" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 尿团趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">尿团 (g)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="尿团" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 大便趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">大便 (g)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="大便" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 用药趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">用药 (g)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="用药" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 安静呼吸数趋势 */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">安静呼吸数 (次/分钟)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : Math.floor(period / 6)}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 50]}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* 正常范围参考线 */}
                <Line 
                  type="monotone" 
                  dataKey={() => 20} 
                  stroke="#d1d5db" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey={() => 30} 
                  stroke="#d1d5db" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="呼吸数" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">
              正常范围：20-30 次/分钟（灰色虚线）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

