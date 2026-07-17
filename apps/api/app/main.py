from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Ninho Consultoria API",
    version="0.1.0",
    description="API da plataforma Ninho Consultoria — Fase 3 (backend) ainda não iniciada.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Routers dos módulos serão registrados aqui na Fase 3:
# from app.modules.crm.router import router as crm_router
# app.include_router(crm_router, prefix="/api/v1/oportunidades", tags=["crm"])
