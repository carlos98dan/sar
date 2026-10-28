import { Routes } from '@angular/router';

import { AppShell } from './components/layout/app-shell/app-shell';
import { authGuard } from './core/guards/auth.guard';

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
      {
        path: '',
        data: { title: 'Dashboard' },
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'calendario',
        data: { title: 'Calendario' },
        loadComponent: () => import('./pages/calendar/calendar').then((m) => m.Calendar),
      },
      {
        path: 'reservas',
        data: { title: 'Reservas' },
        loadComponent: () => import('./pages/reservations/reservations').then((m) => m.Reservations),
      },
      {
        path: 'recursos',
        data: { title: 'Recursos' },
        loadComponent: () => import('./pages/resources/resources').then((m) => m.Resources),
      },
      {
        path: 'usuarios',
        data: { title: 'Usuarios' },
        loadComponent: () => import('./pages/users/users').then((m) => m.Users),
      },
      {
        path: 'configuracion',
        data: { title: 'Configuración' },
        loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
