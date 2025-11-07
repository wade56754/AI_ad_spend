"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type {
  Channel,
  ChannelForm,
  ChannelFormDraft,
  ChannelListResponse,
  ChannelStatus,
} from "@/types/channels";

const STATUS_OPTIONS: Array<{ value: ChannelStatus; label: string }> = [
  { value: "active", label: "启用" },
  { value: "disabled", label: "停用" },
];

const INITIAL_FORM_STATE: ChannelFormDraft = {
  name: "",
  contact: "",
  rebate_rate: "0",
  status: "active",
  note: "",
};

export default function SettingsChannelsPage(): JSX.Element {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<ChannelFormDraft>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<number | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<ChannelListResponse>("/channels");
    if (response.error) {
      setError(response.error);
      setChannels([]);
    } else {
      const payload = response.data;
      setChannels(payload?.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchChannels();
  }, [fetchChannels]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingChannelId(null);
    setFormState(INITIAL_FORM_STATE);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (channel: Channel) => {
    setDialogMode("edit");
    setEditingChannelId(channel.id);
    setFormState({
      name: channel.name ?? "",
      contact: channel.contact ?? "",
      rebate_rate:
        channel.rebate_rate !== null && channel.rebate_rate !== undefined
          ? String(channel.rebate_rate)
          : "0",
      status: channel.status ?? "active",
      note: channel.note ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setFormError(null);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      setFormError("渠道名称不能为空");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload: ChannelForm = {
      name: formState.name.trim(),
      contact: formState.contact.trim() || undefined,
      rebate_rate: formState.rebate_rate ? Number(formState.rebate_rate) : 0,
      status: formState.status,
      note: formState.note.trim() || undefined,
    };

    const path = dialogMode === "create" ? "/channels" : `/channels/${editingChannelId}`;
    const method = dialogMode === "create" ? "POST" : "PUT";

    const response = await apiRequest(path, {
      method,
      body: JSON.stringify(payload),
    });

    if (response.error) {
      setFormError(response.error);
    } else {
      setDialogOpen(false);
      setFormState(INITIAL_FORM_STATE);
      await fetchChannels();
    }

    setSubmitting(false);
  };

  const handleDelete = async (channel: Channel) => {
    const confirmDelete = window.confirm(`确认删除渠道 “${channel.name}” 吗？该操作不可恢复。`);
    if (!confirmDelete) {
      return;
    }

    const response = await apiRequest(`/channels/${channel.id}`, {
      method: "DELETE",
    });

    if (response.error) {
      setError(response.error);
    } else {
      await fetchChannels();
    }
  };

  const formattedChannels = useMemo(() => channels ?? [], [channels]);

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">渠道管理</h1>
        <p className="text-sm text-muted-foreground">维护渠道信息，确保投手上报时快捷选择。</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>渠道列表</CardTitle>
            <CardDescription>记录渠道联系人、返点策略、使用状态等关键信息。</CardDescription>
          </div>
          <Button onClick={openCreateDialog}>新增渠道</Button>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <div className="px-6 pb-4 text-sm text-red-600">{error}</div> : null}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>渠道名称</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead>返点率</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : formattedChannels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      暂无渠道数据
                    </TableCell>
                  </TableRow>
                ) : (
                  formattedChannels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>{channel.contact || "-"}</TableCell>
                      <TableCell>
                        {channel.rebate_rate !== null && channel.rebate_rate !== undefined
                          ? `${Number(channel.rebate_rate).toFixed(2)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={channel.status === "active" ? "default" : "secondary"}>
                          {channel.status === "active" ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate" title={channel.note ?? undefined}>
                        {channel.note || "-"}
                      </TableCell>
                      <TableCell>
                        {channel.created_at ? new Date(channel.created_at).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(channel)}>
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(channel)}
                        >
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">
                  {dialogMode === "create" ? "新增渠道" : "编辑渠道"}
                </CardTitle>
                <CardDescription>
                  {dialogMode === "create" ? "录入新的渠道信息" : "更新渠道的基本资料"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={closeDialog} disabled={submitting}>
                关闭
              </Button>
            </CardHeader>
            <CardContent>
              {formError ? <div className="mb-4 text-sm text-red-600">{formError}</div> : null}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700" htmlFor="name">
                    渠道名称
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="contact">
                      联系人
                    </label>
                    <Input
                      id="contact"
                      name="contact"
                      value={formState.contact}
                      onChange={handleInputChange}
                      placeholder="例如：张三 / 微信：channel_ops"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="rebate_rate">
                      返点率 (%)
                    </label>
                    <Input
                      id="rebate_rate"
                      name="rebate_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.rebate_rate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700" htmlFor="status">
                      渠道状态
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formState.status}
                      onChange={handleInputChange}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700" htmlFor="note">
                    备注
                  </label>
                  <Textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={formState.note}
                    onChange={handleInputChange}
                    placeholder="记录结算周期、合作渠道账号等信息"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                    取消
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "提交中..." : dialogMode === "create" ? "保存渠道" : "更新渠道"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
