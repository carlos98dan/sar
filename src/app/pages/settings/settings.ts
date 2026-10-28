import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Alert } from '../../components/ui/alert/alert';
import { Button } from '../../components/ui/button/button';
import { FormField } from '../../components/ui/form-field/form-field';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { Organization } from '../../core/models/organization.model';
import { OrganizationService } from '../../core/services/organization.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, Alert, Button, FormField, PageHeader, SectionCard],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly organizationService = inject(OrganizationService);

  readonly timezones = ['America/Bogota'];
  readonly currencies = ['COP'];
  readonly dateFormats = ['DD/MM/AAAA'];
  readonly timeFormats = ['24h'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    taxId: ['', [Validators.required]],
    timezone: ['America/Bogota', [Validators.required]],
    currency: ['COP', [Validators.required]],
    dateFormat: ['DD/MM/AAAA', [Validators.required]],
    timeFormat: ['24h', [Validators.required]],
  });

  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private current: Organization | null = null;

  constructor() {
    this.organizationService
      .getOrganization()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (organization) => {
          this.current = organization;
          this.form.patchValue(organization);
        },
        error: () => this.errorMessage.set('No se pudo cargar la configuración de la organización.'),
      });
  }

  save(): void {
    if (this.form.invalid || !this.current) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    this.errorMessage.set(null);

    const payload: Organization = { ...this.current, ...this.form.getRawValue() };

    this.organizationService.updateOrganization(payload).subscribe({
      next: (organization) => {
        this.current = organization;
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudieron guardar los cambios. Intenta nuevamente.');
      },
    });
  }
}
