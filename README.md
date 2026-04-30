## Arquitectura - Sistema (Backend y Frontend)

### SISTEMA AVÍCOLA - ARQUITECTURA

```mermaid
flowchart TB
    subgraph USUARIOS[" USUARIOS FINALES"]
        SUPERVISOR[" SUPERVISOR<br/>(PC/Web)"]
        GRANJERO[" GRANJERO<br/>(PC/Tablet)"]
    end

    subgraph NAVEGADORES[" Navegadores Web"]
        CHROME["Chrome/Edge"]
    end

    subgraph FRONTEND[" FRONTEND - REACT PWA"]
        COMPONENTES[" COMPONENTES<br/>• Login<br/>• Dashboard<br/>• Carga Diaria<br/>• Reportes"]
        SERVICIOS[" SERVICIOS<br/>• api.js<br/>• offlineStorage<br/>• syncService<br/>• notification"]
        HOOKS[" HOOKS<br/>• useAuth.js<br/>• useOffline.js<br/>• useSync.js"]
    end

    subgraph OFFLINE[" ALMACENAMIENTO LOCAL (OFFLINE)"]
        INDEXEDDB[" IndexedDB<br/>• Datos pendientes<br/>• Registros offline"]
        SERVICE_WORKER[" Service Worker<br/>• Cache de recursos<br/>• Intercepta peticiones"]
        SYNC_API[" Background Sync API<br/>• Sincronización automática<br/>• Cuando hay conexión"]
    end

    subgraph BACKEND[" BACKEND - FASTAPI (PYTHON)"]
        ROUTERS[" ROUTERS<br/>• /auth<br/>• /granjas<br/>• /lotes<br/>• /control<br/>• /sanidad<br/>• /reportes<br/>• /sync"]
        SERVICES[" SERVICES<br/>• CalculoAlimento<br/>• AuthService<br/>• LoteService<br/>• ReporteService"]
        MIDDLEWARE[" MIDDLEWARE<br/>• JWT Auth<br/>• CORS<br/>• Rate Limiting"]
    end

    subgraph DATABASE[" BASE DE DATOS - MYSQL (HOSTINGER)"]
        TABLAS[" Tablas<br/>• empresas<br/>• duenos<br/>• granjas<br/>• galpones<br/>• lotes<br/>• control_diario<br/>• sanidad<br/>• pesajes<br/>• fases_consumo<br/>• usuarios<br/>• faltantes"]
    end

    SUPERVISOR --> CHROME
    GRANJERO --> CHROME
    CHROME -->|HTTPS / API| FRONTEND
    
    FRONTEND --> COMPONENTES
    FRONTEND --> SERVICIOS
    FRONTEND --> HOOKS
    
    SERVICIOS --> OFFLINE
    INDEXEDDB --> SERVICE_WORKER
    SERVICE_WORKER --> SYNC_API
    
    FRONTEND -->|API REST JSON<br/>Puerto 8000| BACKEND
    
    ROUTERS --> SERVICES
    SERVICES --> MIDDLEWARE
    
    BACKEND -->|SQLAlchemy ORM<br/>MySQL Connector| DATABASE