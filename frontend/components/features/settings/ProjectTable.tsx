"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type { Project, ProjectForm, ProjectListResponse } from "@/types/projects";

interface ProjectTableProps {
  onSuccess?: () => void;
}

const defaultFormState: ProjectForm = {
  name: "",
  country: "",
  description: "",
};

export function ProjectTable({ onSuccess }: ProjectTableProps): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);

      const payload: ProjectForm = {
        name: form.name,
        country: form.country?.trim() || undefined,
        description: form.description?.trim() || undefined,
      };

      const response = await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmitting(false);

      if (response.error) {
        setError(response.error);
        return;
      }

      setForm(defaultFormState);
      if (onSuccess) onSuccess();
      void fetchProjects();
    },
    [form, fetchProjects, onSuccess],
  );

  const rows = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            加载中...
          </TableCell>
        </TableRow>
      );
    }

    if (projects.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            暂无项目
          </TableCell>
        </TableRow>
      );
    }

    return projects.map((project) => (
      <TableRow key={project.id}>
        <TableCell>{project.name}</TableCell>
        <TableCell>{project.country ?? "-"}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {project.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}
        </TableCell>
        <TableCell className="text-right text-sm text-muted-foreground">待支持编辑/删除</TableCell>
      </TableRow>
    ));
  }, [loading, projects]);

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>新增项目</CardTitle>
          <CardDescription>记录投放项目基本信息，投手上报时可直接选择。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                项目名称
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="country">
                国家
              </label>
              <Input
                id="country"
                name="country"
                value={form.country ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "提交中..." : "新增项目"}
              </Button>
            </div>
          </form>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>项目列表</CardTitle>
          <CardDescription>后续可以提供编辑、删除、渠道关联等操作。</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目名称</TableHead>
                <TableHead>国家</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

