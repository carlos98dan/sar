import { Component, computed, input } from '@angular/core';

import { ReservationStatus } from '../../../core/models/reservation.model';
import { Badge, BadgeTone } from '../badge/badge';

interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

/** Etiqueta y color por estado de reserva. El estado de aprobación no es el estado operativo del recurso. */
export const RESERVATION_STATUS_META: Record<ReservationStatus, StatusMeta> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  pending: { label: 'Pendiente', tone: 'warning' },
  adjustments_requested: { label: 'Requiere ajustes', tone: 'warning' },
  confirmed: { label: 'Confirmada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
  in_progress: { label: 'En curso', tone: 'primary' },
  completed: { label: 'Finalizada', tone: 'neutral' },
  no_show: { label: 'No asistió', tone: 'danger' },
};

@Component({
  selector: 'app-reservation-status-badge',
  imports: [Badge],
  templateUrl: './reservation-status-badge.html',
})
export class ReservationStatusBadge {
  readonly status = input.required<ReservationStatus>();

  readonly meta = computed(() => RESERVATION_STATUS_META[this.status()]);
}
