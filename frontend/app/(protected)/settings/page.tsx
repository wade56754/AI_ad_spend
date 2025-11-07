export default function SettingsPage(): JSX.Element {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">系统设置总览</h1>
        <p className="text-sm text-muted-foreground">
          根据角色进入对应的子模块，管理项目、投手、渠道等基础信息。
        </p>
      </div>
    </main>
  );
}

