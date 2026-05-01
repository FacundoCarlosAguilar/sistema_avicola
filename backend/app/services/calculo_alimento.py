from sqlalchemy.orm import Session # type: ignore
from datetime import date
from ..models import Lote, ControlDiario, FaseConsumo

class CalculoAlimentoService:
    
    @staticmethod
    def get_aves_vivas(db: Session, lote_id: int):
        lote = db.query(Lote).filter(Lote.id == lote_id).first()
        if not lote:
            return 0
        
        total_mortandad = db.query(ControlDiario).filter(
            ControlDiario.id_lote == lote_id
        ).with_entities(func.sum(ControlDiario.mortandad)).scalar() or 0
        
        return lote.cantidad_aves - total_mortandad
    
    @staticmethod
    def get_edad_dias(lote_id: int, db: Session):
        lote = db.query(Lote).filter(Lote.id == lote_id).first()
        if not lote:
            return 0
        delta = date.today() - lote.fecha_ingreso
        return delta.days
    
    @staticmethod
    def get_consumo_por_edad(edad: int, db: Session):
        fase = db.query(FaseConsumo).filter(
            FaseConsumo.edad_desde <= edad,
            FaseConsumo.edad_hasta >= edad
        ).first()
        
        if fase:
            return fase.consumo_gramos
        return 180  # valor por defecto
    
    @staticmethod
    def calcular_alimento_requerido(lote_id: int, db: Session):
        aves_vivas = CalculoAlimentoService.get_aves_vivas(db, lote_id)
        edad = CalculoAlimentoService.get_edad_dias(lote_id, db)
        consumo_por_ave = CalculoAlimentoService.get_consumo_por_edad(edad, db)
        
        alimento_kg = (aves_vivas * consumo_por_ave) / 1000
        
        return {
            "lote_id": lote_id,
            "aves_vivas": aves_vivas,
            "edad_dias": edad,
            "consumo_por_ave_gramos": consumo_por_ave,
            "alimento_requerido_kg": round(alimento_kg, 2)
        }