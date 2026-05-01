import mysql.connector
from mysql.connector import Error

DB_CONFIG = {
    'host': '212.85.3.6',
    'database': 'u481307435_sistema_av',
    'user': 'u481307435_grupo_n6',
    'password': '1eDD5>o?@V^',
    'port': 3306
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

def test_connection():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION();")
            version = cursor.fetchone()
            print(f"Conexión exitosa a la base de datos!")
            print(f"Versión del servidor MySQL: {version[0]}")
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f"Error de conexión: {e}")
        return False