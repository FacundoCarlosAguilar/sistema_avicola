from pydantic import BaseModel
from datetime import date
from typing import Optional


class UsuarioLogin(BaseModel):
    usuario: str
    password: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    usuario: str
    perfil: str

class GranjaCreate(BaseModel):
    nombre: str
    ubicacion: str
    id_dueno: int

class GranjaResponse(GranjaCreate):
    id: int


class GalponCreate(BaseModel):
    nombre: str
    capacidad: int