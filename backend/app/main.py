from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import test_connection
import mysql.connector

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


@app.on_event("startup")
async def startup():
    print("Iniciando Sistema Avícola API")
    test_connection()

@app.get("/")
def root():
    return {"message": "Sistema Avícola API", "status": "online", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}