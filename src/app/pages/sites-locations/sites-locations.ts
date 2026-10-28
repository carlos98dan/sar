import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Button } from '../../components/ui/button/button';
import { FormField } from '../../components/ui/form-field/form-field';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { ActiveBadge } from '../../components/ui/active-badge/active-badge';
import { ManagedSite, SiteLocation } from '../../core/models/catalog.model';
import { CatalogStore } from '../../core/services/catalog.store';

const INPUT_CLASS =
  'h-9 rounded border border-outline-variant bg-surface-container-lowest px-space-sm text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container';

/** Sedes de la organización y, dentro de la sede seleccionada, sus ubicaciones. */
@Component({
  selector: 'app-sites-locations',
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
  templateUrl: './sites-locations.html',
})
export class SitesLocations {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(CatalogStore);

  readonly inputClass = INPUT_CLASS;
  readonly sites = this.catalog.sites;
  readonly locations = this.catalog.locations;

  readonly selectedSiteId = signal<string | null>(null);
  readonly selectedSite = computed(
    () => this.sites().find((site) => site.id === this.selectedSiteId()) ?? null,
  );
  readonly siteLocations = computed(() =>
    this.locations().filter((location) => location.siteId === this.selectedSiteId()),
  );

  /** Registro en edición. `null` significa que el formulario crea uno nuevo. */
  readonly editingSite = signal<ManagedSite | null>(null);
  readonly editingLocation = signal<SiteLocation | null>(null);

  readonly siteForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    address: ['', [Validators.required, Validators.maxLength(160)]],
    city: ['', [Validators.required, Validators.maxLength(80)]],
  });

  readonly locationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(200)]],
  });

  locationsOf(siteId: string): SiteLocation[] {
    return this.locations().filter((location) => location.siteId === siteId);
  }

  selectSite(site: ManagedSite): void {
    this.selectedSiteId.set(site.id);
    this.cancelLocationEdit();
  }

  startEditSite(site: ManagedSite): void {
    this.editingSite.set(site);
    this.siteForm.setValue({ name: site.name, address: site.address, city: site.city });
  }

  cancelSiteEdit(): void {
    this.editingSite.set(null);
    this.siteForm.reset();
  }

  saveSite(): void {
    if (this.siteForm.invalid) {
      this.siteForm.markAllAsTouched();
      return;
    }

    const editing = this.editingSite();
    const { name, address, city } = this.siteForm.getRawValue();

    this.catalog.saveSite({
      id: editing?.id ?? `site-${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      active: editing?.active ?? true,
    });
    this.cancelSiteEdit();
  }

  toggleSite(site: ManagedSite): void {
    this.catalog.saveSite({ ...site, active: !site.active });
  }

  startEditLocation(location: SiteLocation): void {
    this.editingLocation.set(location);
    this.locationForm.setValue({ name: location.name, description: location.description });
  }

  cancelLocationEdit(): void {
    this.editingLocation.set(null);
    this.locationForm.reset();
  }

  saveLocation(): void {
    const siteId = this.selectedSiteId();
    if (!siteId) {
      return;
    }
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const editing = this.editingLocation();
    const { name, description } = this.locationForm.getRawValue();

    this.catalog.saveLocation({
      id: editing?.id ?? `loc-${Date.now()}`,
      siteId,
      name: name.trim(),
      description: description.trim(),
      active: editing?.active ?? true,
    });
    this.cancelLocationEdit();
  }

  toggleLocation(location: SiteLocation): void {
    this.catalog.saveLocation({ ...location, active: !location.active });
  }
}
