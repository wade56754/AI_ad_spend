"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { AdSpendForm, AdSpendFormDraft } from "@/types/ad-spend";

const PLATFORMS = ["Facebook", "Google Ads", "TikTok", "Other"];

const initialFormState: AdSpendFormDraft = {
  spend_date: "",
  project_id: "",
  country: "",
  platform: "",
  amount_usdt: "",
  raw_memo: "",
};

export default function SpendReportPage(): JSX.Element {
  const [formData, setFormData] = useState<AdSpendFormDraft>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    const payload: AdSpendForm = {
      spend_date: formData.spend_date,
      project_id: formData.project_id ? Number(formData.project_id) : null,
      country: formData.country,
      platform: formData.platform,
      amount_usdt: Number(formData.amount_usdt),
      raw_memo: formData.raw_memo || undefined,
    };

    const response = await apiRequest("/ad-spend", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.error) {
      setError(response.error);
    } else {
      setMessage("提交成功");
      setFormData(initialFormState);
    }

    setLoading(false);
  };

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">投手消耗上报</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          填写每日投放消耗数据，系统会自动检测异常并协同财务对账。
        </p>
      </div>

      <section className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="spend_date" className="text-sm font-medium text-gray-700">
                消耗日期
              </label>
              <Input
                id="spend_date"
                name="spend_date"
                type="date"
                value={formData.spend_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="project_id" className="text-sm font-medium text-gray-700">
                项目 ID
              </label>
              <Input
                id="project_id"
                name="project_id"
                type="number"
                min="1"
                value={formData.project_id}
                onChange={handleChange}
                placeholder="请输入项目 ID"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="country" className="text-sm font-medium text-gray-700">
                投放国家/地区
              </label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="例如：美国"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="platform" className="text-sm font-medium text-gray-700">
                投放平台
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">请选择平台</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="amount_usdt" className="text-sm font-medium text-gray-700">
                消耗金额 (USDT)
              </label>
              <Input
                id="amount_usdt"
                name="amount_usdt"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount_usdt}
                onChange={handleChange}
                placeholder="例如：120.50"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="raw_memo" className="text-sm font-medium text-gray-700">
              备注
            </label>
            <Textarea
              id="raw_memo"
              name="raw_memo"
              rows={4}
              value={formData.raw_memo}
              onChange={handleChange}
              placeholder="可补充素材、广告组或异常情况说明"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : "提交上报"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

