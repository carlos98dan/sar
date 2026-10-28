import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { AppShell } from './components/layout/app-shell/app-shell';
import { NAV_ITEMS } from './components/layout/sidebar/navigation';
import { authGuard } from './core/guards/auth.guard';

/** Pantallas ya implementadas. Las rutas del menú sin entrada aquí usan ModulePending. */
const IMPLEMENTED: Record<string, () => Promise<Type<unknown>>> = {
  '': () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  calendario: () => import('./pages/calendar/calendar').then((m) => m.Calendar),
  disponibilidad: () => import('./pages/availability/availability').then((m) => m.Availability),
  reservas: () => import('./pages/reservations/reservations').then((m) => m.Reservations),
  solicitudes: () => import('./pages/requests/requests').then((m) => m.Requests),
  recursos: () => import('./pages/resources/resources').then((m) => m.Resources),
  'control-diario': () => import('./pages/daily-control/daily-control').then((m) => m.DailyControl),
  incidencias: () => import('./pages/incidents/incidents').then((m) => m.Incidents),
  bloqueos: () => import('./pages/blocks/blocks').then((m) => m.Blocks),
  horarios: () => import('./pages/schedules/schedules').then((m) => m.Schedules),
  reglas: () => import('./pages/rules/rules').then((m) => m.Rules),
  tarifas: () => import('./pages/rates/rates').then((m) => m.Rates),
  organizacion: () => import('./pages/settings/settings').then((m) => m.Settings),
  usuarios: () => import('./pages/users/users').then((m) => m.Users),
};

const loadPending = () => import('./pages/module-pending/module-pending').then((m) => m.ModulePending);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      // Rutas de detalle y de creación; deben ir antes de la ruta con parámetro.
      {
        path: 'reservas/nueva',
        data: { title: 'Nueva reserva' },
        loadComponent: () => import('./pages/reservation-new/reservation-new').then((m) => m.ReservationNew),
      },
      {
        path: 'reservas/:id',
        data: { title: 'Detalle de reserva' },
        loadComponent: () => import('./pages/reservation-detail/reservation-detail').then((m) => m.ReservationDetail),
      },
      ...NAV_ITEMS.map((item) => ({
        path: item.path,
        data: { title: item.label },
        loadComponent: IMPLEMENTED[item.path] ?? loadPending,
      })),
    ],
  },
  { path: '**', redirectTo: '' },
];
