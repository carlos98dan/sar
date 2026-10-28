import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { AppShell } from './components/layout/app-shell/app-shell';
import { NAV_ITEMS } from './components/layout/sidebar/navigation';
import { authGuard } from './core/guards/auth.guard';

/** Pantallas ya implementadas. Las rutas del menú sin entrada aquí usan ModulePending. */
const IMPLEMENTED: Record<string, () => Promise<Type<unknown>>> = {
  '': () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  calendario: () => import('./pages/calendar/calendar').then((m) => m.Calendar),
  reservas: () => import('./pages/reservations/reservations').then((m) => m.Reservations),
  recursos: () => import('./pages/resources/resources').then((m) => m.Resources),
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
      ...NAV_ITEMS.map((item) => ({
        path: item.path,
        data: { title: item.label },
        loadComponent: IMPLEMENTED[item.path] ?? loadPending,
      })),
    ],
  },
  { path: '**', redirectTo: '' },
];
