'use client';

import { useState, useEffect } from 'react';
import { getReconciliations, updateReconciliation } from '@/lib/api';

interface ReconciliationItem {
  id: number;
  ad_spend_id: number;
  ledger_id: number;
  amount_diff: number;
  date_diff: number;
  match_score: number | null;
  status: string;
  reason: string | null;
  created_at: string;
  ad_spend: {
    id: number;
    operator_name: string | null;
    project_name: string | null;
    spend_date: string | null;
    amount_usdt: number | null;
  } | null;
  ledger_transaction: {
    id: number;
    tx_date: string | null;
    amount: number | null;
    currency: string | null;
  } | null;
}

export default function ReconcilePage() {
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const fetchReconciliations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReconciliations({
        limit: 1000,
        status: statusFilter || undefined,
      });

      if (response.error) {
        setError(response.error);
      } else {
        setReconciliations(response.data || []);
      }
    } catch (err) {
      setError('获取对账结果失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, [statusFilter]);

  const handleConfirmMatch = async (id: number) => {
    setUpdatingIds(prev => new Set(prev).add(id));

    try {
      const response = await updateReconciliation(id, 'matched');

      if (response.error) {
        alert(`确认失败: ${response.error}`);
      } else {
        // 刷新列表
        await fetchReconciliations();
      }
    } catch (err) {
      alert('确认匹配失败，请重试');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'need_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'matched':
        return '已匹配';
      case 'need_review':
        return '待审核';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">对账结果</h1>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="matched">已匹配</option>
                <option value="need_review">待审核</option>
              </select>
              <button
                onClick={fetchReconciliations}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                刷新
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : reconciliations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无对账结果
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      投手日报
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      财务记录
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      匹配度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      原因
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reconciliations.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            投手: {item.ad_spend?.operator_name || 'N/A'}
                          </div>
                          <div className="text-gray-500">
                            项目: {item.ad_spend?.project_name || 'N/A'}
                          </div>
                          <div className="text-gray-500">
                            日期: {item.ad_spend?.spend_date || 'N/A'}
                          </div>
                          <div className="text-gray-900 font-medium">
                            金额: {item.ad_spend?.amount_usdt?.toFixed(2) || '0.00'} USDT
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {item.ad_spend_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-500">
                            日期: {item.ledger_transaction?.tx_date || 'N/A'}
                          </div>
                          <div className="text-gray-900 font-medium">
                            金额: {item.ledger_transaction?.amount?.toFixed(2) || '0.00'} {item.ledger_transaction?.currency || 'USDT'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {item.ledger_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {item.match_score !== null ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {item.match_score.toFixed(2)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                金额差: {Math.abs(item.amount_diff).toFixed(2)} USDT
                              </div>
                              <div className="text-xs text-gray-500">
                                日期差: {Math.abs(item.date_diff)} 天
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(item.status)}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate" title={item.reason || ''}>
                          {item.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.status === 'need_review' && (
                          <button
                            onClick={() => handleConfirmMatch(item.id)}
                            disabled={updatingIds.has(item.id)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              updatingIds.has(item.id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            } transition-colors`}
                          >
                            {updatingIds.has(item.id) ? '处理中...' : '确认匹配'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

