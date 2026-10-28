import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { Reservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<Reservation[]> {
    // BACKEND: reemplazar el JSON por la llamada real:
    // return this.http.get<Reservation[]>(`${this.baseUrl}/reservations`);
    return of<Reservation[]>([
      {
        "id": "rsv-10412",
        "code": "RSV-10412",
        "title": "Revisión de presupuesto Q4",
        "resource": { "id": "res-sala-101", "name": "Sala de reuniones 101" },
        "requester": { "id": "usr-01", "name": "Mariana Ríos", "department": "Administración" },
        "attendees": 8,
        "startsAt": "2026-10-24T08:00:00-05:00",
        "endsAt": "2026-10-24T09:30:00-05:00",
        "status": "completed",
        "createdAt": "2026-10-20T16:12:00-05:00"
      },
      {
        "id": "rsv-10413",
        "code": "RSV-10413",
        "title": "Sprint demo equipo de diseño",
        "resource": { "id": "res-sala-101", "name": "Sala de reuniones 101" },
        "requester": { "id": "usr-05", "name": "Andrés Castillo", "department": "Mercadeo" },
        "attendees": 6,
        "startsAt": "2026-10-24T10:00:00-05:00",
        "endsAt": "2026-10-24T11:30:00-05:00",
        "status": "in_progress",
        "createdAt": "2026-10-21T09:40:00-05:00"
      },
      {
        "id": "rsv-10421",
        "code": "RSV-10421",
        "title": "Reunión con proveedor (conflicto de horario)",
        "resource": { "id": "res-sala-101", "name": "Sala de reuniones 101" },
        "requester": { "id": "usr-02", "name": "Carlos Romero", "department": "Operaciones" },
        "attendees": 4,
        "startsAt": "2026-10-24T10:30:00-05:00",
        "endsAt": "2026-10-24T11:00:00-05:00",
        "status": "pending",
        "createdAt": "2026-10-23T11:05:00-05:00"
      },
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
      },
      {
        "id": "rsv-10417",
        "code": "RSV-10417",
        "title": "Capacitación de inducción",
        "resource": { "id": "res-auditorio", "name": "Auditorio principal" },
        "requester": { "id": "usr-04", "name": "Elena Morales", "department": "Talento Humano" },
        "attendees": 80,
        "startsAt": "2026-10-24T08:00:00-05:00",
        "endsAt": "2026-10-24T12:00:00-05:00",
        "status": "adjustments_requested",
        "createdAt": "2026-10-22T15:10:00-05:00"
      },
      {
        "id": "rsv-10418",
        "code": "RSV-10418",
        "title": "Práctica de tenis",
        "resource": { "id": "res-cancha-tenis", "name": "Cancha de tenis" },
        "requester": { "id": "usr-02", "name": "Carlos Romero", "department": "Operaciones" },
        "attendees": 4,
        "startsAt": "2026-10-24T07:00:00-05:00",
        "endsAt": "2026-10-24T08:00:00-05:00",
        "status": "cancelled",
        "createdAt": "2026-10-19T12:00:00-05:00"
      },
      {
        "id": "rsv-10419",
        "code": "RSV-10419",
        "title": "Demo de equipo audiovisual",
        "resource": { "id": "res-proyector", "name": "Proyector portátil" },
        "requester": { "id": "usr-05", "name": "Andrés Castillo", "department": "Mercadeo" },
        "attendees": 1,
        "startsAt": "2026-10-24T09:00:00-05:00",
        "endsAt": "2026-10-24T12:00:00-05:00",
        "status": "confirmed",
        "createdAt": "2026-10-23T17:45:00-05:00"
      },
      {
        "id": "rsv-10420",
        "code": "RSV-10420",
        "title": "Entrevista técnica",
        "resource": { "id": "res-sala-101", "name": "Sala de reuniones 101" },
        "requester": { "id": "usr-03", "name": "David Vega", "department": "Dirección Comercial" },
        "attendees": 3,
        "startsAt": "2026-10-24T15:00:00-05:00",
        "endsAt": "2026-10-24T16:00:00-05:00",
        "status": "confirmed",
        "createdAt": "2026-10-23T09:00:00-05:00"
      }
    ]);
  }

  getById(id: string): Observable<Reservation> {
    // BACKEND: return this.http.get<Reservation>(`${this.baseUrl}/reservations/${id}`);
    return of<Reservation>({
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
    });
  }
}
