import { Injectable, signal } from '@angular/core';

import { ManagedSite, ResourceCategory, ResourceType, SiteLocation } from '../models/catalog.model';
import { upsert } from '../utils/collections';

/**
 * Catálogos de la sesión: categorías y tipos de recursos, sedes y ubicaciones.
 * Los datos iniciales son de demostración y se pierden al recargar.
 * BACKEND: reemplazar por la API de parametrización de la organización.
 */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  readonly categories = signal<ResourceCategory[]>([
    {
      id: 'cat-salas',
      name: 'Salas de reuniones',
      description: 'Salas para reuniones y sesiones de trabajo.',
      active: true,
    },
    {
      id: 'cat-auditorios',
      name: 'Auditorios y eventos',
      description: 'Espacios para eventos y capacitaciones masivas.',
      active: true,
    },
    {
      id: 'cat-canchas',
      name: 'Canchas deportivas',
      description: 'Canchas al aire libre y cubiertas.',
      active: true,
    },
    {
      id: 'cat-equipos',
      name: 'Equipos audiovisuales',
      description: 'Equipos prestables para reuniones y eventos.',
      active: true,
    },
    {
      id: 'cat-vehiculos',
      name: 'Vehículos',
      description: 'Vehículos de la organización.',
      active: false,
    },
  ]);

  readonly types = signal<ResourceType[]>([
    {
      id: 'tipo-sala-pequena',
      categoryId: 'cat-salas',
      name: 'Sala pequeña',
      description: 'Hasta 6 personas.',
      active: true,
    },
    {
      id: 'tipo-sala-juntas',
      categoryId: 'cat-salas',
      name: 'Sala de juntas',
      description: 'Con mesa directiva y videoconferencia.',
      active: true,
    },
    {
      id: 'tipo-futbol5',
      categoryId: 'cat-canchas',
      name: 'Fútbol 5',
      description: '',
      active: true,
    },
    {
      id: 'tipo-tenis',
      categoryId: 'cat-canchas',
      name: 'Tenis',
      description: '',
      active: true,
    },
    {
      id: 'tipo-proyector',
      categoryId: 'cat-equipos',
      name: 'Proyector',
      description: 'Equipos portátiles de proyección.',
      active: true,
    },
  ]);

  readonly sites = signal<ManagedSite[]>([
    {
      id: 'site-principal',
      name: 'Sede Principal',
      address: 'Carrera 7 # 71-21',
      city: 'Bogotá',
      active: true,
    },
    {
      id: 'site-deportiva',
      name: 'Sede Deportiva',
      address: 'Calle 127 # 45-10',
      city: 'Bogotá',
      active: true,
    },
    {
      id: 'site-capacitacion',
      name: 'Centro de Capacitación',
      address: 'Avenida El Dorado # 68-98',
      city: 'Bogotá',
      active: true,
    },
  ]);

  readonly locations = signal<SiteLocation[]>([
    {
      id: 'loc-piso1-a',
      siteId: 'site-principal',
      name: 'Piso 1, zona A',
      description: 'Salas de reuniones del primer piso.',
      active: true,
    },
    {
      id: 'loc-piso4-directiva',
      siteId: 'site-principal',
      name: 'Piso 4, zona directiva',
      description: '',
      active: true,
    },
    {
      id: 'loc-bloque-b',
      siteId: 'site-capacitacion',
      name: 'Bloque B, primer nivel',
      description: 'Auditorio y salones de formación.',
      active: true,
    },
    {
      id: 'loc-cancha-norte',
      siteId: 'site-deportiva',
      name: 'Cancha norte, exterior',
      description: '',
      active: true,
    },
  ]);

  saveCategory(category: ResourceCategory): void {
    this.categories.update((items) => upsert(items, category));
  }

  saveType(type: ResourceType): void {
    this.types.update((items) => upsert(items, type));
  }

  saveSite(site: ManagedSite): void {
    this.sites.update((items) => upsert(items, site));
  }

  saveLocation(location: SiteLocation): void {
    this.locations.update((items) => upsert(items, location));
  }
}
