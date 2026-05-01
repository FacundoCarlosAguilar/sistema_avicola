from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import test_connection
import mysql.connector
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import hashlib

app = FastAPI(title="Sistema Avícola API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host="212.85.3.6",
        port=3306,
        user="u481307435_grupo_n6",
        password="1eDD5>o?@V^",
        database="u481307435_sistema_av"
    )

# ============ MODELOS PARA LOGIN ============
class LoginRequest(BaseModel):
    usuario: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    rol: str
    nombre: str

# ============ CONFIGURACIÓN JWT ============
SECRET_KEY = "mi_clave_secreta_para_jwt"
ALGORITHM = "HS256"

def crear_token(usuario_id: int, rol: str, nombre: str):
    payload = {
        "user_id": usuario_id,
        "rol": rol,
        "nombre": nombre,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ============ ENDPOINT DE LOGIN ============
@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT id, nombre, usuario, password_hash, perfil FROM usuarios WHERE usuario = %s",
        (request.usuario,)
    )
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Verificar contraseña (temporal - comparación directa)
    if request.password != usuario['password_hash']:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    token = crear_token(usuario['id'], usuario['perfil'], usuario['nombre'])
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        rol=usuario['perfil'],
        nombre=usuario['nombre']
    )

# ============ ENDPOINTS DE PRUEBA ============
@app.get("/api/ver-datos")
def ver_datos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    datos = {}
    tablas = ["empresas", "duenos", "granjas", "galpones", "lotes", "usuarios", "fases_consumo"]
    
    for tabla in tablas:
        cursor.execute(f"SELECT * FROM {tabla}")
        datos[tabla] = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return datos

@app.get("/api/granjas")
def ver_granjas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM granjas")
    granjas = cursor.fetchall()
    cursor.close()
    conn.close()
    return granjas

@app.get("/api/usuarios")
def ver_usuarios():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, usuario, perfil, id_granja_asignada FROM usuarios")
    usuarios = cursor.fetchall()
    cursor.close()
    conn.close()
    return usuarios

@app.get("/api/lotes")
def ver_lotes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM lotes")
    lotes = cursor.fetchall()
    cursor.close()
    conn.close()
    return lotes

# ============ ENDPOINTS PRINCIPALES ============
@app.on_event("startup")
async def startup():
    print("🚀 Iniciando Sistema Avícola API...")
    test_connection()

@app.get("/")
def root():
    return {"message": "Sistema Avícola API", "status": "online", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}