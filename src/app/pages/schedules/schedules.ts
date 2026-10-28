import { Component, computed, signal } from '@angular/core';

import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { HOLIDAYS, Holiday, SITE_SCHEDULES } from '../../core/config/booking-config';

const VIEW_OPTIONS: FilterChipOption[] = [
  { value: 'horario', label: 'Horario por sede' },
  { value: 'festivos', label: 'Festivos y excepciones' },
];

/** Horario de atención por sede y festivos que bloquean la disponibilidad. */
@Component({
  selector: 'app-schedules',
  imports: [Button, FilterChips, PageHeader, StatePanel, TableShell, SectionCard],
  templateUrl: './schedules.html',
})
export class Schedules {
  readonly viewOptions = VIEW_OPTIONS;
  readonly view = signal('horario');
  readonly schedules = SITE_SCHEDULES;

  readonly holidays = signal<Holiday[]>([...HOLIDAYS].sort((a, b) => a.date.localeCompare(b.date)));
  readonly newDate = signal('');
  readonly newName = signal('');

  readonly canAdd = computed(() => this.newDate() !== '' && this.newName().trim().length >= 3);

  addHoliday(): void {
    if (!this.canAdd()) {
      return;
    }
    this.holidays.update((items) =>
      [...items, { date: this.newDate(), name: this.newName().trim() }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    this.newDate.set('');
    this.newName.set('');
  }

  /** Las fechas de festivo no tienen hora; se formatean por partes para no desplazar el día por zona horaria. */
  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  removeHoliday(date: string): void {
    this.holidays.update((items) => items.filter((item) => item.date !== date));
  }
}
