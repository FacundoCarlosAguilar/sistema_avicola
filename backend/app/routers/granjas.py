from fastapi import APIRouter, HTTPException
from ..services.granja_service import GranjaService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/granjas", tags=["Granjas"])

class GranjaCreate(BaseModel):
    nombre: str
    ubicacion: str
    id_dueno: int

class GranjaResponse(BaseModel):
    id: int
    nombre: str
    ubicacion: str
    id_dueno: Optional[int] = None

@router.get("/", response_model=List[GranjaResponse])
def listar_granjas():
    return GranjaService.listar_todas()

@router.post("/", response_model=GranjaResponse)
def crear_granja(granja: GranjaCreate):
    return GranjaService.crear_granja(granja.nombre, granja.ubicacion, granja.id_dueno)

@router.get("/{granja_id}", response_model=GranjaResponse)
def obtener_granja(granja_id: int):
    granja = GranjaService.obtener_por_id(granja_id)
    if not granja:
        raise HTTPException(status_code=404, detail="Granja no encontrada")
    return granja