from ..database import get_db_connection

class GranjaService:
    
    @staticmethod
    def listar_todas():
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM granjas WHERE activo = 1")
        granjas = cursor.fetchall()
        cursor.close()
        conn.close()
        return granjas
    
    @staticmethod
    def crear_granja(nombre, ubicacion, id_dueno):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO granjas (nombre, ubicacion, id_dueno) VALUES (%s, %s, %s)",
            (nombre, ubicacion, id_dueno)
        )
        conn.commit()
        granja_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return {"id": granja_id, "nombre": nombre, "ubicacion": ubicacion}
    
    @staticmethod
    def obtener_por_id(granja_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM granjas WHERE id = %s", (granja_id,))
        granja = cursor.fetchone()
        cursor.close()
        conn.close()
        return granja