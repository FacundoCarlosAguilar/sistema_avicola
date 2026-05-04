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

# ============ MODELOS PARA REGISTRO DIARIO ============
class RegistroDiario(BaseModel):
    fecha: str
    mortandad: int
    aves_vivas: int
    alimento_kg: float
    novedades: str = ""
    id_lote: int

class RespuestaRegistro(BaseModel):
    success: bool
    message: str
    porcentaje: float = 0
    alerta: bool = False
    error: str = ""

# ============ ENDPOINT PARA GUARDAR REGISTRO DIARIO ============
@app.post("/api/registros")
def guardar_registro_diario(registro: RegistroDiario):
    print(f"📝 Recibido: {registro}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si ya existe registro para esa fecha
        cursor.execute(
            "SELECT id FROM control_diario WHERE fecha = %s AND id_lote = %s",
            (registro.fecha, registro.id_lote)
        )
        existe = cursor.fetchone()
        
        if existe:
            cursor.close()
            conn.close()
            return RespuestaRegistro(
                success=False,
                message="Ya existe un registro para esta fecha",
                error="duplicado"
            )
        
        # Insertar nuevo registro
        cursor.execute("""
            INSERT INTO control_diario 
            (fecha, mortandad, aves_vivas, alimento_kg, novedades, id_lote) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            registro.fecha,
            registro.mortandad,
            registro.aves_vivas,
            registro.alimento_kg,
            registro.novedades,
            registro.id_lote
        ))
        
        conn.commit()
        
        # Calcular porcentaje de mortandad del lote
        cursor.execute("""
            SELECT 
                l.cantidad_aves as cantidad_inicial,
                COALESCE(SUM(c.mortandad), 0) as total_muertes
            FROM lotes l
            LEFT JOIN control_diario c ON l.id = c.id_lote
            WHERE l.id = %s
            GROUP BY l.id
        """, (registro.id_lote,))
        
        stats = cursor.fetchone()
        cursor.close()
        conn.close()
        
        porcentaje = 0
        total_muertes = 0
        if stats and stats['cantidad_inicial']:
            total_muertes = stats['total_muertes'] or 0
            porcentaje = round((total_muertes / stats['cantidad_inicial']) * 100, 2)
        
        print(f"✅ Registro guardado. Mortandad acumulada: {porcentaje}%")
        
        return RespuestaRegistro(
            success=True,
            message="Registro guardado correctamente",
            porcentaje=porcentaje,
            alerta=porcentaje > 5
        )
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return RespuestaRegistro(
            success=False,
            message="Error al guardar",
            error=str(e)
        )

# ============ ENDPOINT PARA OBTENER REGISTROS ============
@app.get("/api/registros")
def obtener_registros(fechaInicio: str = "", fechaFin: str = ""):
    print(f"📝 Obteniendo registros del {fechaInicio} al {fechaFin}")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.id,
                c.fecha,
                c.mortandad,
                c.aves_vivas,
                c.alimento_kg,
                c.novedades,
                c.id_lote,
                g.nombre as galpon_nombre
            FROM control_diario c
            JOIN lotes l ON c.id_lote = l.id
            JOIN galpones g ON l.id_galpon = g.id
            WHERE 1=1
        """
        params = []
        
        if fechaInicio and fechaFin:
            query += " AND c.fecha BETWEEN %s AND %s"
            params.append(fechaInicio)
            params.append(fechaFin)
        
        query += " ORDER BY c.fecha DESC"
        
        cursor.execute(query, params)
        registros = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convertir decimal a float para JSON
        for reg in registros:
            if reg.get('alimento_kg'):
                reg['alimento_kg'] = float(reg['alimento_kg'])
        
        print(f"✅ Encontrados {len(registros)} registros")
        return registros
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

# ============ ENDPOINT PARA OBTENER LOTE ACTIVO ============
@app.get("/api/lote-activo/{id_galpon}")
def obtener_lote_activo(id_galpon: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT l.*, g.nombre as galpon_nombre
            FROM lotes l
            JOIN galpones g ON l.id_galpon = g.id
            WHERE l.id_galpon = %s AND l.activo = 1
            ORDER BY l.fecha_ingreso DESC
            LIMIT 1
        """, (id_galpon,))
        
        lote = cursor.fetchone()
        
        if not lote:
            cursor.close()
            conn.close()
            return {"existe": False}
        
        # Calcular estadísticas de mortandad
        cursor.execute("""
            SELECT 
                COALESCE(SUM(mortandad), 0) as total_muertes,
                COUNT(*) as total_registros
            FROM control_diario
            WHERE id_lote = %s
        """, (lote['id'],))
        
        stats = cursor.fetchone()
        cursor.close()
        conn.close()
        
        porcentaje = 0
        if lote['cantidad_aves'] > 0 and stats['total_muertes']:
            porcentaje = round((stats['total_muertes'] / lote['cantidad_aves']) * 100, 2)
        
        return {
            "existe": True,
            "lote": lote,
            "total_muertes": stats['total_muertes'] or 0,
            "porcentaje_mortandad": porcentaje,
            "alerta": porcentaje > 5
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"existe": False, "error": str(e)}

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