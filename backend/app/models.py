class Granja:
    def __init__(self, id=None, nombre=None, ubicacion=None, id_dueno=None):
        self.id = id
        self.nombre = nombre
        self.ubicacion = ubicacion
        self.id_dueno = id_dueno

class Galpon:
    def __init__(self, id=None, nombre=None, capacidad=None, id_granja=None):
        self.id = id
        self.nombre = nombre
        self.capacidad = capacidad
        self.id_granja = id_granja

class Lote:
    def __init__(self, id=None, fecha_ingreso=None, cantidad_aves=None, 
                 proveedor=None, activo=True, id_galpon=None):
        self.id = id
        self.fecha_ingreso = fecha_ingreso
        self.cantidad_aves = cantidad_aves
        self.proveedor = proveedor
        self.activo = activo
        self.id_galpon = id_galpon

class Usuario:
    def __init__(self, id=None, nombre=None, usuario=None, 
                 password_hash=None, perfil=None, id_granja_asignada=None):
        self.id = id
        self.nombre = nombre
        self.usuario = usuario
        self.password_hash = password_hash
        self.perfil = perfil
        self.id_granja_asignada = id_granja_asignada