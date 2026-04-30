# Sistema de Gestión Avícola

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18.x-cyan)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Descripción

Sistema integral para control de producción avícola que permite registrar mortandad, calcular alimento automáticamente por edad del lote, gestionar trazabilidad sanitaria y generar reportes comparativos. Arquitectura web con capacidad offline que sincroniza datos automáticamente al recuperar conexión.

---

## Requisitos Previos

| Software    | Versión   | Descarga                                               | Verificación       |
|-------------|-----------|--------------------------------------------------------|--------------------|
| **Python**  | 3.11+     | [python.org](https://python.org/downloads)             | `python --version` |
| **Node.js** | 18+ (LTS) | [nodejs.org](https://nodejs.org)                       | `node --version`   |
| **Git**     | Última    | [git-scm.com](https://git-scm.com)                     | `git --version`    |
| **VS Code** | Última    | [code.visualstudio.com](https://code.visualstudio.com) |                    |

> **Importante Python:** Marcar "Add Python to PATH" durante la instalación.

### Extensiones de Visual Studio Code

- Python (Microsoft)
- Pylance
- ESLint
- Prettier
- Thunder Client (API)

---

## Estructura de Archivos

backend/app/
├── models.py          # Modelos SQLAlchemy
├── schemas.py         # Esquemas Pydantic
├── database.py        # Conexión a base de datos
├── routers/
│   ├── auth.py        # Login/registro
│   ├── granjas.py     # CRUD granjas
│   ├── galpones.py    # CRUD galpones
│   ├── lotes.py       # CRUD lotes
│   └── control.py     # Mortandad y alimento
└── services/
    └── calculo_alimento.py

frontend/src/
├── App.jsx           # Rutas principales
├── main.jsx          # Punto de entrada
├── components/
│   ├── Login.jsx     # Login de usuarios
│   ├── DashboardSupervisor.jsx  # Dashboard de supervisor
│   └── DashboardGranjero.jsx    # Dashboard de granjero
├── services/
│   ├── api.js        # Axios config
│   └── auth.js       # Auth service
└── context/
    └── AuthContext.jsx

---

## Instalación del Proyecto

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/FacundoCarlosAguilar/sistema_avicola.git
cd sistema_avicola

```
## Paso 2: Abrir en Visual Studio Code
```bash

# Desde la terminal en la carpeta del proyecto
code .

```
## Paso 3: Configurar Backend (Python/FastAPI)
```bash

# Visual Studio Code
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# En caso de error al activar, ejecutar:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# Ejecutar el servidor backend
uvicorn app.main:app --reload --port 8000

```

## Paso 4: Configurar Frontend (React)
```bash

# Abrir una NUEVA terminal (mantener backend corriendo)
cd frontend

# Instalar dependencias
npm install

# Ejecutar el servidor frontend
npm run dev

```

## Paso 5: Configurar Base de Datos (USO LOCAL)
```bash

## Descargar XAMPP o MySQL Server
Iniciar MySQL (XAMPP o servicio local)

## Creación de base de datos local
Crear base de datos: CREATE DATABASE sistema_avicola;

## Actualizar el archivo .env con usuario y contraseña local
Configurar .env con usuario root y contraseña vacía

```

## Accesos a la API
```bash

## Endpoints para accesos a la API
Frontend: http://localhost:5173
Backend: http://localhost:8000
Documentación: http://localhost:8000/docs

```