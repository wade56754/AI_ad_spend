-- 渠道管理相关表创建脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 执行前请确保已执行过 init_supabase.sql

-- 1. 创建渠道表
CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(100),
    rebate_rate NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    note VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- 为 channels 表创建索引
CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);

-- 2. 创建项目渠道关联表（多对多关系）
CREATE TABLE IF NOT EXISTS project_channels (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, channel_id)
);

-- 为 project_channels 表创建索引
CREATE INDEX IF NOT EXISTS idx_project_channels_project ON project_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_project_channels_channel ON project_channels(channel_id);

-- 3. 修改 ad_spend_daily 表，添加 channel_id 字段（必填）
ALTER TABLE ad_spend_daily 
ADD COLUMN IF NOT EXISTS channel_id INTEGER REFERENCES channels(id) ON DELETE RESTRICT;

-- 将 channel_id 设置为必填（NOT NULL）
-- 注意：如果表中已有数据，需要先为现有记录设置默认渠道，然后再执行此操作
-- ALTER TABLE ad_spend_daily ALTER COLUMN channel_id SET NOT NULL;

-- 为 ad_spend_daily.channel_id 创建索引
CREATE INDEX IF NOT EXISTS idx_ad_spend_channel ON ad_spend_daily(channel_id);

-- 4. 创建月度渠道绩效表
CREATE TABLE IF NOT EXISTS monthly_channel_performance (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    total_spend NUMERIC(15, 2) DEFAULT 0,
    active_accounts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(channel_id, month)
);

-- 为 monthly_channel_performance 表创建索引
CREATE INDEX IF NOT EXISTS idx_monthly_channel_perf_channel ON monthly_channel_performance(channel_id);
CREATE INDEX IF NOT EXISTS idx_monthly_channel_perf_month ON monthly_channel_performance(month);
CREATE INDEX IF NOT EXISTS idx_monthly_channel_perf_channel_month ON monthly_channel_performance(channel_id, month);

-- 为 channels 表添加更新时间触发器
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 monthly_channel_performance 表添加更新时间触发器
CREATE TRIGGER update_monthly_channel_perf_updated_at BEFORE UPDATE ON monthly_channel_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT '渠道管理相关表创建完成！' AS message;

