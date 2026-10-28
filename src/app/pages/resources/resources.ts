import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Badge, BadgeTone } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { Resource, ResourceAvailability } from '../../core/models/resource.model';
import { ResourceService } from '../../core/services/resource.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

const AVAILABILITY_META: Record<ResourceAvailability, { label: string; tone: BadgeTone }> = {
  available: { label: 'Disponible', tone: 'success' },
  occupied: { label: 'Ocupado', tone: 'primary' },
  maintenance: { label: 'Mantenimiento', tone: 'warning' },
  out_of_service: { label: 'Fuera de servicio', tone: 'danger' },
};

@Component({
  selector: 'app-resources',
  imports: [DatePipe, Badge, Button, PageHeader, SearchInput, StatePanel, TableShell],
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

    const category = this.category();

    return state.data.filter(
      (resource) =>
        (category === 'all' || resource.category === category) &&
        (!this.onlyAvailable() || resource.availability === 'available') &&
        matchesQuery(this.query(), [resource.code, resource.name, resource.siteName]),
    );
  });

  clearFilters(): void {
    this.query.set('');
    this.category.set('all');
    this.onlyAvailable.set(false);
  }
}
