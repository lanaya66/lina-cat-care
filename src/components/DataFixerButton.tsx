/**
 * 数据修复按钮组件
 */

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { fixAllHistoricalData, verifyFixedData } from '@/utils/dataFixer';
import { getCurrentUserId } from '@/lib/supabase';

export default function DataFixerButton() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // 执行修复
  const handleFix = async () => {
    if (!confirm('确定要重新计算所有历史数据吗？\n\n这将使用新的计算逻辑更新所有食物和水的摄入量记录。\n\n此操作不可撤销！')) {
      return;
    }

    setIsFixing(true);
    setResult(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('未登录');
      }

      const fixResult = await fixAllHistoricalData(userId);
      setResult(fixResult);

      if (fixResult.success) {
        // 验证修复结果
        await verifyFixedData(userId);
        
        // 提示刷新页面
        setTimeout(() => {
          if (confirm('修复完成！是否刷新页面查看新数据？')) {
            window.location.reload();
          }
        }, 1000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || '修复失败',
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-20">
      <button
        onClick={handleFix}
        disabled={isFixing}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw 
          size={20} 
          className={isFixing ? 'animate-spin' : ''} 
        />
        <span className="text-sm font-medium">
          {isFixing ? '修复中...' : '修复历史数据'}
        </span>
      </button>

      {/* 结果提示 */}
      {result && (
        <div
          className={`mt-2 p-3 rounded-lg shadow-lg max-w-xs ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

