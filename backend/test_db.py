import mysql.connector
from mysql.connector import Error

# Configuración de la base de datos
config = {
    'host': '212.85.3.6',
    'database': 'u481307435_sistema_av',
    'user': 'u481307435_grupo_n6',
    'password': '1eDD5>o?@V^',
    'port': 3306
}

def test_connection():
    """Prueba la conexión a la base de datos usando solo mysql-connector-python."""
    try:
        print(f"Intentando conectar a {config['host']}:{config['port']}...")
        connection = mysql.connector.connect(**config)

        if connection.is_connected():
            print("Conexión exitosa a la base de datos!")
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION();")
            version = cursor.fetchone()
            print(f"Versión del servidor MySQL: {version[0]}")
            cursor.close()
            connection.close()
            return True

    except Error as e:
        print(f"Error de conexión: {e}")
        return False

if __name__ == "__main__":
    test_connection()