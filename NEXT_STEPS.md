# 下一步操作指南

## ✅ 已完成的工作

1. **数据库表创建** - 所有表结构已创建完成
2. **渠道管理功能** - 后端 API 已实现
3. **项目和投手 API** - 基础查询接口已实现
4. **前端页面完善** - 投手消耗上报页面已连接真实 API

---

## 🚀 立即可以做的事情

### 1. 测试系统功能

#### 步骤1: 启动后端服务
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

#### 步骤2: 启动前端服务
```bash
cd frontend
npm run dev
```

#### 步骤3: 访问系统
- 前端: http://localhost:3000/report/spend
- 后端 API 文档: http://localhost:8000/docs

### 2. 准备测试数据

在 Supabase Dashboard -> SQL Editor 中执行以下 SQL：

```sql
-- 1. 创建测试项目
INSERT INTO projects (name, code, description, status) 
VALUES 
  ('测试项目A', 'PROJ001', '第一个测试项目', 'active'),
  ('测试项目B', 'PROJ002', '第二个测试项目', 'active')
ON CONFLICT (code) DO NOTHING;

-- 2. 创建测试渠道
INSERT INTO channels (name, contact, rebate_rate, status, note)
VALUES 
  ('渠道A', '联系人A', 5.00, 'active', '测试渠道A'),
  ('渠道B', '联系人B', 3.50, 'active', '测试渠道B')
ON CONFLICT DO NOTHING;

-- 3. 关联渠道到项目
INSERT INTO project_channels (project_id, channel_id)
VALUES 
  (1, 1),
  (1, 2),
  (2, 1)
ON CONFLICT (project_id, channel_id) DO NOTHING;

-- 4. 创建测试投手
INSERT INTO operators (name, employee_id, project_id, role, status)
VALUES 
  ('张三', 'EMP001', 1, 'operator', 'active'),
  ('李四', 'EMP002', 1, 'operator', 'active'),
  ('王五', 'EMP003', 2, 'operator', 'active')
ON CONFLICT (employee_id) DO NOTHING;
```

### 3. 测试投手消耗上报功能

1. 访问 http://localhost:3000/report/spend
2. 填写表单：
   - 选择项目（应该能看到测试项目）
   - 选择渠道（选择项目后应该能看到关联的渠道）
   - 选择投手（需要手动输入投手ID，后续可以改进为下拉选择）
   - 填写其他信息
3. 提交表单，验证：
   - 是否能成功提交
   - 是否显示成功提示
   - 如果金额差异>30%，是否显示警告

---

## 📋 接下来需要完成的工作

### 第一阶段：基础功能（优先级：高）

#### 1. 完善投手选择功能
- [ ] 将投手ID输入框改为下拉选择
- [ ] 根据选择的项目自动加载该项目的投手列表

#### 2. 实现用户认证功能
- [ ] 后端：实现 JWT 认证（`app/routers/auth.py`）
- [ ] 后端：实现用户模型和登录逻辑
- [ ] 前端：创建登录页面
- [ ] 前端：实现路由保护（middleware）
- [ ] 前端：实现 token 存储和自动刷新

#### 3. 开发项目和投手管理页面
- [ ] 后端：完善项目和投手的 CRUD 接口
- [ ] 前端：创建设置页面（`/settings`）
- [ ] 前端：实现项目管理界面
- [ ] 前端：实现投手管理界面
- [ ] 前端：实现渠道管理界面

### 第二阶段：核心业务（优先级：中）

#### 4. 完善投手消耗上报功能
- [ ] 添加消耗记录列表展示
- [ ] 实现编辑和删除功能
- [ ] 添加筛选和搜索功能
- [ ] 优化异常检测提示

#### 5. 开发财务收支录入功能
- [ ] 后端：完善财务收支接口
- [ ] 前端：完善财务录入页面
- [ ] 实现批量导入功能

### 第三阶段：高级功能（优先级：低）

#### 6. 实现自动对账功能
- [ ] 后端：实现对账算法
- [ ] 前端：实现对账页面
- [ ] 实现对账结果审核

#### 7. 开发月度报表功能
- [ ] 后端：实现报表生成逻辑
- [ ] 前端：实现报表展示页面

---

## 🔧 当前已知问题

1. **投手选择**：目前是手动输入ID，应该改为下拉选择
2. **认证缺失**：目前没有用户认证，所有接口都可以访问
3. **权限控制**：没有实现基于角色的权限控制
4. **数据验证**：前端验证还不够完善

---

## 💡 建议的开发顺序

1. **立即**：测试当前功能，确保基础流程可用
2. **接下来**：完善投手选择功能（改为下拉选择）
3. **然后**：实现用户认证功能
4. **最后**：完善其他功能模块

---

## 📝 注意事项

1. **环境变量**：确保 `frontend/.env.local` 和 `backend/.env` 已正确配置
2. **数据库连接**：确保 Supabase 连接正常
3. **CORS 配置**：开发环境可以使用 `["*"]`，生产环境必须设置具体域名
4. **渠道必填**：投手上报时必须选择渠道，这是业务规则

---

**最后更新**: 2024-11-04
