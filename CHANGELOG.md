# CHANGELOG — CorruMetrics v0.1.0 (MVP Prototype)

**Fecha de creación:** 11 de marzo de 2026
**Autor:** Generado con Perplexity Computer
**Estado:** MVP funcional — prototipo interactivo con datos simulados

---

## Resumen

CorruMetrics es un sistema operativo visual para plantas industriales de cartón corrugado. Esta versión MVP implementa un prototipo completamente funcional con:

- 8 páginas interactivas con navegación autenticada
- 30 días de datos simulados realistas (~270 registros de producción, 78 paros, 12 empleados)
- Lógica de negocio completa para cálculo de eficiencia, KPIs, y tendencias
- Backend Express con interfaz de almacenamiento lista para migración a Supabase/PostgreSQL
- Diseño industrial: paleta teal sobre neutros cálidos, tipografía limpia, espaciado generoso

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite 7 |
| UI | Tailwind CSS 3 + shadcn/ui + Radix primitives |
| Gráficas | Recharts |
| Routing | wouter v3 (hash-based) |
| Estado | React Context (auth) + TanStack Query v5 (data fetching) |
| Backend | Express 5 |
| ORM/Schema | Drizzle ORM + Drizzle-Zod |
| Almacenamiento | MemStorage (in-memory, interfaz IStorage para migración) |

---

## Estructura del Proyecto

```
corrumetrics/
├── shared/
│   └── schema.ts              # Modelo de datos: 8 entidades + tipos + validación
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx             # Router principal con auth guards
│       ├── index.css           # Tema industrial (CSS custom properties)
│       ├── main.tsx            # Entry point
│       ├── lib/
│       │   ├── auth-context.tsx   # Autenticación con React Context
│       │   ├── metrics.ts         # Lógica de negocio y cálculos
│       │   ├── mock-data.ts       # Generador de datos simulados (30 días)
│       │   ├── queryClient.ts     # Configuración TanStack Query
│       │   └── utils.ts           # Utilidades (cn, etc.)
│       ├── components/
│       │   ├── app-sidebar.tsx    # Sidebar de navegación principal
│       │   ├── top-header.tsx     # Header con título y planta activa
│       │   ├── kpi-card.tsx       # Componente reutilizable de KPI
│       │   ├── status-badge.tsx   # Badge de estado con color semántico
│       │   ├── PerplexityAttribution.tsx
│       │   └── ui/               # ~40 componentes shadcn/ui
│       └── pages/
│           ├── login.tsx          # Autenticación
│           ├── dashboard.tsx      # Panel principal con KPIs y gráficas
│           ├── production.tsx     # Módulo de producción (tabla + filtros + drawer)
│           ├── production-new.tsx # Formulario de nueva captura
│           ├── downtime.tsx       # Módulo de paros (KPIs + gráficas + tabla)
│           ├── employees.tsx      # Directorio de personal
│           ├── reports.tsx        # Generador de reportes con exportación
│           ├── settings.tsx       # Configuración (5 tabs)
│           └── not-found.tsx      # Página 404
├── server/
│   ├── index.ts               # Entry point del servidor Express
│   ├── routes.ts              # API REST completa
│   ├── storage.ts             # IStorage + MemStorage
│   ├── vite.ts                # Integración Vite dev server
│   └── static.ts              # Servir archivos estáticos en producción
├── package.json
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── drizzle.config.ts
└── CHANGELOG.md               # Este archivo
```

---

## Modelo de Datos (shared/schema.ts)

### Entidades

| Entidad | Campos clave | Descripción |
|---|---|---|
| **Plant** | id, name, location, timezone, currency | Planta industrial |
| **Line** | id, plantId, name, nominalCapacity, idealDailyProduction, isActive | Línea de producción |
| **Shift** | id, plantId, name, startTime, endTime | Turno de trabajo |
| **Employee** | id, plantId, fullName, email, role, lineId?, shiftId?, isActive | Personal operativo |
| **ProductionRecord** | id, plantId, lineId, shiftId, employeeId, productionDate, orderCode, quantityProduced, runtimeMinutes, scrapQuantity, notes | Registro de producción |
| **Downtime** | id, plantId, lineId, shiftId, startTime, endTime, durationMinutes, cause, category, notes, reportedBy | Evento de paro |
| **Goal** | id, plantId, lineId, targetProduction, targetEfficiency, idealTechnical | Meta de producción |
| **AppUser** | id, email, passwordHash, name, role | Usuario del sistema |

### Roles de usuario

- `admin` — Acceso total
- `gerente` — Gestión de planta
- `supervisor` — Supervisión de líneas
- `operador` — Captura de producción

### Clasificación de eficiencia

```
< 80%   → Crítico (rojo)
80-90%  → Bajo (amarillo/naranja)
90-95%  → Estable (verde)
> 95%   → Óptimo (azul/teal)
```

---

## Datos Simulados (mock-data.ts)

- **1 planta:** Planta Monterrey (America/Mexico_City, MXN)
- **4 líneas:** Linea A (500 cap), B (450), C (400), D (350 — inactiva)
- **3 turnos:** Turno 1 (06:00-14:00), Turno 2 (14:00-22:00), Turno 3 (22:00-06:00)
- **12 empleados:** 2 supervisores, 8 operadores, 1 gerente, 1 directora
- **~270 registros de producción:** 16 días × 3 líneas × 3 turnos, con variación realista
- **78 eventos de paro:** 5 categorías (Mecánico, Eléctrico, Cambio de orden, Material, Operacional)
- **4 metas:** Una por línea activa
- **4 usuarios del sistema:** admin, gerente, supervisor, operador

Generador basado en semilla determinista para datos consistentes entre sesiones.

---

## Lógica de Negocio (metrics.ts)

### Funciones principales

| Función | Descripción |
|---|---|
| `calcEfficiency(qty, runtime, capacity)` | Eficiencia = (qty / (runtime × capacity / 480)) × 100 |
| `calcDashboardKPIs(records, downtimes)` | 4 KPIs: eficiencia global, producción total, tiempo muerto, merma |
| `calcTrend(records, days)` | Tendencia porcentual vs periodo anterior |
| `calcDailyEfficiency(records, lines)` | Serie temporal para gráfica de línea |
| `calcProductionByLine(records, lines)` | Producción agregada por línea |
| `calcShiftComparison(records, shifts)` | Promedio de producción por turno |
| `calcLineSummary(records, lines)` | Resumen por línea: registros, producción, merma, eficiencia |
| `calcDowntimeByCause(downtimes)` | Minutos de paro agrupados por categoría |
| `formatDuration(minutes)` | Formato legible: "37h 15m" |
| `formatNumber(n)` | Formato con separador de miles |

### Fórmula de eficiencia

```
Eficiencia = (cantidadProducida / capacidadEsperada) × 100

capacidadEsperada = (runtimeMinutes / 480) × nominalCapacity
```

Donde 480 = minutos en un turno estándar de 8 horas.

---

## Páginas y Módulos

### 1. Login (`/login`)
- Formulario email + contraseña
- Autenticación contra datos mock (contexto React)
- Logo SVG inline de CorruMetrics
- Credenciales demo visibles

### 2. Dashboard (`/app/dashboard`)
- **4 KPI cards:** Eficiencia Global (94.1%), Producción Total (180,618), Tiempo Muerto (37h 15m), Merma (2.4%)
- **Barra de estado:** Clasificación (Estable), tendencia (+1.7%), meta (95%), ideal (100%)
- **Gráfica de línea:** Eficiencia por día (últimos 16 días)
- **Gráfica de barras:** Producción por línea (3 líneas activas)
- **Gráfica de barras:** Comparativa de turnos
- **Tabla resumen:** Últimos registros con línea, turno, orden, operador, cantidad

### 3. Producción (`/app/production`)
- **Filtros:** Línea, turno, búsqueda por orden/operador
- **3 KPI cards:** Total producción, registros, runtime total
- **Tabla completa:** Fecha, línea, turno, orden, operador, cantidad, merma, eficiencia
- **Detail drawer:** Click en fila abre panel lateral con todos los campos del registro
- **Enlace:** "Nueva captura" → formulario de registro
- **Exportar CSV:** Botón funcional

### 4. Nueva Captura (`/app/production/new`)
- **Formulario completo:** Fecha, planta, línea, turno, operador, código de orden, cantidad, runtime, merma, observaciones
- **Selects dinámicos:** Solo líneas activas, solo operadores activos
- **Validación:** Campos requeridos marcados
- **Flujo:** Guardar → notificación éxito → redirect a producción

### 5. Paros / Downtime (`/app/downtime`)
- **3 KPI cards:** Total eventos, tiempo total, promedio por evento
- **Gráfica de pie:** Distribución por categoría de causa
- **Gráfica de barras:** Tiempo muerto por línea
- **Tabla:** Fecha, línea, turno, duración, causa, categoría, reportado por
- **Filtros:** Línea, categoría, búsqueda

### 6. Personal / Employees (`/app/employees`)
- **Tabla completa:** Nombre, email, rol, línea, turno, estado
- **Filtros:** Búsqueda texto, rol, línea, turno
- **Status badges:** Activo (verde), Inactivo (gris)
- **Botón:** "Nuevo empleado" (placeholder)

### 7. Reportes (`/app/reports`)
- **Selector:** Tipo de reporte (Producción, Paros, Personal)
- **Filtros:** Rango de fechas, línea, turno
- **3 KPI resumen:** Varían según tipo de reporte
- **Vista previa:** Tabla con primeros N registros
- **Exportar:** Botón CSV funcional + botón PDF (placeholder)

### 8. Configuración (`/app/settings`)
- **Tab Planta:** Nombre, ubicación, zona horaria, moneda
- **Tab Líneas:** Tabla de líneas con capacidad, producción ideal, estado + "Nueva línea"
- **Tab Turnos:** Tabla de turnos con horarios
- **Tab Metas:** Tabla de metas por línea (producción, eficiencia, ideal técnico)
- **Tab Usuarios:** Tabla de usuarios del sistema con rol y estado + "Nuevo usuario"

---

## API REST (server/routes.ts)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/plants` | Listar plantas |
| GET | `/api/lines` | Listar líneas |
| GET | `/api/shifts` | Listar turnos |
| GET | `/api/employees` | Listar empleados |
| POST | `/api/employees` | Crear empleado |
| GET | `/api/production` | Listar registros de producción |
| POST | `/api/production` | Crear registro |
| GET | `/api/downtimes` | Listar paros |
| POST | `/api/downtimes` | Crear paro |
| GET | `/api/goals` | Listar metas |
| GET | `/api/users` | Listar usuarios del sistema |

---

## Diseño Visual

### Paleta de colores

| Rol | Valor HSL | Uso |
|---|---|---|
| Primary | `184 80% 22%` | Teal industrial — botones, links, acentos |
| Background | `45 20% 96%` | Fondo cálido beige |
| Card | `45 20% 98%` | Superficie de tarjetas |
| Border | `36 8% 80%` | Bordes sutiles |
| Foreground | `36 20% 12%` | Texto principal oscuro |
| Muted | `36 8% 60%` | Texto secundario |

### Colores semánticos (solo cuando comunican estado)

- **Crítico:** `0 72% 51%` (rojo)
- **Bajo:** `30 90% 50%` (naranja)
- **Estable:** `142 64% 36%` (verde)
- **Óptimo:** `184 80% 22%` (teal)

### Principios de diseño

1. **Industrial, no startup** — Sin gradientes, sin efectos decorativos, sin estética fintech
2. **Ejecutivo y limpio** — Alta legibilidad, espaciado generoso, jerarquía clara
3. **Color semántico** — Color solo cuando comunica estado o acción
4. **Tabular nums** — Todos los números con `font-variant-numeric: tabular-nums`
5. **Dark mode ready** — Variables CSS con modo oscuro definido

---

## Credenciales Demo

| Nombre | Email | Contraseña | Rol |
|---|---|---|---|
| Admin Sistema | admin@corrumetrics.mx | admin123 | Admin |
| Luis Garcia | luis.g@corrumetrics.mx | admin123 | Gerente |
| Ana Martinez | ana.m@corrumetrics.mx | admin123 | Supervisor |
| Carlos Ramirez | carlos.r@corrumetrics.mx | admin123 | Operador |

---

## Proceso de Desarrollo

### Fase 1 — Fundación
1. Lectura y análisis del PRD (`PRD_CORRUMETRICS.txt`) y wireframes (`CorruMetrics-Wireframes.txt`)
2. Inicialización del proyecto desde template fullstack (Express + Vite + React)
3. Definición del modelo de datos en `shared/schema.ts` con 8 entidades
4. Generación de datos mock realistas con distribución estadística

### Fase 2 — Lógica de Negocio
5. Implementación de funciones de cálculo de eficiencia y KPIs
6. Creación del tema industrial con paleta teal + neutros cálidos
7. Construcción del sistema de autenticación con React Context

### Fase 3 — Interfaz
8. App shell: sidebar con navegación, header con planta activa
9. Componentes reutilizables: KPI card, status badge
10. Construcción de 8 páginas con funcionalidad completa
11. Integración de Recharts para todas las visualizaciones

### Fase 4 — Backend
12. API REST con Express y validación Zod
13. Interfaz IStorage con implementación MemStorage

### Fase 5 — QA y Deploy
14. Visual QA con Playwright (screenshots de cada página)
15. Corrección de routing (wouter v3 nested routes fix)
16. Corrección de acentos en login
17. Build de producción y deploy

---

## Notas para Extensión a Producción

### Migración de base de datos
La interfaz `IStorage` en `server/storage.ts` define todos los métodos CRUD. Para migrar a PostgreSQL/Supabase:

1. Configurar `DATABASE_URL` en variables de entorno
2. Ejecutar `npx drizzle-kit push` para crear tablas
3. Implementar `DatabaseStorage` que extienda `IStorage`
4. Reemplazar `MemStorage` por `DatabaseStorage` en `server/routes.ts`

### Autenticación real
Reemplazar `auth-context.tsx` con:
- Supabase Auth o Auth0
- JWT tokens con refresh
- Middleware Express para proteger rutas API

### Funcionalidades pendientes
- [ ] Formularios de creación en Settings (líneas, turnos, metas, usuarios)
- [ ] Edición inline de registros existentes
- [ ] Exportación PDF real (actualmente placeholder)
- [ ] Gráficas interactivas con drill-down
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Multi-planta (selector de planta funcional)
- [ ] Roles y permisos granulares en frontend
- [ ] Audit log de cambios
- [ ] Dashboard personalizable por usuario

---

## Comandos

```bash
# Desarrollo
npm install
npm run dev

# Build de producción
npm run build

# Ejecutar en producción
NODE_ENV=production node dist/index.cjs
```

---

## Licencia

Proyecto privado — CorruMetrics © 2026
