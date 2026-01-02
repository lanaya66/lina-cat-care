/**
 * 时间线页面
 */

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { AddRecordFormData, TimelineEntry } from '@/types';
import { getRelativeDateLabel, timestampToDateString } from '@/utils/dateHelpers';
import TimelineItem from '@/components/TimelineItem';
import AddRecordForm from '@/components/AddRecordForm';
import EditTimelineEntryForm from '@/components/EditTimelineEntryForm';
import EditFoodRelatedEntry from '@/components/EditFoodRelatedEntry';
import { supabase } from '@/lib/supabase';

export default function TimelinePage() {
  const { entries, loading, fetchEntries, addEntry, updateEntry } = useTimelineStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [editingFoodEntry, setEditingFoodEntry] = useState<{ entry: TimelineEntry; foodName: string } | null>(null);

  // 加载时间线
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // 处理添加记录
  const handleAddRecord = async (data: AddRecordFormData) => {
    let payload: any;

    switch (data.type) {
      case 'pee':
        payload = { weight: parseFloat(data.weight!) };
        break;
      case 'poop':
        payload = { weight: parseFloat(data.weight!) };
        break;
      case 'medicine':
        payload = {
          medicineType: data.medicineType!,
          medicineName: data.medicineName,
          dosage: parseFloat(data.dosage!),
        };
        break;
      case 'status':
        payload = { note: data.note! };
        break;
      case 'breathing_rate':
        payload = { rate: parseFloat(data.breathingRate!) };
        break;
    }

    await addEntry({
      timestamp: data.timestamp,
      type: data.type,
      payload,
    });

    setShowAddForm(false);
  };

  // 处理编辑记录
  const handleEditEntry = async (entry: TimelineEntry) => {
    // 如果是独立记录，使用普通编辑表单
    if (!entry.related_entity_id) {
      setEditingEntry(entry);
      return;
    }

    // 如果是食物相关记录，获取食物信息后使用食物编辑表单
    const { data: foodCard } = await supabase
      .from('food_cards')
      .select('food_name, food_type')
      .eq('id', entry.related_entity_id)
      .single();

    if (foodCard) {
      const foodName = foodCard.food_name || '未命名食物';
      setEditingFoodEntry({ entry, foodName });
    } else {
      alert('无法找到关联的食物信息');
    }
  };

  // 保存编辑（独立记录）
  const handleSaveEdit = async (updates: Partial<TimelineEntry>) => {
    if (!editingEntry) return;

    await updateEntry(editingEntry.id, updates);
    setEditingEntry(null);
  };

  // 保存编辑（食物相关记录）
  const handleSaveFoodEdit = async (updates: Partial<TimelineEntry>) => {
    if (!editingFoodEntry) return;

    await updateEntry(editingFoodEntry.entry.id, updates);
    setEditingFoodEntry(null);

    // 提示用户可能需要修复数据
    setTimeout(() => {
      if (confirm('记录已更新！\n\n如果修改了剩余量，建议使用"修复历史数据"功能重新计算所有摄入量。\n\n是否前往今日统计页面？')) {
        window.location.href = '/daily-stats';
      }
    }, 500);
  };

  // 按日期分组时间线记录
  const groupedEntries: Record<string, typeof entries> = {};
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const dateKey = timestampToDateString(entry.timestamp);
    
    if (!groupedEntries[dateKey]) {
      groupedEntries[dateKey] = [];
    }
    groupedEntries[dateKey].push(entry);
  }

  const dateKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="page-header">
        <h1 className="text-xl font-bold">时间线</h1>
      </div>

      {/* 内容 */}
      <div className="page-content">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">加载中...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg mb-2">还没有记录</p>
            <p className="text-sm">点击右下角按钮添加记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* 日期标题 */}
                <div className="sticky top-0 bg-gray-50 py-2 mb-3 z-10">
                  <h2 className="text-sm font-semibold text-gray-600">
                    {getRelativeDateLabel(groupedEntries[dateKey][0].timestamp)}
                    <span className="ml-2 text-xs text-gray-400">{dateKey}</span>
                  </h2>
                </div>

                {/* 该日期的记录 */}
                <div className="space-y-2">
                  {groupedEntries[dateKey].map((entry) => (
                    <TimelineItem 
                      key={entry.id} 
                      entry={entry}
                      onEdit={() => handleEditEntry(entry)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all z-10"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* 添加记录表单 */}
      {showAddForm && (
        <AddRecordForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddRecord}
        />
      )}

      {/* 编辑记录表单（独立记录） */}
      {editingEntry && (
        <EditTimelineEntryForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* 编辑记录表单（食物相关记录） */}
      {editingFoodEntry && (
        <EditFoodRelatedEntry
          entry={editingFoodEntry.entry}
          foodName={editingFoodEntry.foodName}
          onClose={() => setEditingFoodEntry(null)}
          onSave={handleSaveFoodEdit}
        />
      )}
    </div>
  );
}

