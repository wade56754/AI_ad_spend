"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import type { AdSpendForm, AdSpendFormDraft } from "@/types/ad-spend";
import type { Project } from "@/types/projects";

interface SpendReportFormProps {
  projects?: Project[];
  platforms?: string[];
  onSuccess?: () => void;
}

const defaultState: AdSpendFormDraft = {
  spend_date: "",
  project_id: "",
  country: "",
  platform: "",
  amount_usdt: "",
  raw_memo: "",
};

export function SpendReportForm({ projects, platforms, onSuccess }: SpendReportFormProps): JSX.Element {
  const [form, setForm] = useState<AdSpendFormDraft>(defaultState);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const projectOptions = useMemo(() => projects ?? [], [projects]);
  const platformOptions = useMemo(() => platforms ?? ["Facebook", "Google", "TikTok"], [platforms]);

  const handleChange = useCallback((field: keyof AdSpendFormDraft, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const payload: AdSpendForm = {
        spend_date: form.spend_date,
        project_id: form.project_id ? Number(form.project_id) : null,
        country: form.country,
        platform: form.platform,
        amount_usdt: Number(form.amount_usdt),
        raw_memo: form.raw_memo || undefined,
      };

      const response = await apiRequest("/ad-spend", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (response.error) {
        setErrorMessage(response.error);
        return;
      }

      setForm(defaultState);
      setSuccessMessage("提交成功");
      if (onSuccess) {
        onSuccess();
      }
    },
    [form, onSuccess],
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>投手消耗上报</CardTitle>
        <CardDescription>填写每日投放消耗数据，系统会自动提醒异常波动。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="spend_date">日期</Label>
            <Input
              id="spend_date"
              type="date"
              value={form.spend_date}
              onChange={(event) => handleChange("spend_date", event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project_id">项目</Label>
            <select
              id="project_id"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.project_id}
              onChange={(event) => handleChange("project_id", event.target.value)}
              required
            >
              <option value="">请选择项目</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">投放国家</Label>
            <Input
              id="country"
              placeholder="如 US"
              value={form.country}
              onChange={(event) => handleChange("country", event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">投放平台</Label>
            <select
              id="platform"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.platform}
              onChange={(event) => handleChange("platform", event.target.value)}
              required
            >
              <option value="">请选择平台</option>
              {platformOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount_usdt">消耗金额 (USDT)</Label>
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
            <Label htmlFor="raw_memo">备注</Label>
            <textarea
              id="raw_memo"
              className="min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.raw_memo}
              onChange={(event) => handleChange("raw_memo", event.target.value)}
              placeholder="可填写渠道、素材、异常说明等"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "提交中..." : "提交上报"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

