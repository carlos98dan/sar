import { Injectable, signal } from '@angular/core';

import { DEFAULT_RULES, HOURLY_RATES } from '../config/booking-config';
import { DEFAULT_NOTIFICATION_RULES } from '../config/notifications';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';
import { ApprovalFlow } from '../models/approval-flow.model';
import { NotificationRule } from '../models/notification.model';
import { PermissionId } from '../models/permission.model';
import { UserRole } from '../models/user.model';
import { upsert } from '../utils/collections';
import { BookingRule } from '../utils/rules';

export type BlockType =
  'mantenimiento' | 'limpieza' | 'evento' | 'cierre' | 'festivo' | 'administrativo';

export interface Block {
  id: string;
  type: BlockType;
  /** `null` cuando el bloqueo afecta a todas las sedes. */
  resourceId: string | null;
  resourceName: string;
  /** ISO 8601 con zona horaria -05:00. */
  startsAt: string;
  endsAt: string;
  reason: string;
  responsible: string;
}

export type IncidentPriority = 'baja' | 'media' | 'alta';
export type IncidentStatus = 'abierta' | 'en_proceso' | 'resuelta';

export interface Incident {
  id: string;
  code: string;
  resourceName: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  responsible: string;
  reportedAt: string;
}

/**
 * Estado de operación y parametrización de la sesión: bloqueos, incidencias, reglas y tarifas.
 * Los datos iniciales son de demostración y se pierden al recargar.
 * BACKEND: reemplazar por los servicios reales de cada módulo.
 */
@Injectable({ providedIn: 'root' })
export class OperationsStore {
  readonly blocks = signal<Block[]>([
    {
      id: 'blk-1',
      type: 'mantenimiento',
      resourceId: 'res-cancha-tenis',
      resourceName: 'Cancha de tenis',
      startsAt: '2026-10-26T08:00:00-05:00',
      endsAt: '2026-10-30T18:00:00-05:00',
      reason: 'Cambio de superficie',
      responsible: 'Carlos Romero',
    },
    {
      id: 'blk-2',
      type: 'evento',
      resourceId: 'res-auditorio',
      resourceName: 'Auditorio principal',
      startsAt: '2026-10-24T16:00:00-05:00',
      endsAt: '2026-10-24T20:00:00-05:00',
      reason: 'Ensayo interno de evento',
      responsible: 'Mariana Ríos',
    },
  ]);

  readonly incidents = signal<Incident[]>([
    {
      id: 'inc-1',
      code: 'INC-0041',
      resourceName: 'Proyector portátil',
      description: 'La lámpara no enciende. Se requiere reemplazo.',
      priority: 'alta',
      status: 'en_proceso',
      responsible: 'Carlos Romero',
      reportedAt: '2026-10-23T15:20:00-05:00',
    },
    {
      id: 'inc-2',
      code: 'INC-0042',
      resourceName: 'Sala de reuniones 101',
      description: 'Control del aire acondicionado sin respuesta.',
      priority: 'media',
      status: 'abierta',
      responsible: 'Mariana Ríos',
      reportedAt: '2026-10-24T09:05:00-05:00',
    },
  ]);

  readonly rules = signal<BookingRule[]>(DEFAULT_RULES);

  readonly rates = signal<Record<string, number>>({ ...HOURLY_RATES });

  readonly approvalFlows = signal<ApprovalFlow[]>([
    {
      id: 'flow-auditorios',
      name: 'Eventos en auditorios',
      category: 'Auditorios y eventos',
      steps: ['site_coordinator', 'approver'],
      active: true,
    },
    {
      id: 'flow-vehiculos',
      name: 'Uso de vehículos',
      category: 'Vehículos',
      steps: ['approver'],
      active: true,
    },
  ]);

  addBlock(block: Block): void {
    this.blocks.update((items) => [...items, block]);
  }

  addIncident(incident: Incident): void {
    this.incidents.update((items) => [incident, ...items]);
  }

  setIncidentStatus(id: string, status: IncidentStatus): void {
    this.incidents.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  toggleRule(id: string): void {
    this.rules.update((items) =>
      items.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)),
    );
  }

  setRate(resourceId: string, amount: number): void {
    this.rates.update((items) => ({ ...items, [resourceId]: amount }));
  }

  saveApprovalFlow(flow: ApprovalFlow): void {
    this.approvalFlows.update((items) => upsert(items, flow));
  }

  readonly rolePermissions = signal<Record<UserRole, PermissionId[]>>(
    structuredClone(DEFAULT_ROLE_PERMISSIONS),
  );

  setRolePermission(role: UserRole, permission: PermissionId, granted: boolean): void {
    this.rolePermissions.update((items) => {
      const current = items[role].filter((id) => id !== permission);
      return { ...items, [role]: granted ? [...current, permission] : current };
    });
  }

  resetRolePermissions(): void {
    this.rolePermissions.set(structuredClone(DEFAULT_ROLE_PERMISSIONS));
  }

  readonly notificationRules = signal<NotificationRule[]>(
    structuredClone(DEFAULT_NOTIFICATION_RULES),
  );

  saveNotificationRule(rule: NotificationRule): void {
    this.notificationRules.update((items) => upsert(items, rule));
  }
}
