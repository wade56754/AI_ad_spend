"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { Project, ProjectForm, ProjectListResponse } from "@/types/projects";

const initialForm: ProjectForm = {
  name: "",
  country: "",
  description: "",
};

export default function SettingsProjectsPage(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<ProjectListResponse>("/projects");
    if (response.error) {
      setError(response.error);
      setProjects([]);
    } else {
      setProjects(response.data?.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const payload: ProjectForm = {
      name: form.name,
      country: form.country?.trim() || undefined,
      description: form.description?.trim() || undefined,
    };
    const response = await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.error) {
      setForm(initialForm);
      await fetchProjects();
    } else {
      setError(response.error);
    }
    setSubmitting(false);
  };

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">项目管理</h1>
        <p className="text-sm text-muted-foreground">维护项目列表，确保投手与渠道关联准确。</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>项目列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      暂无项目
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="max-w-[320px] truncate" title={project.description ?? undefined}>
                        {project.description || "-"}
                      </TableCell>
                      <TableCell>
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新增项目</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  项目名称
                </label>
                <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
              </div>

              <div className="space-y-1">
                <label htmlFor="country" className="text-sm font-medium text-gray-700">
                  国家/地区
                </label>
                <Input
                  id="country"
                  name="country"
                  value={form.country ?? ""}
                  onChange={handleInputChange}
                  placeholder="例如：美国"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  项目描述
                </label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={form.description ?? ""}
                  onChange={handleInputChange}
                  placeholder="补充投放渠道、预算等信息"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : "保存项目"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

