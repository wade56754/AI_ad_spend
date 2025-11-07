-- =====================================================================
-- AI 财务与投手管理系统：RLS 初始化脚本
-- 说明：
-- 1. 请在 Supabase Dashboard → SQL Editor 中执行
-- 2. 如表结构中不存在 auth_user_id / status 等字段，请先补齐
-- 3. 若已存在策略，执行前将自动 DROP 再 CREATE
-- =====================================================================

-----------------------------
-- 0. 启用 Row Level Security
-----------------------------
ALTER TABLE projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation         ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels               ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_channels       ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------------------
-- 1. operators 表
--    假设 operators.auth_user_id 存储 Supabase uid（uuid 类型）
---------------------------------------------------------------------
DROP POLICY IF EXISTS "operators_select_self" ON operators;
DROP POLICY IF EXISTS "operators_admin_full" ON operators;

CREATE POLICY "operators_select_self"
ON operators FOR SELECT
USING (auth.uid() = auth_user_id);

CREATE POLICY "operators_admin_full"
ON operators FOR ALL
USING (auth.role() IN ('admin', 'finance', 'account_mgr', 'manager'));

---------------------------------------------------------------------
-- 2. projects 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_admin_full" ON projects;
DROP POLICY IF EXISTS "projects_operator_read" ON projects;

CREATE POLICY "projects_admin_full"
ON projects FOR ALL
USING (auth.role() IN ('admin', 'finance', 'account_mgr', 'manager'));

CREATE POLICY "projects_operator_read"
ON projects FOR SELECT
USING (
  id IN (
    SELECT o.project_id
    FROM operators o
    WHERE o.auth_user_id = auth.uid()
  )
);

---------------------------------------------------------------------
-- 3. ad_spend_daily 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "ad_spend_operator_rw" ON ad_spend_daily;
DROP POLICY IF EXISTS "ad_spend_admin_read" ON ad_spend_daily;

CREATE POLICY "ad_spend_operator_rw"
ON ad_spend_daily FOR ALL
USING (
  operator_id IN (
    SELECT o.id
    FROM operators o
    WHERE o.auth_user_id = auth.uid()
  )
);

CREATE POLICY "ad_spend_admin_read"
ON ad_spend_daily FOR SELECT
USING (auth.role() IN ('finance', 'admin', 'manager'));

---------------------------------------------------------------------
-- 4. channels 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "channels_admin_mgr_rw" ON channels;
DROP POLICY IF EXISTS "channels_public_view" ON channels;

CREATE POLICY "channels_admin_mgr_rw"
ON channels FOR ALL
USING (auth.role() IN ('account_mgr', 'admin'));

CREATE POLICY "channels_public_view"
ON channels FOR SELECT
USING (status = 'active');

---------------------------------------------------------------------
-- 5. project_channels 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "project_channels_admin_rw" ON project_channels;
DROP POLICY IF EXISTS "project_channels_read" ON project_channels;

CREATE POLICY "project_channels_admin_rw"
ON project_channels FOR ALL
USING (auth.role() IN ('account_mgr', 'admin'));

CREATE POLICY "project_channels_read"
ON project_channels FOR SELECT
USING (TRUE);

---------------------------------------------------------------------
-- 6. ledger_transactions 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "ledger_finance_admin" ON ledger_transactions;
DROP POLICY IF EXISTS "ledger_operator_view" ON ledger_transactions;

CREATE POLICY "ledger_finance_admin"
ON ledger_transactions FOR ALL
USING (auth.role() IN ('finance', 'admin'));

CREATE POLICY "ledger_operator_view"
ON ledger_transactions FOR SELECT
USING (
  operator_id IN (
    SELECT o.id
    FROM operators o
    WHERE o.auth_user_id = auth.uid()
  )
  OR project_id IN (
    SELECT o.project_id
    FROM operators o
    WHERE o.auth_user_id = auth.uid()
  )
);

---------------------------------------------------------------------
-- 7. reconciliation 表
---------------------------------------------------------------------
DROP POLICY IF EXISTS "reconciliation_finance_admin" ON reconciliation;

CREATE POLICY "reconciliation_finance_admin"
ON reconciliation FOR ALL
USING (auth.role() IN ('finance', 'admin'));

---------------------------------------------------------------------
-- 8. 可选：默认禁止匿名访问（确保无策略时无法访问）
---------------------------------------------------------------------
ALTER TABLE projects               FORCE ROW LEVEL SECURITY;
ALTER TABLE operators              FORCE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily         FORCE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions    FORCE ROW LEVEL SECURITY;
ALTER TABLE reconciliation         FORCE ROW LEVEL SECURITY;
ALTER TABLE channels               FORCE ROW LEVEL SECURITY;
ALTER TABLE project_channels       FORCE ROW LEVEL SECURITY;

-- =====================================================================
-- 执行完毕后，请使用不同角色账号（operator/finance/account_mgr等）
-- 访问相关接口，确认策略生效
-- =====================================================================