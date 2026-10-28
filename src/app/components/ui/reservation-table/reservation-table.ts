import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { Reservation } from '../../../core/models/reservation.model';
import { ReservationStatusBadge } from '../reservation-status-badge/reservation-status-badge';
import { TableShell } from '../table-shell/table-shell';

/** Listado de reservas con código, recurso, horario, solicitante y estado. */
@Component({
  selector: 'app-reservation-table',
  imports: [DatePipe, ReservationStatusBadge, TableShell],
  templateUrl: './reservation-table.html',
})
export class ReservationTable {
  readonly caption = input.required<string>();
  readonly reservations = input.required<Reservation[]>();
  /** Texto del pie. Si está vacío no se muestra el pie. */
  readonly summary = input<string>('');
}
