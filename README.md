# CorruMetrics

**Sistema operativo visual para planta industrial de cartón corrugado.**

MVP funcional con datos simulados, listo para extensión a producción.

![Stack](https://img.shields.io/badge/React_19-TypeScript-blue) ![Stack](https://img.shields.io/badge/Express_5-Node.js-green) ![Stack](https://img.shields.io/badge/Tailwind_CSS-shadcn/ui-purple)

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

| Software | Versión mínima | Cómo verificar | Descarga |
|---|---|---|---|
| **Node.js** | 18.0 o superior | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0 o superior (viene con Node) | `npm --version` | Incluido con Node.js |
| **Git** | Cualquier versión reciente | `git --version` | [git-scm.com](https://git-scm.com/) |

> Si al ejecutar los comandos de verificación ves un número de versión, ya lo tienes instalado. Si dice "comando no encontrado", necesitas instalarlo.

---

## Paso a paso para ejecutar el proyecto

### Paso 1 — Clonar el repositorio

Abre una terminal (Command Prompt, PowerShell, o Terminal en Mac/Linux) y ejecuta:

```bash
git clone https://github.com/Saintonyy/CorruMetrics.git
```

Esto descarga todo el código a una carpeta llamada `CorruMetrics`.

### Paso 2 — Entrar al directorio del proyecto

```bash
cd CorruMetrics
```

### Paso 3 — Instalar dependencias

```bash
npm install
```

Esto descarga todas las librerías necesarias (React, Express, Tailwind, etc.). Puede tardar 1-2 minutos dependiendo de tu conexión a internet.

> Verás muchas líneas de texto en la terminal — es normal. Espera hasta que termine y vuelva a aparecer el cursor.

### Paso 4 — Ejecutar en modo desarrollo

```bash
npm run dev
```

Verás un mensaje como:

```
serving on port 5000
```

### Paso 5 — Abrir en el navegador

Abre tu navegador y ve a:

```
http://localhost:5000
```

La aplicación estará corriendo. Inicia sesión con las credenciales demo:

| Campo | Valor |
|---|---|
| Email | `admin@corrumetrics.mx` |
| Contraseña | `admin123` |

---

## Credenciales demo

Hay 4 usuarios disponibles con diferentes roles:

| Nombre | Email | Contraseña | Rol |
|---|---|---|---|
| Admin Sistema | admin@corrumetrics.mx | admin123 | Admin |
| Luis Garcia | luis.g@corrumetrics.mx | admin123 | Gerente |
| Ana Martinez | ana.m@corrumetrics.mx | admin123 | Supervisor |
| Carlos Ramirez | carlos.r@corrumetrics.mx | admin123 | Operador |

---

## Build de producción

Si quieres compilar la versión optimizada para producción:

```bash
# Compilar
npm run build

# Ejecutar servidor de producción
NODE_ENV=production node dist/index.cjs
```

La app estará disponible en `http://localhost:5000`.

---

## Estructura del proyecto

```
CorruMetrics/
├── client/                   # Frontend (React + TypeScript)
│   └── src/
│       ├── pages/            # 8 páginas de la aplicación
│       ├── components/       # Componentes reutilizables + shadcn/ui
│       ├── lib/              # Lógica de negocio, datos mock, auth
│       └── index.css         # Tema visual industrial
├── server/                   # Backend (Express)
│   ├── routes.ts             # API REST
│   └── storage.ts            # Capa de datos (in-memory)
├── shared/
│   └── schema.ts             # Modelo de datos (8 entidades)
├── CHANGELOG.md              # Documentación detallada del desarrollo
├── README.md                 # Este archivo
└── package.json              # Dependencias y scripts
```

---

## Módulos de la aplicación

| Módulo | Ruta | Descripción |
|---|---|---|
| Login | `/login` | Autenticación de usuarios |
| Dashboard | `/app/dashboard` | KPIs, gráficas de eficiencia, resumen de producción |
| Producción | `/app/production` | Tabla de registros, filtros, detalle, nueva captura |
| Paros | `/app/downtime` | Eventos de paro, análisis por causa y línea |
| Personal | `/app/employees` | Directorio de empleados con filtros |
| Reportes | `/app/reports` | Generador de reportes con exportación CSV |
| Configuración | `/app/settings` | Planta, líneas, turnos, metas, usuarios |

---

## Solución de problemas comunes

### "node: command not found"
Node.js no está instalado. Descárgalo de [nodejs.org](https://nodejs.org/) (versión LTS recomendada).

### "npm install" muestra errores
Intenta borrar la carpeta de dependencias y reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install
```

### El puerto 5000 está ocupado
Otro programa está usando ese puerto. Ciérralo o cambia el puerto:
```bash
PORT=3000 npm run dev
```
Luego abre `http://localhost:3000`.

### La página se ve en blanco
Asegúrate de estar en `http://localhost:5000` (no `https`). Revisa la terminal donde ejecutaste `npm run dev` para ver si hay errores.

### "EACCES: permission denied"
En Mac/Linux, puede ser un problema de permisos. Intenta:
```bash
sudo npm install
```

---

## Tecnologías utilizadas

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 3, shadcn/ui, Recharts
- **Backend:** Express 5, Drizzle ORM, Zod
- **Routing:** wouter v3 (hash-based)
- **Estado:** React Context + TanStack Query v5

---

## Notas

- Todos los datos son simulados (30 días de producción realista). No requiere base de datos externa.
- El backend usa almacenamiento en memoria — los datos se reinician al reiniciar el servidor.
- Para documentación detallada del desarrollo, consulta `CHANGELOG.md`.

---

**CorruMetrics © 2026** — Proyecto privado
