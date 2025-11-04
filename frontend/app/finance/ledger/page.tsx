'use client';

import { useState } from 'react';
import { postLedger } from '@/lib/api';

export default function FinanceLedgerPage() {
  const [formData, setFormData] = useState({
    tx_date: '',
    direction: 'expense' as 'income' | 'expense',
    amount: '',
    currency: 'USDT',
    account: '',
    description: '',
    fee_amount: '0',
    project_id: '',
    operator_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tx_date) {
      newErrors.tx_date = '请选择日期';
    }

    if (!formData.direction) {
      newErrors.direction = '请选择收支类型';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的金额（大于0）';
    }

    if (!formData.currency) {
      newErrors.currency = '请选择币种';
    }

    if (formData.fee_amount && parseFloat(formData.fee_amount) < 0) {
      newErrors.fee_amount = '手续费不能为负数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await postLedger({
        tx_date: formData.tx_date,
        direction: formData.direction,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        account: formData.account || undefined,
        description: formData.description || undefined,
        fee_amount: parseFloat(formData.fee_amount) || 0,
        project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : undefined,
      });

      if (response.error) {
        setSubmitStatus({
          type: 'error',
          message: response.error || '提交失败，请重试',
        });
      } else {
        setSubmitStatus({
          type: 'success',
          message: '财务记录提交成功！',
        });
        // 重置表单
        setFormData({
          tx_date: '',
          direction: 'expense',
          amount: '',
          currency: 'USDT',
          account: '',
          description: '',
          fee_amount: '0',
          project_id: '',
          operator_id: '',
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: '网络错误，请检查连接后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">财务收支录入</h1>

          {submitStatus.type && (
            <div
              className={`mb-6 p-4 rounded-md ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 日期 */}
            <div>
              <label htmlFor="tx_date" className="block text-sm font-medium text-gray-700 mb-1">
                交易日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tx_date"
                name="tx_date"
                value={formData.tx_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tx_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tx_date && (
                <p className="mt-1 text-sm text-red-600">{errors.tx_date}</p>
              )}
            </div>

            {/* 收支类型 */}
            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">
                收支类型 <span className="text-red-500">*</span>
              </label>
              <select
                id="direction"
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.direction ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
              {errors.direction && (
                <p className="mt-1 text-sm text-red-600">{errors.direction}</p>
              )}
            </div>

            {/* 金额 */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                金额 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* 币种 */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                币种 <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currency ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="USDT">USDT</option>
                <option value="CNY">CNY</option>
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
              )}
            </div>

            {/* 账户 */}
            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                账户
              </label>
              <input
                type="text"
                id="account"
                name="account"
                value={formData.account}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入账户名称（可选）"
              />
            </div>

            {/* 手续费 */}
            <div>
              <label htmlFor="fee_amount" className="block text-sm font-medium text-gray-700 mb-1">
                手续费
              </label>
              <input
                type="number"
                id="fee_amount"
                name="fee_amount"
                value={formData.fee_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fee_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.fee_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.fee_amount}</p>
              )}
            </div>

            {/* 项目ID */}
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                项目ID
              </label>
              <input
                type="number"
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入项目ID（可选）"
              />
            </div>

            {/* 投手ID */}
            <div>
              <label htmlFor="operator_id" className="block text-sm font-medium text-gray-700 mb-1">
                投手ID
              </label>
              <input
                type="number"
                id="operator_id"
                name="operator_id"
                value={formData.operator_id}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入投手ID（可选）"
              />
            </div>

            {/* 备注 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入备注信息（可选）"
              />
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } transition-colors`}
              >
                {isSubmitting ? '提交中...' : '提交'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

