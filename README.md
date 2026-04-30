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

## Características Principales
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
| Módulo                     | Descripción                                                         │
|----------------------------|---------------------------------------------------------------------│
| **Control Diario**         | Registro de mortandad por galpón con cálculo automático de alimento │
| **Trazabilidad Sanitaria** | Registro de vacunas, medicación y pesaje semanal                    │
| **Gestión de Roles**       | Supervisor (acceso total) y Granjero (carga limitada)               │
| **Sincronización Offline** | Funciona sin internet, sincroniza automáticamente                   │
| **Reportes**               | Evolución de lotes y comparación entre lotes pasados/actuales       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

## Arquitectura - Sistema (Backend y Frontend)
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               SISTEMA AVÍCOLA - ARQUITECTURA                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                ┌─────────────────────────┐
                                │   USUARIOS FINALES      │
                                └─────────────────────────┘
                                            │
                  ┌─────────────────────────┼─────────────────────────┐
                  │                                                   │
                  ▼                                                   ▼
            ┌───────────────┐                                 ┌───────────────┐        
            │   SUPERVISOR  │                                 │    GRANJERO   │        
            │   (PC/Web)    │                                 │   (PC/Web)    │        
            └───────┬───────┘                                 └───────┬───────┘        
                    │                                                 │
                    │      Navegador Web            Navegador Web     │
                    │      (Chrome/Edge)            (Chrome/Edge)     │
                    └────────────────────────┼────────────────────────┘
                                             │
                                             │ HTTPS / API
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND - REACT PWA                                        │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│           ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │
│           │   COMPONENTES   │    │    SERVICIOS    │    │     HOOKS       │                   │
│           │   React JSX     │    │                 │    │                 │                   │
│           ├─────────────────┤    ├─────────────────┤    ├─────────────────┤                   │
│           │ • Login         │    │ • api.js        │    │ • useAuth.js    │                   │
│           │ • Dashboard     │    │ • offlineStorage│    │ • useOffline.js │                   │
│           │ • Carga Diaria  │    │ • syncService   │    │ • useSync.js    │                   │
│           │ • Reportes      │    │ • notification  │    │                 │                   │
│           └─────────────────┘    └─────────────────┘    └─────────────────┘                   │
│                                                                                               │
│      ┌─────────────────────────────────────────────────────────────────────────────┐          │
│      │                         ALMACENAMIENTO LOCAL (OFFLINE)                      │          │
│      ├─────────────────────────────────────────────────────────────────────────────┤          │
│      │                                                                             │          │
│      │   ┌───────────────┐    ┌───────────────┐    ┌───────────────────────────┐   │          │
│      │   │   IndexedDB   │    │ Service Worker│    │   Background Sync API     │   │          │
│      │   │               │    │               │    │                           │   │          │
│      │   │ • Datos       │    │ • Cache de    │    │ • Sincronización          │   │          │
│      │   │   pendientes  │    │   recursos    │    │   automática              │   │          │
│      │   │ • Registros   │    │ • Intercepta  │    │ • Cuando hay              │   │          │
│      │   │   offline     │    │   peticiones  │    │   conexión                │   │          │
│      │   └───────────────┘    └───────────────┘    └───────────────────────────┘   │          │
│      │                                                                             │          │
│      └─────────────────────────────────────────────────────────────────────────────┘          │
│                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ API REST (JSON)
                                             │ HTTPS - Puerto 8000
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND - FASTAPI (PYTHON)                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌────────────────────────────────────────────────────────────────────────────────┐          │
│   │                                ROUTERS (ENDPOINTS)                             │          │
│   ├───────────────┬───────────────┬───────────────┬────────────────────────────────┤          │
│   │ /auth         │ /granjas      │ /lotes        │ /control                       │          │
│   │ • login       │ • listar      │ • crear       │ • registrar mortandad          │          │
│   │ • register    │ • crear       │ • editar      │ • calcular alimento            │          │
│   │ • logout      │ • eliminar    │ • historial   │ • listar controles             │          │
│   ├───────────────┼───────────────┼───────────────┼────────────────────────────────┤          │
│   │ /sanidad      │ /reportes     │ /sync         │ /usuarios                      │          │
│   │ • registrar   │ • evolucion   │ • sincronizar │ • listar                       │          │
│   │ • vacunas     │ • comparativa │ • pendientes  │ • asignar rol                  │          │
│   │ • medicacion  │ • exportar    │ • estado      │                                │          │
│   └───────────────┴───────────────┴───────────────┴────────────────────────────────┘          │    
│                                                                                               │
│   ┌────────────────────────────────────────────────────────────────────────────────┐          │
│   │                           SERVICES (LÓGICA DE NEGOCIO)                         │          │
│   ├───────────────┬───────────────┬───────────────┬────────────────────────────────┤          │
│   │               │               │               │                                │          │
│   │CalculoAlimento│ AuthService   │  LoteService  │  ReporteService                │          │
│   │               │               │               │                                │          │
│   │ • calcular()  │ • login()     │ • crear()     │ • generar()                    │          │
│   │ • fases()     │ • verify()    │ • estado()    │ • comparar()                   │          │
│   │ • consumo()   │ • token()     │ • historial() │ • exportar()                   │          │
│   │               │               │               │                                │          │
│   └───────────────┴───────────────┴───────────────┴────────────────────────────────┘          │
│                                                                                               │
│   ┌────────────────────────────────────────────────────────────────────────────────┐          │
│   │                                 MIDDLEWARE                                     │          │
│   ├────────────────────────────────────────────────────────────────────────────────┤          │
│   │ • Autenticación (JWT)    • CORS (Cross-Origin)   • Rate Limiting               │          │
│   │ • Logging                • Compresión            • Timeout                     │          │
│   └────────────────────────────────────────────────────────────────────────────────┘          │
│                                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             │ SQLAlchemy ORM
                                             │ MySQL Connector
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                            BASE DE DATOS - MYSQL (HOSTINGER)                          │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│   │   empresas    │    │    duenos     │    │   granjas     │    │   galpones    │    │
│   ├───────────────┤    ├───────────────┤    ├───────────────┤    ├───────────────┤    │
│   │ id            │    │ id            │    │ id            │    │ id            │    │
│   │ nombre        │    │ nombre        │    │ nombre        │    │ nombre        │    │
│   │ ruc           │    │ telefono      │    │ ubicacion     │    │ capacidad     │    │
│   │ activo        │    │ email         │    │ id_dueno ─────┼────┤ id_granja ────|    |
│   └───────────────┘    └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                                       │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│   │    lotes      │    │control_diario │    │   sanidad     │    │   pesajes     │    │
│   ├───────────────┤    ├───────────────┤    ├───────────────┤    ├───────────────┤    │
│   │ id            │    │ id            │    │ id            │    │ id            │    │
│   │ fecha_ingreso │    │ fecha         │    │ fecha         │    │ fecha_pesaje  │    │
│   │ cantidad_aves │    │ mortandad     │    │ tipo          │    │ peso_promedio │    │
│   │ proveedor     │    │ aves_vivas    │    │ producto      │    │ muestras      │    │
│   │ activo        │    │ alimento_kg   │    │ dosis         │    │ id_lote ──────┼────┤
│   │ id_galpon ────┼────┤ novedades     │    │ observaciones │    │               │    │
│   └───────────────┘    │ id_lote ──────┼────┤ id_lote ──────┼────┤               │    │
│                        └───────────────┘    └───────────────┘    └───────────────┘    │
│                                                                                       │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐                         │
│   │ fases_consumo │    │   usuarios    │    │   faltantes   │                         │
│   ├───────────────┤    ├───────────────┤    ├───────────────┤                         │
│   │ id            │    │ id            │    │ id            │                         │
│   │ edad_desde    │    │ nombre        │    │ insumo        │                         │
│   │ edad_hasta    │    │ usuario       │    │ cantidad      │                         │
│   │ consumo_gramos│    │ password_hash │    │ fecha         │                         │
│   │ descripcion   │    │ perfil (rol)  │    │ estado        │                         │
│   └───────────────┘    │ id_granja_asig│    │ id_granja ────┼────┐                    │
│                        └───────────────┘    └───────────────┘    │                    │
│                                    │                             │                    │
│                                    │  (si es granjero)           │                    │
│                                    └─────────────────────────────┘                    │
└───────────────────────────────────────────────────────────────────────────────────────┘