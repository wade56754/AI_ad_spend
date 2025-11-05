"""
测试 Supabase 数据库连接
运行此脚本来验证数据库连接是否正常
"""
import sys
from app.db.session import SessionLocal
from app.models.project import Project

def test_connection():
    """测试数据库连接"""
    print("正在测试 Supabase 数据库连接...")
    print("-" * 50)
    
    db = SessionLocal()
    try:
        # 测试基本连接
        result = db.execute("SELECT 1 as test")
        print("✅ 数据库连接成功！")
        
        # 测试查询表
        try:
            count = db.query(Project).count()
            print(f"✅ 表查询成功！当前有 {count} 个项目")
        except Exception as e:
            print(f"⚠️  表可能还未创建: {e}")
            print("   请执行 init_supabase.sql 创建表")
        
        print("-" * 50)
        print("✅ 连接测试完成！")
        return True
        
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        print("\n可能的原因：")
        print("1. 数据库密码不正确")
        print("2. 连接字符串格式错误")
        print("3. 网络连接问题")
        print("4. Supabase 项目未启动")
        print("\n请检查：")
        print("- backend/.env 文件中的 DATABASE_URL")
        print("- Supabase Dashboard 中的连接字符串")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

