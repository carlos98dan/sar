import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { Organization, Site } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getOrganization(): Observable<Organization> {
    // BACKEND: reemplazar el JSON por la llamada real:
    // return this.http.get<Organization>(`${this.baseUrl}/organization`);
    return of<Organization>({
      "id": "org-demo-co",
      "name": "Empresa Demo Colombia",
      "taxId": "900.123.456-7",
      "timezone": "America/Bogota",
      "currency": "COP",
      "dateFormat": "DD/MM/AAAA",
      "timeFormat": "24h"
    });
  }

  updateOrganization(payload: Organization): Observable<Organization> {
    // BACKEND: return this.http.put<Organization>(`${this.baseUrl}/organization`, payload);
    return of<Organization>(payload);
  }

  listSites(): Observable<Site[]> {
    // BACKEND: return this.http.get<Site[]>(`${this.baseUrl}/sites`);
    return of<Site[]>([
      { "id": "site-principal", "name": "Sede Principal", "address": "Carrera 7 # 71-21", "city": "Bogotá" },
      { "id": "site-deportiva", "name": "Sede Deportiva", "address": "Calle 127 # 45-10", "city": "Bogotá" },
      { "id": "site-capacitacion", "name": "Centro de Capacitación", "address": "Avenida El Dorado # 68-98", "city": "Bogotá" }
    ]);
  }
}
