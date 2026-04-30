from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .config import config

app = FastAPI(
    title=config.APP_NAME,
    version="1.0.0",
    debug=config.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Al iniciar el servidor, probar conexión a BD"""
    print(f"Iniciando {config.APP_NAME}...")
    print(f"Conectando a: {config.DB_HOST}:{config.DB_PORT}")
    if db.test_connection():
        print("Base de datos conectada correctamente")
    else:
        print("Error de conexión a base de datos")

@app.get("/")
def root():
    return {
        "message": f"Bienvenido a {config.APP_NAME}",
        "status": "online",
        "database": "connected" if db.test_connection() else "disconnected"
    }

@app.get("/health")
def health():
    return {"status": "ok", "database": db.test_connection()}