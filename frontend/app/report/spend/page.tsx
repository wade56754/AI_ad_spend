'use client';

import { useState } from 'react';
import * as React from 'react';
import { postAdSpend, getProjects, getProjectChannels, getOperators } from '@/lib/api';

export default function SpendReportPage() {
  const [formData, setFormData] = useState({
    spend_date: '',
    project_id: '',
    channel_id: '',
    country: '',
    operator_id: '',
    platform: '',
    amount_usdt: '',
    raw_memo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });

  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [channels, setChannels] = useState<Array<{ id: number; name: string }>>([]);
  const [projectChannels, setProjectChannels] = useState<Array<{ id: number; name: string }>>([]);

  // 加载项目和渠道列表
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // 加载项目列表
        const projectsRes = await getProjects({ status: 'active' });
        if (projectsRes.data) {
          setProjects(projectsRes.data);
        }
      } catch (error) {
        console.error('加载项目列表失败:', error);
      }
    };
    loadData();
  }, []);

  // 当项目改变时，加载该项目关联的渠道和投手
  React.useEffect(() => {
    const loadProjectData = async () => {
      if (formData.project_id) {
        try {
          // 加载项目关联的渠道
          const channelsRes = await getProjectChannels(parseInt(formData.project_id));
          if (channelsRes.data) {
            setProjectChannels(channelsRes.data);
          }
          
          // 加载项目关联的投手
          const operatorsRes = await getOperators({ 
            project_id: parseInt(formData.project_id),
            status: 'active'
          });
          if (operatorsRes.data) {
            // 这里可以设置投手列表，如果需要的话
          }
        } catch (error) {
          console.error('加载项目数据失败:', error);
        }
      } else {
        setProjectChannels([]);
      }
    };
    loadProjectData();
  }, [formData.project_id]);

  // 模拟国家列表
  const countries = [
    '美国', '英国', '加拿大', '澳大利亚', '德国', '法国', '日本', '韩国', '新加坡', '其他'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.spend_date) {
      newErrors.spend_date = '请选择日期';
    }

    if (!formData.project_id) {
      newErrors.project_id = '请选择项目';
    }

    if (!formData.channel_id) {
      newErrors.channel_id = '请选择渠道（必填）';
    }

    if (!formData.operator_id) {
      newErrors.operator_id = '请选择投手';
    }

    if (!formData.amount_usdt || parseFloat(formData.amount_usdt) <= 0) {
      newErrors.amount_usdt = '请输入有效的金额（大于0）';
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
      const response = await postAdSpend({
        spend_date: formData.spend_date,
        project_id: parseInt(formData.project_id),
        channel_id: parseInt(formData.channel_id),
        country: formData.country || undefined,
        operator_id: parseInt(formData.operator_id),
        platform: formData.platform || undefined,
        amount_usdt: parseFloat(formData.amount_usdt),
        raw_memo: formData.raw_memo || undefined,
      });

      if (response.error) {
        setSubmitStatus({
          type: 'error',
          message: response.error || '提交失败，请重试',
        });
      } else {
        // 检查是否有警告
        const warningMessage = (response as any).warning;
        setSubmitStatus({
          type: warningMessage ? 'warning' : 'success',
          message: warningMessage || '消耗上报提交成功！',
        });
        // 重置表单
        setFormData({
          spend_date: '',
          project_id: '',
          channel_id: '',
          country: '',
          operator_id: '',
          platform: '',
          amount_usdt: '',
          raw_memo: '',
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">投手消耗上报</h1>

          {submitStatus.type && (
            <div
              className={`mb-6 p-4 rounded-md ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : submitStatus.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 日期 */}
            <div>
              <label htmlFor="spend_date" className="block text-sm font-medium text-gray-700 mb-1">
                消耗日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="spend_date"
                name="spend_date"
                value={formData.spend_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.spend_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.spend_date && (
                <p className="mt-1 text-sm text-red-600">{errors.spend_date}</p>
              )}
            </div>

            {/* 项目 */}
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                项目 <span className="text-red-500">*</span>
              </label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.project_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择项目</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>
              )}
            </div>

            {/* 渠道 */}
            <div>
              <label htmlFor="channel_id" className="block text-sm font-medium text-gray-700 mb-1">
                渠道 <span className="text-red-500">*</span>
              </label>
              <select
                id="channel_id"
                name="channel_id"
                value={formData.channel_id}
                onChange={handleChange}
                disabled={!formData.project_id}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.channel_id ? 'border-red-500' : 'border-gray-300'
                } ${!formData.project_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">请选择渠道</option>
                {projectChannels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              {errors.channel_id && (
                <p className="mt-1 text-sm text-red-600">{errors.channel_id}</p>
              )}
              {!formData.project_id && (
                <p className="mt-1 text-sm text-gray-500">请先选择项目</p>
              )}
            </div>

            {/* 国家 */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                国家/地区
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择国家</option>
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* 投手ID */}
            <div>
              <label htmlFor="operator_id" className="block text-sm font-medium text-gray-700 mb-1">
                投手ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="operator_id"
                name="operator_id"
                value={formData.operator_id}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.operator_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入投手ID"
              />
              {errors.operator_id && (
                <p className="mt-1 text-sm text-red-600">{errors.operator_id}</p>
              )}
            </div>

            {/* 平台 */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                投放平台
              </label>
              <input
                type="text"
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：Facebook、Google Ads等"
              />
            </div>

            {/* 金额 */}
            <div>
              <label htmlFor="amount_usdt" className="block text-sm font-medium text-gray-700 mb-1">
                消耗金额 (USDT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount_usdt"
                name="amount_usdt"
                value={formData.amount_usdt}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount_usdt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount_usdt && (
                <p className="mt-1 text-sm text-red-600">{errors.amount_usdt}</p>
              )}
            </div>

            {/* 备注 */}
            <div>
              <label htmlFor="raw_memo" className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                id="raw_memo"
                name="raw_memo"
                value={formData.raw_memo}
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



