import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Alert } from '../../components/ui/alert/alert';
import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { FilterChipOption, FilterChips } from '../../components/ui/filter-chips/filter-chips';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { CATEGORY_CONFIG } from '../../core/config/booking-config';
import { OperationsStore } from '../../core/services/operations.store';
import { BookingRule, RuleKind, ruleViolations } from '../../core/utils/rules';

const KIND_LABELS: Record<RuleKind, string> = {
  advance_min: 'Anticipación mínima (horas)',
  advance_max: 'Anticipación máxima (horas)',
  duration_min: 'Duración mínima (minutos)',
  duration_max: 'Duración máxima (minutos)',
};

const VIEW_OPTIONS: FilterChipOption[] = [
  { value: 'reglas', label: 'Reglas de reserva' },
  { value: 'politicas', label: 'Política de cancelación' },
];

/** Reglas que limitan cuándo y cuánto se puede reservar, con simulador, y la política de cancelación. */
@Component({
  selector: 'app-rules',
  imports: [Alert, Badge, Button, FilterChips, KeyValuePipe, PageHeader, TableShell],
  templateUrl: './rules.html',
})
export class Rules {
  private readonly operations = inject(OperationsStore);

  readonly viewOptions = VIEW_OPTIONS;
  readonly view = signal('reglas');
  readonly kindLabels = KIND_LABELS;
  readonly rules = this.operations.rules;
  readonly categories = Object.keys(CATEGORY_CONFIG);

  readonly newName = signal('');
  readonly newKind = signal<RuleKind>('advance_min');
  readonly newValue = signal(1);
  readonly newCategory = signal('');

  readonly canAddRule = computed(() => this.newName().trim().length >= 3 && this.newValue() > 0);

  /** Simulador: aplica las reglas activas a una solicitud hipotética. */
  readonly simCategory = signal(this.categories[0]);
  readonly simAnticipation = signal(24);
  readonly simDuration = signal(60);

  readonly simResult = computed(() =>
    ruleViolations(this.rules(), {
      category: this.simCategory(),
      anticipationHours: this.simAnticipation(),
      durationMinutes: this.simDuration(),
    }),
  );

  kindLabel(rule: BookingRule): string {
    return KIND_LABELS[rule.kind];
  }

  toggle(rule: BookingRule): void {
    this.operations.toggleRule(rule.id);
  }

  addRule(): void {
    if (!this.canAddRule()) {
      return;
    }
    const rule: BookingRule = {
      id: `rule-${Date.now()}`,
      name: this.newName().trim(),
      kind: this.newKind(),
      value: this.newValue(),
      category: this.newCategory() || null,
      active: true,
    };
    this.rules.update((items) => [...items, rule]);
    this.newName.set('');
    this.newValue.set(1);
    this.newCategory.set('');
  }

  /* Política de cancelación. Solo se guarda en la sesión; BACKEND: persistir en la configuración de la organización. */
  readonly freeCancelHours = signal(24);
  readonly penaltyPercent = signal(0);
  readonly policyText = signal(
    'Puedes cancelar sin costo hasta 24 horas antes del inicio de la reserva.',
  );
  readonly policySaved = signal(false);

  savePolicy(): void {
    this.policySaved.set(true);
  }
}
