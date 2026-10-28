import { InjectionToken } from '@angular/core';

/**
 * Base de la API REST. Cambiar aquí cuando exista el backend real.
 * Mientras no exista, los servicios devuelven JSON literal (ver cada servicio).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/v1',
});
