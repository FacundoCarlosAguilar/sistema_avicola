import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Cargar variables de entorno desde .env (en la raíz del proyecto)
load_dotenv()

class Database:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection = None
        return cls._instance
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST'),
                port=os.getenv('DB_PORT', 3306),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                database=os.getenv('DB_NAME')
            )
            if self.connection.is_connected():
                print("Conexión exitosa a la nube")
                return self.connection
        except Error as e:
            print(f"Error de conexión a la nube: {e}")
            return None
    
    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Conexión cerrada")
    
    def test_connection(self):
        """Prueba rápida de conexión"""
        conn = self.connect()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"MySQL Version: {version[0]}")
            self.disconnect()
            return True
        return False

# Instancia única
db = Database()