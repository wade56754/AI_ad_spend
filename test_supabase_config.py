"""
测试 Supabase 配置是否正确
"""
import os
import sys
import requests
from pathlib import Path

def test_supabase_url():
    """测试 Supabase URL 是否正确"""
    print("=" * 60)
    print("测试 Supabase 配置")
    print("=" * 60)
    
    # Supabase 项目 URL
    supabase_url = "https://jzmcoivxhiyidizncyaq.supabase.co"
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw"
    
    print(f"\n1. 测试 Supabase REST API...")
    print(f"   URL: {supabase_url}")
    
    # 测试 REST API（查询表）
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 测试连接 - 尝试查询 projects 表
    test_url = f"{supabase_url}/rest/v1/projects?select=id&limit=1"
    
    try:
        response = requests.get(test_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"   [OK] REST API 连接成功！")
            print(f"   响应: {response.json() if response.content else '空响应'}")
            return True
        elif response.status_code == 404:
            print(f"   [WARNING] 表可能不存在（404）")
            print(f"   这可能是正常的，如果还没有创建表")
            print(f"   请执行 backend/init_supabase.sql 创建表")
            return True  # 表不存在但连接正常
        else:
            print(f"   [ERROR] 请求失败: {response.status_code}")
            print(f"   响应: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   [ERROR] 连接失败: {e}")
        return False

def check_env_files():
    """检查环境变量文件"""
    print(f"\n2. 检查环境变量文件...")
    
    # 检查后端 .env
    backend_env = Path("backend/.env")
    if backend_env.exists():
        print(f"   [OK] backend/.env 存在")
        try:
            content = backend_env.read_text(encoding='utf-8')
            if "DATABASE_URL" in content:
                print(f"   [OK] DATABASE_URL 已配置")
            else:
                print(f"   [WARNING] DATABASE_URL 未找到")
        except Exception as e:
            print(f"   [ERROR] 读取文件失败: {e}")
    else:
        print(f"   [ERROR] backend/.env 不存在")
    
    # 检查前端 .env.local
    frontend_env = Path("with-supabase-app/.env.local")
    if frontend_env.exists():
        print(f"   [OK] with-supabase-app/.env.local 存在")
        try:
            content = frontend_env.read_text(encoding='utf-8')
            if "NEXT_PUBLIC_SUPABASE_URL" in content:
                print(f"   [OK] NEXT_PUBLIC_SUPABASE_URL 已配置")
            else:
                print(f"   [WARNING] NEXT_PUBLIC_SUPABASE_URL 未找到")
        except Exception as e:
            print(f"   [ERROR] 读取文件失败: {e}")
    else:
        print(f"   [WARNING] with-supabase-app/.env.local 不存在")
        print(f"   需要创建此文件")

def explain_supabase_url():
    """解释 Supabase URL 的行为"""
    print(f"\n3. 关于 Supabase URL 的说明...")
    print(f"   - 直接访问项目根 URL 会返回错误是正常的")
    print(f"   - Supabase 需要访问具体的 API 端点，例如：")
    print(f"     - REST API: /rest/v1/table_name")
    print(f"     - Auth API: /auth/v1/...")
    print(f"     - Storage API: /storage/v1/...")
    print(f"   - 正确的测试方式是使用 API Key 访问 REST API")

if __name__ == "__main__":
    # 切换到项目根目录
    os.chdir(Path(__file__).parent)
    
    print("\n" + "=" * 60)
    print("Supabase 配置测试")
    print("=" * 60)
    
    check_env_files()
    explain_supabase_url()
    
    success = test_supabase_url()
    
    print("\n" + "=" * 60)
    if success:
        print("[OK] Supabase 配置基本正常")
        print("\n下一步:")
        print("1. 确认环境变量文件已正确配置")
        print("2. 在 Supabase SQL Editor 中执行 init_supabase.sql")
        print("3. 启动后端和前端服务进行测试")
    else:
        print("[ERROR] 配置有问题，请检查")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
