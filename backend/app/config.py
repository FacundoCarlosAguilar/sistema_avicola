import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    # Base de datos
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'sistema_avicola')
    
    # Seguridad
    SECRET_KEY = os.getenv('SECRET_KEY', 'mi_clave_secreta')
    ALGORITHM = os.getenv('ALGORITHM', 'HS256')
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 480))
    
    # App
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    APP_NAME = os.getenv('APP_NAME', 'Sistema Avicola')
    
    # URL de conexión para SQLAlchemy
    @property
    def DATABASE_URL(self):
        return f"mysql+mysqlconnector://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

config = Config()