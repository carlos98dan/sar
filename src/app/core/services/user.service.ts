import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<User[]> {
    // BACKEND: reemplazar el JSON por la llamada real:
    // return this.http.get<User[]>(`${this.baseUrl}/users`);
    return of<User[]>([
      {
        "id": "usr-01",
        "fullName": "Mariana Ríos",
        "email": "mariana.rios@empresademo.co",
        "role": "organization_admin",
        "department": "Administración",
        "defaultSiteName": "Sede Principal",
        "active": true,
        "lastAccessAt": "2026-10-24T07:42:00-05:00"
      },
      {
        "id": "usr-02",
        "fullName": "Carlos Romero",
        "email": "carlos.romero@empresademo.co",
        "role": "site_coordinator",
        "department": "Operaciones",
        "defaultSiteName": "Sede Deportiva",
        "active": true,
        "lastAccessAt": "2026-10-23T18:10:00-05:00"
      },
      {
        "id": "usr-03",
        "fullName": "David Vega",
        "email": "david.vega@empresademo.co",
        "role": "approver",
        "department": "Dirección Comercial",
        "defaultSiteName": "Sede Principal",
        "active": true,
        "lastAccessAt": "2026-10-24T08:05:00-05:00"
      },
      {
        "id": "usr-04",
        "fullName": "Elena Morales",
        "email": "elena.morales@empresademo.co",
        "role": "operator",
        "department": "Talento Humano",
        "defaultSiteName": "Centro de Capacitación",
        "active": true,
        "lastAccessAt": "2026-10-24T06:55:00-05:00"
      },
      {
        "id": "usr-05",
        "fullName": "Andrés Castillo",
        "email": "andres.castillo@empresademo.co",
        "role": "user",
        "department": "Mercadeo",
        "defaultSiteName": "Sede Principal",
        "active": true,
        "lastAccessAt": "2026-10-23T17:30:00-05:00"
      },
      {
        "id": "usr-06",
        "fullName": "Sofía Herrera",
        "email": "sofia.herrera@empresademo.co",
        "role": "user",
        "department": "Diseño",
        "defaultSiteName": "Sede Principal",
        "active": false,
        "lastAccessAt": null
      }
    ]);
  }
}
