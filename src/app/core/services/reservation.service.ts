import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, map, of, switchMap, take, throwError } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import {
  DecisionRecord,
  Reservation,
  ReservationDraft,
  ReservationStatus,
} from '../models/reservation.model';
import { findConflict } from '../utils/availability';
import { ReservationStore } from './reservation-store';

/** Se lanza al crear una reserva que se cruza con otra activa del mismo recurso. */
export class ReservationConflictError extends Error {
  constructor(readonly conflict: Reservation) {
    super(`La reserva se cruza con ${conflict.code}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly store = inject(ReservationStore);

  list(): Observable<Reservation[]> {
    return this.fetchAll().pipe(map((reservations) => this.store.apply(reservations)));
  }

  /** Cambia el estado de una reserva y registra la acción en el historial. */
  changeStatus(
    reservation: Reservation,
    status: ReservationStatus,
    action: string,
    actorName: string,
    comment = '',
  ): Observable<void> {
    // BACKEND: return this.http.patch<void>(`${this.baseUrl}/reservations/${reservation.id}/status`, { status, comment });
    return defer(() => {
      this.store.update(reservation.id, { status });
      this.store.record(this.decision(reservation, action, status, actorName, comment));
      return of(undefined);
    });
  }

  /** Cambia las fechas de una reserva. El llamador valida la disponibilidad antes. */
  reschedule(reservation: Reservation, startsAt: string, endsAt: string, actorName: string): Observable<void> {
    // BACKEND: return this.http.patch<void>(`${this.baseUrl}/reservations/${reservation.id}/schedule`, { startsAt, endsAt });
    return defer(() => {
      this.store.update(reservation.id, { startsAt, endsAt });
      const comment = `Nuevo horario: ${startsAt.slice(0, 10)} ${startsAt.slice(11, 16)} – ${endsAt.slice(11, 16)}`;
      this.store.record(this.decision(reservation, 'Reprogramada', reservation.status, actorName, comment));
      return of(undefined);
    });
  }

  /** Crea una reserva. Revalida la disponibilidad y falla con `ReservationConflictError` si se cruza con otra. */
  create(draft: ReservationDraft, actorName: string): Observable<Reservation> {
    // BACKEND: return this.http.post<Reservation>(`${this.baseUrl}/reservations`, draft);
    return this.list().pipe(
      take(1),
      switchMap((existing) => {
        const candidate: Reservation = { ...draft, id: 'nueva', code: '', createdAt: '' };
        const conflict = findConflict(candidate, existing);
        if (conflict) {
          return throwError(() => new ReservationConflictError(conflict));
        }

        const stamp = Date.now();
        const reservation: Reservation = {
          ...candidate,
          id: `rsv-${stamp}`,
          code: `RSV-${String(stamp).slice(-5)}`,
          createdAt: new Date(stamp).toISOString(),
        };
        this.store.add(reservation);
        this.store.record(this.decision(reservation, 'Solicitud creada', reservation.status, actorName, ''));
        return of(reservation);
      }),
    );
  }

  /** Historial de acciones, opcionalmente filtrado por reserva. */
  history(reservationId?: string): Observable<DecisionRecord[]> {
    return defer(() =>
      of(this.store.history().filter((item) => !reservationId || item.reservationId === reservationId)),
    );
  }

  private decision(
    reservation: Reservation,
    action: string,
    status: ReservationStatus,
    actorName: string,
    comment: string,
  ): DecisionRecord {
    return {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reservationId: reservation.id,
      reservationCode: reservation.code,
      action,
      status,
      actorName,
      comment,
      at: new Date().toISOString(),
    };
  }


  private fetchAll(): Observable<Reservation[]> {
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
    return this.list().pipe(
      map((reservations) => {
        const reservation = reservations.find((item) => item.id === id);
        if (!reservation) {
          throw new Error(`Reserva ${id} no encontrada`);
        }
        return reservation;
      }),
    );
  }
}
