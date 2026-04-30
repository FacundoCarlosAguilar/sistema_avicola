# Diagrama - Sistema de Gestión Avícola

## Índice de arquitectura:
1. [Flujo de Trabajo del Granjero (Offline)](#flujo-de-trabajo-del-granjero-offline)
2. [Arquitectura General](#arquitectura-general)
3. [Base de Datos](#base-de-datos)
4. [Sincronización](#sincronización)
5. [Despliegue](#despliegue)

---

## Flujo de Trabajo del Granjero (Offline)

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE TRABAJO DEL GRANJERO (OFFLINE)                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                   ╔═══════════════╗
                                   ║   GRANJERO    ║
                                   ║   Abre web    ║
                                   ╚═══════════════╝
                                           │
                                           ▼
                               ╔═══════════════════════╗
                               ║   Prueba de conexión  ║
                               ╚═══════════════════════╝
                                           │
                 ┌─────────────────────────┴────────────────────────┐
                 │                                                  │
                 ▼                                                  ▼
         ╔═════════════════╗                               ╔═════════════════╗
         ║      SÍ         ║                               ║      NO         ║
         ║  Modo Online    ║                               ║  Modo Offline   ║
         ╚═════════════════╝                               ╚═════════════════╝
                 │                                                  │
                 ▼                                                  ▼
         ╔═════════════════╗                           ╔═════════════════════════╗
         ║  Carga datos    ║                           ║      Notificación       ║
         ║  normalmente    ║                           ║  "Trabajando offline"   ║
         ╚═════════════════╝                           ╚═════════════════════════╝
                 │                                                  │
                 ▼                                                  ▼
         ╔═════════════════╗                           ╔═════════════════════════╗
         ║  Guardar en     ║                           ║  Guardar en IndexedDB   ║
         ║  MySQL directo  ║                           ║    (local navegador)    ║
         ╚═════════════════╝                           ╚═════════════════════════╝
                    │                                               │
                    │                                               │
                    └──────────────────────┬────────────────────────┘
                                           │
                                           ▼
                               ╔═══════════════════════╗
                               ║    Cambió conexión    ║
                               ║  (Recuperá internet)  ║
                               ╚═══════════════════════╝
                                           │
                                           ▼
                      ╔═════════════════════════════════════════╗
                      ║  SINCRONIZACIÓN AUTOMÁTICA              ║
                      ║  Service Worker detecta y envía datos   ║
                      ║                                         ║
                      ║  Datos pendientes: 5 registros          ║
                      ║  ████████████████████ 100%              ║
                      ║                                         ║
                      ║  Sincronización completada              ║
                      ╚═════════════════════════════════════════╝
                                           │
                                           ▼
                                ╔═══════════════════════╗
                                ║  SUPERVISOR ve        ║
                                ║  los datos en tiempo  ║
                                ║  real desde su PC     ║
                                ╚═══════════════════════╝
