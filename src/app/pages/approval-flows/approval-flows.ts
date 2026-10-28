import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Button } from '../../components/ui/button/button';
import { FormField } from '../../components/ui/form-field/form-field';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { ActiveBadge } from '../../components/ui/active-badge/active-badge';
import { ApprovalFlow, ApprovalRole } from '../../core/models/approval-flow.model';
import { CatalogStore } from '../../core/services/catalog.store';
import { OperationsStore } from '../../core/services/operations.store';

const INPUT_CLASS =
  'h-9 rounded border border-outline-variant bg-surface-container-lowest px-space-sm text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container';

const ROLE_LABELS: Record<ApprovalRole, string> = {
  site_coordinator: 'Coordinador de sede',
  approver: 'Aprobador',
  organization_admin: 'Administrador de la organización',
  operator: 'Operador',
};

/** Pasos de aprobación que recorre una reserva según su categoría. */
@Component({
  selector: 'app-approval-flows',
  imports: [
    ReactiveFormsModule,
    Button,
    FormField,
    PageHeader,
    SectionCard,
    StatePanel,
    TableShell,
    ActiveBadge,
  ],
  templateUrl: './approval-flows.html',
})
export class ApprovalFlows {
  private readonly fb = inject(FormBuilder);
  private readonly operations = inject(OperationsStore);
  private readonly catalog = inject(CatalogStore);

  readonly inputClass = INPUT_CLASS;
  readonly roleLabels = ROLE_LABELS;
  readonly roleOptions = Object.keys(ROLE_LABELS) as ApprovalRole[];
  readonly flows = this.operations.approvalFlows;
  readonly activeCategories = computed(() =>
    this.catalog.categories().filter((category) => category.active),
  );

  /** Flujo en edición. `null` significa que el formulario crea uno nuevo. */
  readonly editing = signal<ApprovalFlow | null>(null);
  /** Pasos del borrador, en orden de aprobación. */
  readonly steps = signal<ApprovalRole[]>([]);
  readonly stepRole = signal<ApprovalRole>('approver');
  readonly stepsMissing = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    category: [''],
  });

  roleLabel(role: ApprovalRole): string {
    return ROLE_LABELS[role];
  }

  categoryLabel(flow: ApprovalFlow): string {
    return flow.category ?? 'Todas las categorías';
  }

  addStep(): void {
    this.steps.update((items) => [...items, this.stepRole()]);
    this.stepsMissing.set(false);
  }

  removeStep(index: number): void {
    this.steps.update((items) => items.filter((_, position) => position !== index));
  }

  moveStep(index: number, offset: -1 | 1): void {
    const target = index + offset;
    this.steps.update((items) => {
      if (target < 0 || target >= items.length) {
        return items;
      }
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  startEdit(flow: ApprovalFlow): void {
    this.editing.set(flow);
    this.steps.set([...flow.steps]);
    this.form.setValue({ name: flow.name, category: flow.category ?? '' });
    this.stepsMissing.set(false);
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.steps.set([]);
    this.stepsMissing.set(false);
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.steps().length === 0) {
      this.stepsMissing.set(true);
      return;
    }

    const editing = this.editing();
    const { name, category } = this.form.getRawValue();

    this.operations.saveApprovalFlow({
      id: editing?.id ?? `flow-${Date.now()}`,
      name: name.trim(),
      category: category || null,
      steps: this.steps(),
      active: editing?.active ?? true,
    });
    this.cancelEdit();
  }

  toggle(flow: ApprovalFlow): void {
    this.operations.saveApprovalFlow({ ...flow, active: !flow.active });
  }
}
