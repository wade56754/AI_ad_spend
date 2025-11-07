"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { LedgerForm, LedgerFormDraft } from "@/types/ledger";

interface FinanceLedgerFormProps {
  onSuccess?: () => void;
}

const defaultState: LedgerFormDraft = {
  ledger_date: "",
  direction: "income",
  amount_usdt: "",
  currency: "USD",
  account_name: "",
  description: "",
  fee_usdt: "0",
};

export function FinanceLedgerForm({ onSuccess }: FinanceLedgerFormProps): JSX.Element {
  const [form, setForm] = useState<LedgerFormDraft>(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = useCallback((field: keyof LedgerFormDraft, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const payload: LedgerForm = {
        ledger_date: form.ledger_date,
        direction: form.direction,
        amount_usdt: Number(form.amount_usdt),
        currency: form.currency,
        account_name: form.account_name,
        description: form.description || undefined,
        fee_usdt: form.fee_usdt ? Number(form.fee_usdt) : undefined,
      };

      const response = await apiRequest("/ledger", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmitting(false);

      if (response.error) {
        setErrorMessage(response.error);
        return;
      }

      setForm(defaultState);
      setSuccessMessage("录入成功");
      if (onSuccess) onSuccess();
    },
    [form, onSuccess],
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>财务收支录入</CardTitle>
        <CardDescription>录入每笔财务收支，系统会自动参与对账匹配。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="ledger_date">日期</Label>
            <Input
              id="ledger_date"
              type="date"
              value={form.ledger_date}
              onChange={(event) => handleChange("ledger_date", event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="direction">方向</Label>
            <select
              id="direction"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.direction}
              onChange={(event) => handleChange("direction", event.target.value)}
              required
            >
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount_usdt">金额 (USDT)</Label>
            <Input
              id="amount_usdt"
              type="number"
              min="0"
              step="0.01"
              value={form.amount_usdt}
              onChange={(event) => handleChange("amount_usdt", event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency">币种</Label>
            <select
              id="currency"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.currency}
              onChange={(event) => handleChange("currency", event.target.value)}
              required
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="CNY">CNY</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="account_name">账户名称</Label>
            <Input
              id="account_name"
              value={form.account_name}
              onChange={(event) => handleChange("account_name", event.target.value)}
              placeholder="如 银行卡、钱包、渠道"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">备注</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
              placeholder="可填写来源、用途、凭证编号等"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fee_usdt">手续费 (USDT)</Label>
            <Input
              id="fee_usdt"
              type="number"
              min="0"
              step="0.01"
              value={form.fee_usdt}
              onChange={(event) => handleChange("fee_usdt", event.target.value)}
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "提交中..." : "确认录入"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

