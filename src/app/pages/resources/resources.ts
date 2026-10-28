import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Badge, BadgeTone } from '../../components/ui/badge/badge';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { Resource, ResourceAvailability } from '../../core/models/resource.model';
import { ResourceService } from '../../core/services/resource.service';
import { viewStateSignal } from '../../core/utils/view-state';

const AVAILABILITY_META: Record<ResourceAvailability, { label: string; tone: BadgeTone }> = {
  available: { label: 'Disponible', tone: 'success' },
  occupied: { label: 'Ocupado', tone: 'primary' },
  maintenance: { label: 'Mantenimiento', tone: 'warning' },
  out_of_service: { label: 'Fuera de servicio', tone: 'danger' },
};

@Component({
  selector: 'app-resources',
  imports: [DatePipe, Badge, PageHeader, StatePanel],
  templateUrl: './resources.html',
})
export class Resources {
  private readonly resourceService = inject(ResourceService);

  readonly availabilityMeta = AVAILABILITY_META;
  readonly resources = viewStateSignal(this.resourceService.list());

  readonly query = signal('');
  readonly category = signal('all');
  readonly onlyAvailable = signal(false);

  readonly categories = computed(() => {
    const state = this.resources();
    if (state.status !== 'ready') {
      return [];
    }
    return [...new Set(state.data.map((resource) => resource.category))].sort();
  });

  readonly filtered = computed<Resource[]>(() => {
    const state = this.resources();
    if (state.status !== 'ready') {
      return [];
    }

    const term = this.query().trim().toLowerCase();
    const category = this.category();

    return state.data.filter(
      (resource) =>
        (category === 'all' || resource.category === category) &&
        (!this.onlyAvailable() || resource.availability === 'available') &&
        (!term || [resource.code, resource.name, resource.siteName].some((value) => value.toLowerCase().includes(term))),
    );
  });

  clearFilters(): void {
    this.query.set('');
    this.category.set('all');
    this.onlyAvailable.set(false);
  }
}
