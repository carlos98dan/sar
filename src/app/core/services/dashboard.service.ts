import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getSummary(): Observable<DashboardSummary> {
    // BACKEND: reemplazar el JSON por la llamada real:
    // return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
    return of<DashboardSummary>({
      "today": { "reservations": 9, "pendingApproval": 2, "confirmed": 5, "cancelled": 1 },
      "resources": { "occupied": 2, "available": 4, "occupancyRate": 0.42 },
      "upcoming": [
        {
          "id": "rsv-10414",
          "code": "RSV-10414",
          "title": "Comité ejecutivo mensual",
          "resource": { "id": "res-junta-ejecutiva", "name": "Sala de juntas ejecutiva" },
          "requester": { "id": "usr-03", "name": "David Vega", "department": "Dirección Comercial" },
          "attendees": 12,
          "startsAt": "2026-10-24T14:00:00-05:00",
          "endsAt": "2026-10-24T15:30:00-05:00",
          "status": "confirmed",
          "createdAt": "2026-10-15T10:00:00-05:00"
        },
        {
          "id": "rsv-10415",
          "code": "RSV-10415",
          "title": "Torneo inter-áreas",
          "resource": { "id": "res-cancha-futbol5", "name": "Cancha de fútbol 5" },
          "requester": { "id": "usr-02", "name": "Carlos Romero", "department": "Operaciones" },
          "attendees": 14,
          "startsAt": "2026-10-24T16:30:00-05:00",
          "endsAt": "2026-10-24T18:00:00-05:00",
          "status": "confirmed",
          "createdAt": "2026-10-18T14:22:00-05:00"
        },
        {
          "id": "rsv-10416",
          "code": "RSV-10416",
          "title": "Lanzamiento de producto",
          "resource": { "id": "res-auditorio", "name": "Auditorio principal" },
          "requester": { "id": "usr-01", "name": "Mariana Ríos", "department": "Administración" },
          "attendees": 150,
          "startsAt": "2026-10-24T16:30:00-05:00",
          "endsAt": "2026-10-24T18:00:00-05:00",
          "status": "pending",
          "createdAt": "2026-10-22T08:30:00-05:00"
        }
      ]
    });
  }
}
