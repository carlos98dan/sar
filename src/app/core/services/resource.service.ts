import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { Resource } from '../models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<Resource[]> {
    // BACKEND: reemplazar el JSON por la llamada real:
    // return this.http.get<Resource[]>(`${this.baseUrl}/resources`);
    return of<Resource[]>([
      {
        "id": "res-sala-101",
        "code": "SR-101",
        "name": "Sala de reuniones 101",
        "category": "Salas de reuniones",
        "siteId": "site-principal",
        "siteName": "Sede Principal",
        "location": "Piso 1, zona A",
        "capacity": 12,
        "availability": "available",
        "nextReservationAt": "2026-10-24T15:00:00-05:00"
      },
      {
        "id": "res-junta-ejecutiva",
        "code": "SJ-EJE",
        "name": "Sala de juntas ejecutiva",
        "category": "Salas de reuniones",
        "siteId": "site-principal",
        "siteName": "Sede Principal",
        "location": "Piso 4, zona directiva",
        "capacity": 16,
        "availability": "occupied",
        "nextReservationAt": "2026-10-24T14:00:00-05:00"
      },
      {
        "id": "res-auditorio",
        "code": "AU-PRI",
        "name": "Auditorio principal",
        "category": "Auditorios y eventos",
        "siteId": "site-capacitacion",
        "siteName": "Centro de Capacitación",
        "location": "Bloque B, primer nivel",
        "capacity": 180,
        "availability": "available",
        "nextReservationAt": "2026-10-24T08:00:00-05:00"
      },
      {
        "id": "res-cancha-futbol5",
        "code": "CF5-N",
        "name": "Cancha de fútbol 5",
        "category": "Canchas deportivas",
        "siteId": "site-deportiva",
        "siteName": "Sede Deportiva",
        "location": "Cancha norte, exterior",
        "capacity": 14,
        "availability": "available",
        "nextReservationAt": "2026-10-24T16:30:00-05:00"
      },
      {
        "id": "res-cancha-tenis",
        "code": "CT-01",
        "name": "Cancha de tenis",
        "category": "Canchas deportivas",
        "siteId": "site-deportiva",
        "siteName": "Sede Deportiva",
        "location": "Zona sur, exterior",
        "capacity": 4,
        "availability": "maintenance",
        "nextReservationAt": null
      },
      {
        "id": "res-proyector",
        "code": "EQ-PRJ-03",
        "name": "Proyector portátil",
        "category": "Equipos audiovisuales",
        "siteId": "site-principal",
        "siteName": "Sede Principal",
        "location": "Bodega de equipos, piso 2",
        "capacity": 1,
        "availability": "available",
        "nextReservationAt": "2026-10-24T09:00:00-05:00"
      },
      {
        "id": "res-vehiculo-adm",
        "code": "VH-ADM-01",
        "name": "Vehículo administrativo",
        "category": "Vehículos",
        "siteId": "site-principal",
        "siteName": "Sede Principal",
        "location": "Parqueadero subterráneo",
        "capacity": 4,
        "availability": "out_of_service",
        "nextReservationAt": null
      }
    ]);
  }
}
