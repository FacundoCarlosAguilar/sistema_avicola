# Sistema de Gestión Avícola

## Recursos a descargar:
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18.x-cyan)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Descripción
Sistema integral para control de producción avícola que permite registrar mortandad, calcular alimento automáticamente por edad del lote, gestionar trazabilidad sanitaria y generar reportes comparativos. Arquitectura web con capacidad offline que sincroniza datos automáticamente al recuperar conexión.

## Requisitos Previos

### 1. Python 3.11 o superior
- **Descarga:** [python.org/downloads](https://python.org/downloads)
- **Importante:** Marcar "Add Python to PATH" durante la instalación
- **Verificar:** Abrir terminal y ejecutar `python --version`

### 2. Node.js 18 o superior
- **Descarga:** [nodejs.org](https://nodejs.org)
- **Versión recomendada:** LTS (Long Term Support)
- **Verificar:** Ejecutar `node --version` y `npm --version`

### 3. MySQL (local)
- **Descarga:** [mysql.com/downloads](https://mysql.com/downloads)
- **Alternativa:** Usar Hostinger (producción)
- **Para pruebas locales:** Usar XAMPP o MySQL Workbench

### 5. Visual Studio Code (editor)
- **Descarga:** [code.visualstudio.com](https://code.visualstudio.com)
- **Extensiones recomendadas:**
  - Python (Microsoft)
  - Pylance
  - ESLint
  - Prettier
  - Thunder Client (para probar API)

---

## Instalación del Proyecto

### Paso 1: Clonar o descargar el repositorio
```bash

# Con Git
git clone https://github.com/FacundoCarlosAguilar/sistema_avicola.git
cd sistema_avicola

```
## Paso 2: Abrir en Visual Studio Code
```bash

# Windows
# Desde la terminal en la carpeta del proyecto
code .

```
## Paso 3: Configurar Backend (Python/FastAPI)
```bash

# Visual Studio Code
# Entrar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env

# Ejecutar el servidor backend
uvicorn app.main:app --reload --port 8000

```

## Paso 4: Configurar Frontend (React)
```bash

# Abrir una NUEVA terminal (mantener backend corriendo)
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar el servidor frontend
npm start

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
