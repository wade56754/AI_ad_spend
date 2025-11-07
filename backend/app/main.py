from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ad_spend, ledger, reconciliation, analytics, channels, projects, operators

app = FastAPI(
    title='Ad Spend Management API',
    description='Ad spend reporting, ledger, reconciliation and analytics service',
    version='1.0.0',
)

frontend_origin = getattr(settings, 'frontend_origin', None)
cors_origins = [frontend_origin] if frontend_origin else ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(ad_spend.router, prefix='/api')
app.include_router(ledger.router, prefix='/api')
app.include_router(reconciliation.router, prefix='/api')
app.include_router(channels.router, prefix='/api')
app.include_router(analytics.router, prefix='/api')
app.include_router(projects.router, prefix='/api')
app.include_router(operators.router, prefix='/api')


@app.get('/')
def root() -> dict[str, str]:
    return {'message': 'Ad spend management API'}


@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'healthy'}

