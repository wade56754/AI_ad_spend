"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { LedgerForm, LedgerFormDraft } from "@/types/ledger";

const DIRECTIONS: Array<{ value: LedgerFormDraft["direction"]; label: string }> = [
  { value: "income", label: "收入" },
  { value: "expense", label: "支出" },
];

const CURRENCIES: LedgerFormDraft["currency"][] = ["USD", "INR", "CNY"];

const INITIAL_FORM_STATE: LedgerFormDraft = {
  ledger_date: "",
  direction: "income",
  amount_usdt: "",
  currency: "USD",
  account_name: "",
  description: "",
  fee_usdt: "0",
};

export default function FinanceLedgerPage(): JSX.Element {
  const [formData, setFormData] = useState<LedgerFormDraft>(INITIAL_FORM_STATE);
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

    const payload: LedgerForm = {
      ledger_date: formData.ledger_date,
      direction: formData.direction,
      amount_usdt: Number(formData.amount_usdt),
      currency: formData.currency,
      account_name: formData.account_name || undefined,
      description: formData.description || undefined,
      fee_usdt: formData.fee_usdt ? Number(formData.fee_usdt) : undefined,
    };

    const response = await apiRequest("/ledger", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.error) {
      setError(response.error);
    } else {
      setMessage("录入成功");
      setFormData(INITIAL_FORM_STATE);
    }

    setLoading(false);
  };

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">财务收支录入</h1>
        <p className="mt-2 text-sm text-muted-foreground">录入收支流水数据，为对账提供依据。</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>新增流水</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="ledger_date" className="text-sm font-medium text-gray-700">
                  交易日期
                </label>
                <Input
                  id="ledger_date"
                  name="ledger_date"
                  type="date"
                  value={formData.ledger_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="direction" className="text-sm font-medium text-gray-700">
                  收支类型
                </label>
                <select
                  id="direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DIRECTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="amount_usdt" className="text-sm font-medium text-gray-700">
                  金额 (USDT)
                </label>
                <Input
                  id="amount_usdt"
                  name="amount_usdt"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount_usdt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                  记账币种
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="account_name" className="text-sm font-medium text-gray-700">
                  收支账户
                </label>
                <Input
                  id="account_name"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleChange}
                  placeholder="例如：招商银行-广告账户"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                备注说明
              </label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="可记录收入来源、发票编号、支出用途等"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="fee_usdt" className="text-sm font-medium text-gray-700">
                手续费 (USDT)
              </label>
              <Input
                id="fee_usdt"
                name="fee_usdt"
                type="number"
                min="0"
                step="0.01"
                value={formData.fee_usdt}
                onChange={handleChange}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "提交中..." : "保存流水"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

