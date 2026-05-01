from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session 
from ..database import get_db
from ..models import Usuario
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt 
import os

router = APIRouter(prefix="/auth", tags=["Autenticación"])

SECRET_KEY = os.getenv("SECRET_KEY", "mi_clave_secreta")
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    usuario: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    rol: str
    nombre: str
    id_usuario: int

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.usuario == request.usuario).first()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    if request.password != usuario.password_hash:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    payload = {
        "sub": usuario.id,
        "usuario": usuario.usuario,
        "rol": usuario.perfil,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        rol=usuario.perfil,
        nombre=usuario.nombre,
        id_usuario=usuario.id
    )