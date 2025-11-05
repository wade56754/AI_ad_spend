-- 插入测试数据
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 插入测试项目
INSERT INTO projects (name, code, description, status) 
VALUES 
    ('测试项目A', 'PROJ001', '第一个测试项目', 'active'),
    ('测试项目B', 'PROJ002', '第二个测试项目', 'active')
ON CONFLICT (code) DO NOTHING;

-- 2. 插入测试投手
INSERT INTO operators (name, employee_id, project_id, role, status) 
VALUES 
    ('张三', 'EMP001', 1, 'operator', 'active'),
    ('李四', 'EMP002', 1, 'operator', 'active'),
    ('王五', 'EMP003', 2, 'operator', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- 3. 插入测试广告消耗记录
INSERT INTO ad_spend_daily (spend_date, project_id, country, operator_id, platform, amount_usdt, raw_memo, status)
VALUES 
    (CURRENT_DATE, 1, 'US', 1, 'Facebook', 100.50, '测试消耗1', 'pending'),
    (CURRENT_DATE, 1, 'UK', 2, 'Google', 200.75, '测试消耗2', 'pending'),
    (CURRENT_DATE, 2, 'CN', 3, 'TikTok', 150.00, '测试消耗3', 'pending');

-- 4. 插入测试财务记录
INSERT INTO ledger_transactions (tx_date, direction, amount, currency, account, description, fee_amount, project_id, operator_id, status)
VALUES 
    (CURRENT_DATE, 'expense', 100.50, 'USDT', 'Meta Ads', '广告支出', 0.5, 1, 1, 'pending'),
    (CURRENT_DATE, 'expense', 200.75, 'USDT', 'Google Ads', '广告支出', 1.0, 1, 2, 'pending'),
    (CURRENT_DATE, 'income', 500.00, 'USDT', 'Project Revenue', '项目收入', 2.0, 1, 1, 'completed');

-- 查看插入结果
SELECT '项目' as 类型, COUNT(*) as 数量 FROM projects
UNION ALL
SELECT '投手', COUNT(*) FROM operators
UNION ALL
SELECT '广告消耗', COUNT(*) FROM ad_spend_daily
UNION ALL
SELECT '财务记录', COUNT(*) FROM ledger_transactions;

