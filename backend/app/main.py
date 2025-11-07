from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ad_spend, ledger, reconciliation, analytics, channels, projects, operators

app = FastAPI(
    title="广告投手消耗上报系统",
    description="广告投手消耗上报 + 财务收支录入 + 自动对账 + 月度分析系统",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应设置为具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(ad_spend.router, prefix="/api")
app.include_router(ledger.router, prefix="/api")
app.include_router(reconciliation.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(channels.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(operators.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "广告投手消耗上报系统 API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

