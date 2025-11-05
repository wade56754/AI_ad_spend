"""
Supabase 客户端工具（可选）

如果需要使用 Supabase 的认证、存储等功能，可以使用此客户端
"""
from typing import Optional
from app.config import settings

try:
    from supabase import create_client, Client
    
    _supabase_client: Optional[Client] = None
    
    def get_supabase_client() -> Optional[Client]:
        """获取 Supabase 客户端实例"""
        global _supabase_client
        
        if not settings.supabase_url or not settings.supabase_key:
            return None
        
        if _supabase_client is None:
            _supabase_client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        
        return _supabase_client

except ImportError:
    # Supabase 客户端未安装，返回 None
    def get_supabase_client():
        """Supabase 客户端未安装"""
        return None

