# Documentación técnica — Nordic Book

Aplicación web de gestión de reservas de recursos (salas, canchas, auditorios, equipos y vehículos) para una organización con varias sedes. Esta documentación describe la arquitectura, los módulos, las convenciones y los puntos de integración con la API.

> **Estado actual:** el frontend funciona con datos de demostración en memoria. No existe backend todavía. Cada servicio tiene comentarios `BACKEND:` que indican la llamada HTTP que debe reemplazar al dato de prueba (ver [Integración con la API](#integración-con-la-api)).

---

## 1. Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Angular 21 (componentes standalone, signals, `@if`/`@for`) |
| Lenguaje | TypeScript ~5.9 |
| Estilos | Tailwind CSS 4 con tokens de diseño en `src/styles.css` |
| Formularios | Reactive Forms (`ReactiveFormsModule`) y signals para estado de UI |
| Estado asíncrono | RxJS 7.8 con `toSignal` (ver `core/utils/view-state.ts`) |
| Pruebas | Vitest 4 mediante `ng test` (jsdom) |
| Formato | Prettier (`.prettierrc`) y EditorConfig (`.editorconfig`) |
| Tipografías | Geist y Hanken Grotesk (Google Fonts) |
| Iconos | Material Symbols Outlined (Google Fonts) |

Zona horaria y formato de la organización: `America/Bogota`, moneda COP, formato de fecha `DD/MM/AAAA`, hora de 24 horas.

---

## 2. Requisitos y comandos

Requisitos: Node.js compatible con Angular 21 y npm 11 (ver `packageManager` en `package.json`).

```bash
npm install        # instalar dependencias
npm start          # servidor de desarrollo en http://localhost:4200
npm run build      # compilación de producción en dist/nordic-book
npm test           # pruebas unitarias con Vitest (ng test)
```

Las pruebas se ejecutan en modo de una sola pasada con `npx ng test --watch=false`.

---

## 3. Estructura del proyecto

```
src/
├── index.html                  Carga de fuentes e iconos; script que aplica el tema antes de pintar
├── styles.css                  Tokens de diseño (@theme), paleta oscura y estilos base
├── main.ts                     Arranque de la aplicación
└── app/
    ├── app.config.ts           Providers globales (HttpClient, Router, errores globales)
    ├── app.routes.ts           Rutas; las pantallas se cargan con import() diferido
    ├── components/
    │   ├── layout/             Shell de la aplicación: app-shell, sidebar, topbar
    │   └── ui/                 Componentes compartidos (ver sección 6)
    ├── core/
    │   ├── api/                Token InjectionToken API_BASE_URL (por defecto '/api/v1')
    │   ├── config/             Parametrización de demostración: reglas, tarifas, permisos, roles, notificaciones
    │   ├── guards/             authGuard
    │   ├── models/             Interfaces del dominio
    │   ├── services/           Servicios HTTP (mock) y stores en memoria
    │   └── utils/              Lógica pura: disponibilidad, reglas, transiciones, tiempo, búsqueda
    └── pages/                  Una carpeta por pantalla (ver sección 5)
```

Archivos de configuración en la raíz: `angular.json`, `tsconfig*.json`, `package.json`, `.prettierrc`, `.editorconfig`, `.postcssrc.json`.

---

## 4. Arquitectura

### 4.1 Rutas y navegación

- **Menú:** `components/layout/sidebar/navigation.ts` define `NAV_GROUPS` y `NAV_ITEMS`. Cada entrada tiene `path`, `label`, `icon` y `group`.
- **Rutas:** `app.routes.ts` genera una ruta por cada `NAV_ITEMS`. El mapa `IMPLEMENTED` asocia cada `path` con su componente diferido. Si una ruta del menú no está en `IMPLEMENTED`, usa `ModulePending` como pantalla provisional.
- **Rutas de detalle:** `reservas/nueva` y `reservas/:id` van antes de la ruta con parámetro.
- **Protección:** todas las rutas de la aplicación van bajo `AppShell` con `canActivate: [authGuard]`. Las rutas `login` y `recuperar-contrasena` son públicas.
- **Ruta comodín:** cualquier ruta desconocida redirige a `''`.

**Para agregar un módulo nuevo:**
1. Agregar la entrada en `NAV_ITEMS`.
2. Crear la página en `pages/<nombre>/` (componente standalone, plantilla y clase separadas).
3. Registrarla en `IMPLEMENTED` con `import()` diferido.

### 4.2 Servicios y datos

Hay dos tipos de servicio:

- **Servicios de dominio** (`*.service.ts`): exponen métodos que devuelven `Observable`. Hoy devuelven datos de demostración con `of(...)`, y el código HTTP real queda comentado con la marca `BACKEND:`.
- **Stores** (`*.store.ts`): guardan el estado de la sesión en signals. Se pierden al recargar la página.

| Clase | Tipo | Contenido |
|---|---|---|
| `ReservationStore` | Store | Cambios sobre reservas de demostración, reservas creadas en sesión e historial de decisiones |
| `OperationsStore` | Store | Bloqueos, incidencias, reglas, tarifas, flujos de aprobación, permisos por rol y reglas de notificación |
| `CatalogStore` | Store | Categorías y tipos de recursos, sedes y ubicaciones |
| `ReservationService` | Servicio | Listado, creación, cambio de estado, reprogramación, historial |
| `ResourceService` | Servicio | Listado de recursos |
| `OrganizationService` | Servicio | Datos de la organización y sedes |
| `UserService` | Servicio | Usuarios y usuario de la sesión |
| `DashboardService` | Servicio | Resumen del Inicio |
| `AuthService` | Servicio | Inicio de sesión, recuperación de contraseña, sesión almacenada |
| `ThemeService` | Servicio | Modo claro u oscuro |

### 4.3 Estados de carga y error

Las pantallas que consumen datos usan `viewStateSignal(observable)` (`core/utils/view-state.ts`). Devuelve un signal con un `ViewState<T>`:

```ts
{ status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T }
```

En la plantilla se resuelve con `@if` sobre `status`, y se muestra `app-state-panel` para carga, error o vacío.

### 4.4 Sesión

- `AuthService.login` guarda el token con expiración. Si "Mantener sesión" está marcado, usa `localStorage`; si no, `sessionStorage`.
- `authGuard` verifica que haya un token no expirado. Si no, redirige a `/login` con `returnUrl`.
- `logout()` borra la sesión de ambos almacenes.
- El inicio de sesión es un mock: devuelve un token de demostración sin validar credenciales.

### 4.5 Reservas: reglas de dominio

Las reglas están separadas en funciones puras en `core/utils/`, con pruebas:

| Archivo | Responsabilidad |
|---|---|
| `availability.ts` | `isValidWindow`, `evaluateWindow`: si una franja está libre o cruzada con reservas |
| `reservation-transitions.ts` | Acciones disponibles por estado (`availableActions`), estado resultante (`targetStatus`), acciones que exigen motivo (`requiresReason`) |
| `rules.ts` | `ruleViolations`: reglas de anticipación y duración que incumple una solicitud |
| `blocks.ts` | `reservationsAffectedBy`: reservas que un bloqueo afecta |
| `time.ts` | Conversión de horas e ISO 8601 con zona horaria `-05:00` |
| `search.ts` | `matchesQuery`: búsqueda sin distinguir mayúsculas |

Estados de reserva: `draft`, `pending`, `adjustments_requested`, `confirmed`, `rejected`, `cancelled`, `in_progress`, `completed`, `no_show`. Las fechas se manejan como ISO 8601 con zona horaria `-05:00`.

### 4.6 Tema visual

- Todos los colores salen de tokens definidos con `@theme` en `styles.css` (por ejemplo `bg-surface-container-lowest`). No se usan colores de la paleta por defecto de Tailwind.
- El modo oscuro redefine esos mismos tokens bajo `:root[data-theme='dark']`.
- `ThemeService` guarda la elección en `localStorage` con la clave `nordic-book-theme`. Si no hay elección, usa `prefers-color-scheme`.
- El script de `index.html` aplica el tema antes de pintar, para evitar un destello claro. Debe usar la misma clave que `ThemeService`.

---

## 5. Módulos

Estado: **Funcional** significa que la pantalla opera sobre los datos de la sesión. **Solo configuración** significa que guarda la configuración pero no la aplica en el resto de la app.

| Grupo | Módulo | Ruta | Página | Estado |
|---|---|---|---|---|
| General | Inicio | `/` | `dashboard` | Funcional |
| General | Calendario | `/calendario` | `calendar` | Funcional |
| General | Disponibilidad | `/disponibilidad` | `availability` | Funcional |
| Reservas | Todas las reservas | `/reservas` | `reservations` | Funcional |
| Reservas | Solicitudes y aprobaciones | `/solicitudes` | `requests` | Funcional |
| Reservas | Detalle y nueva reserva | `/reservas/:id`, `/reservas/nueva` | `reservation-detail`, `reservation-new` | Funcional |
| Recursos | Recursos | `/recursos` | `resources` | Funcional |
| Recursos | Categorías y tipos | `/categorias-tipos` | `categories-types` | Solo configuración |
| Recursos | Sedes y ubicaciones | `/sedes` | `sites-locations` | Solo configuración |
| Operación | Control diario | `/control-diario` | `daily-control` | Funcional |
| Operación | Incidencias | `/incidencias` | `incidents` | Funcional |
| Operación | Bloqueos y cierres | `/bloqueos` | `blocks` | Funcional |
| Administración | Horarios y festivos | `/horarios` | `schedules` | Funcional (datos fijos) |
| Administración | Reglas y políticas | `/reglas` | `rules` | Funcional |
| Administración | Flujos de aprobación | `/flujos-aprobacion` | `approval-flows` | Solo configuración |
| Administración | Tarifas | `/tarifas` | `rates` | Funcional |
| Administración | Organización y parámetros | `/organizacion` | `settings` | Funcional |
| Administración | Usuarios | `/usuarios` | `users` | Funcional |
| Administración | Roles y permisos | `/roles` | `roles` | Solo configuración |
| Administración | Notificaciones | `/notificaciones` | `notifications` | Solo configuración |
| Análisis | Reportes y BI | `/reportes` | `reports` | Funcional |
| Análisis | Auditoría | `/auditoria` | `audit` | Parcial (solo acciones sobre reservas) |

Acceso: `/login` y `/recuperar-contrasena` no requieren sesión.

Páginas de soporte: `module-pending` (pantalla provisional para entradas del menú sin implementar; hoy no se usa porque todas tienen pantalla) y `login`, `forgot-password` bajo `pages/auth/`.

---

## 6. Componentes compartidos

Todos están en `components/ui/`. Las pantallas deben usarlos antes de escribir marcado propio.

| Componente | Selector o directiva | Uso |
|---|---|---|
| `PageHeader` | `app-page-header` | Título, descripción y acciones de cada pantalla |
| `SectionCard` | `app-section-card` | Tarjeta con borde y fondo de superficie. Propiedad `padding`: `lg` (por defecto), `xl` o `none` |
| `TableShell` | `app-table-shell` | Contenedor de tabla con scroll horizontal y pie de resultados |
| `StatePanel` | `app-state-panel` | Estados de carga, vacío, error, pendiente y acceso restringido |
| `Alert` | `app-alert` | Mensajes de éxito o error (`tone`, `icon`, `dense`) |
| `Badge` | `app-badge` | Etiqueta de color (`tone`: `neutral`, `primary`, `success`, `warning`, `danger`) |
| `ActiveBadge` | `app-active-badge` | Activo o inactivo; `activeLabel` e `inactiveLabel` cambian el texto |
| `MetricCard` | `app-metric-card` | Indicador numérico sin navegación |
| `StatCard` | `app-stat-card` | Indicador que navega a otra ruta (usado en Inicio) |
| `ReservationStatusBadge` | `app-reservation-status-badge` | Estado de una reserva con su color |
| `ReservationTable` | `app-reservation-table` | Tabla de reservas reutilizada |
| `SearchInput` | `app-search-input` | Campo de búsqueda con `value` bidireccional |
| `FilterChips` | `app-filter-chips` | Selector de vistas o filtros en forma de chips |
| `FormField` | `app-form-field` | Etiqueta, control proyectado y mensaje de error |
| `Button` | `[appButton]` (directiva) | Estilo de botón: `variant` (`primary`, `outline`, `ghost`) y `block` |

---

## 7. Modelos principales

Ubicados en `core/models/`:

- **`reservation.model.ts`:** `Reservation`, `ReservationStatus`, `ReservationDraft`, `DecisionRecord` (entrada del historial).
- **`resource.model.ts`:** `Resource`, `ResourceAvailability`, `ResourceRef`.
- **`organization.model.ts`:** `Organization`, `Site`.
- **`user.model.ts`:** `User`, `UserRole` (`superadmin`, `organization_admin`, `site_coordinator`, `approver`, `operator`, `user`).
- **`catalog.model.ts`:** `ResourceCategory`, `ResourceType`, `ManagedSite`, `SiteLocation`.
- **`approval-flow.model.ts`:** `ApprovalFlow`, `ApprovalRole`.
- **`permission.model.ts`:** `PermissionId`, `PermissionDef`.
- **`notification.model.ts`:** `NotificationEvent`, `NotificationChannel`, `NotificationRecipient`, `NotificationRule`.
- **`dashboard.model.ts`:** `DashboardSummary`.
- **`common.model.ts`:** `ViewState<T>`.

Las reglas de demostración y los catálogos iniciales están en `core/config/` (`booking-config.ts`, `permissions.ts`, `roles.ts`, `notifications.ts`).

---

## 8. Integración con la API

- `API_BASE_URL` vale `/api/v1` por defecto (`core/api/api.config.ts`). Cambiarlo ahí afecta a todos los servicios.
- Para conectar un servicio: reemplazar el `of(...)` por la llamada `this.http`, dejando el mismo tipo de retorno. Las pantallas no cambian.
- Las siguientes llamadas están anotadas en el código, listas para activarse:

| Método | Ruta | Servicio |
|---|---|---|
| `POST` | `/auth/login` | `AuthService.login` |
| `POST` | `/auth/password-reset` | `AuthService.requestPasswordReset` |
| `GET` | `/organization` | `OrganizationService.getOrganization` |
| `PUT` | `/organization` | `OrganizationService.updateOrganization` |
| `GET` | `/sites` | `OrganizationService.listSites` |
| `GET` | `/reservations/:id` | `ReservationService` (detalle) |
| `POST` | `/reservations` | `ReservationService.create` |
| `PATCH` | `/reservations/:id/status` | `ReservationService.changeStatus` |
| `PATCH` | `/reservations/:id/schedule` | `ReservationService.reschedule` |

Los demás servicios (`resources`, `users`, `dashboard`, `reservations` en listado) tienen su `GET` anotado en el comentario `BACKEND:` del servicio correspondiente.

**Puntos pendientes de backend:**
- Persistir la configuración de categorías, sedes, flujos, permisos, reglas de notificación, tarifas, reglas y política de cancelación (hoy solo viven en la sesión).
- Aplicar permisos del lado del servidor. Hoy la app no restringe acciones según el rol.
- Registrar auditoría de todos los cambios de configuración, no solo de reservas.

---

## 9. Convenciones de código

- **Idioma:** la interfaz, los comentarios de documentación y los mensajes de commit están en español. Los nombres de código están en inglés.
- **Componentes:** standalone, con `templateUrl` separado. Selector con prefijo `app-`. Directivas de botón con prefijo `app`.
- **Estado:** signals (`signal`, `computed`). Formularios con `FormBuilder` y `nonNullable`.
- **Plantillas:** sintaxis de control de flujo (`@if`, `@for` con `track`, `@switch`). `@for` siempre con `track`.
- **Estilos:** solo tokens de `styles.css`. No usar colores de la paleta por defecto de Tailwind ni valores hexadecimales en las plantillas.
- **Tablas:** siempre dentro de `app-table-shell`, con `<caption>` y encabezados `scope="col"`.
- **Formato:** Prettier con `printWidth: 100` y comillas simples. Ejecutar `npx prettier --write <archivos>` sobre los archivos tocados.
- **Commits:** formato `tipo: descripción en español`, por ejemplo `feat: se agrega el módulo de auditoría`.

---

## 10. Pruebas

Ejecución: `npm test`. Estado al cierre de esta documentación: 4 archivos y 25 pruebas, todas en verde.

| Archivo | Cubre |
|---|---|
| `core/utils/availability.spec.ts` | Validación de franjas y detección de reservas que se cruzan |
| `core/utils/reservation-transitions.spec.ts` | Acciones permitidas por estado, estado resultante y exigencia de motivo |
| `core/utils/rules.spec.ts` | Reglas de anticipación y duración, aplicación por categoría y reglas inactivas |
| `app.spec.ts` | Creación del componente raíz |

Las pruebas cubren la lógica pura. No hay pruebas de componentes ni de servicios todavía.

---

## 11. Limitaciones conocidas

- **Datos en memoria.** Todo el estado de los stores se pierde al recargar la página.
- **Datos duplicados.** Las sedes salen de `OrganizationService` y de `CatalogStore`. Las categorías están en `CATEGORY_CONFIG` y en `CatalogStore`. Los festivos están en `HOLIDAYS` y como tipo de bloqueo. Al integrar la API, cada concepto debe tener un solo servicio dueño.
- **Módulos de configuración sin efecto.** Roles y permisos, flujos de aprobación y notificaciones se guardan pero no cambian el comportamiento de la app.
- **Indicadores en dos lugares.** El Inicio (`DashboardService`) y Reportes calculan sus cifras por separado.
- **Auditoría parcial.** Solo registra acciones sobre reservas.
- **Autenticación simulada.** El login acepta cualquier credencial y devuelve un token de demostración.
