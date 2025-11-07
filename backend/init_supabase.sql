-- Supabase 数据库初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 1. 创建项目表
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    description VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);

-- 2. 创建投手表
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER REFERENCES projects(id),
    role VARCHAR(20) DEFAULT 'operator',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_operators_employee_id ON operators(employee_id);
CREATE INDEX IF NOT EXISTS idx_operators_project_id ON operators(project_id);

-- 3. 创建投手日报表
CREATE TABLE IF NOT EXISTS ad_spend_daily (
    id SERIAL PRIMARY KEY,
    spend_date DATE NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    country VARCHAR(50),
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    platform VARCHAR(50),
    amount_usdt NUMERIC(15, 2) NOT NULL,
    raw_memo VARCHAR(1000),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_date ON ad_spend_daily(spend_date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_project ON ad_spend_daily(project_id);
CREATE INDEX IF NOT EXISTS idx_ad_spend_operator ON ad_spend_daily(operator_id);
CREATE INDEX IF NOT EXISTS idx_ad_spend_status ON ad_spend_daily(status);

-- 4. 创建财务收支表
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id SERIAL PRIMARY KEY,
    tx_date DATE NOT NULL,
    direction VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDT',
    account VARCHAR(100),
    description VARCHAR(1000),
    fee_amount NUMERIC(15, 2) DEFAULT 0,
    project_id INTEGER REFERENCES projects(id),
    operator_id INTEGER REFERENCES operators(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ledger_tx_date ON ledger_transactions(tx_date);
CREATE INDEX IF NOT EXISTS idx_ledger_project ON ledger_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_ledger_operator ON ledger_transactions(operator_id);
CREATE INDEX IF NOT EXISTS idx_ledger_direction ON ledger_transactions(direction);

-- 5. 创建对账结果表
CREATE TABLE IF NOT EXISTS reconciliation (
    id SERIAL PRIMARY KEY,
    ad_spend_id INTEGER NOT NULL REFERENCES ad_spend_daily(id),
    ledger_id INTEGER NOT NULL REFERENCES ledger_transactions(id),
    amount_diff NUMERIC(15, 2) DEFAULT 0,
    date_diff INTEGER DEFAULT 0,
    match_score NUMERIC(5, 2),
    status VARCHAR(20) DEFAULT 'matched',
    reason VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_ad_spend ON reconciliation(ad_spend_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_ledger ON reconciliation(ledger_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation(status);

-- 6. 创建投手工资表
CREATE TABLE IF NOT EXISTS operator_salary (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    salary_amount NUMERIC(15, 2) NOT NULL,
    bonus_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    description VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_salary_operator ON operator_salary(operator_id);
CREATE INDEX IF NOT EXISTS idx_salary_year_month ON operator_salary(year, month);

-- 7. 创建月度项目绩效表
CREATE TABLE IF NOT EXISTS monthly_project_performance (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_spend_usdt NUMERIC(15, 2) DEFAULT 0,
    total_income_usdt NUMERIC(15, 2) DEFAULT 0,
    total_spend_cny NUMERIC(15, 2) DEFAULT 0,
    total_income_cny NUMERIC(15, 2) DEFAULT 0,
    net_profit_cny NUMERIC(15, 2) DEFAULT 0,
    profit_margin NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(project_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_project_perf ON monthly_project_performance(project_id, year, month);

-- 8. 创建月度投手绩效表
CREATE TABLE IF NOT EXISTS monthly_operator_performance (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_spend_usdt NUMERIC(15, 2) DEFAULT 0,
    total_spend_cny NUMERIC(15, 2) DEFAULT 0,
    salary_cost_cny NUMERIC(15, 2) DEFAULT 0,
    total_cost_cny NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(operator_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_operator_perf ON monthly_operator_performance(operator_id, year, month);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_spend_updated_at BEFORE UPDATE ON ad_spend_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_updated_at BEFORE UPDATE ON ledger_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_updated_at BEFORE UPDATE ON operator_salary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_project_perf_updated_at BEFORE UPDATE ON monthly_project_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_operator_perf_updated_at BEFORE UPDATE ON monthly_operator_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT '数据库表创建完成！' AS message;


