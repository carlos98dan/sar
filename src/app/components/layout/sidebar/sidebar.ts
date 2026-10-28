import { Component, computed, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { OrganizationService } from '../../../core/services/organization.service';
import { viewStateSignal } from '../../../core/utils/view-state';
import { NAV_GROUPS, NAV_ITEMS, NavGroup, NavItem } from './navigation';

interface NavSection extends NavGroup {
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  // El host ocupa toda la altura del shell para que el <aside> interno se estire hasta abajo.
  host: { class: 'flex h-full shrink-0' },
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly organizationService = inject(OrganizationService);

  readonly collapsed = model(false);
  readonly drawerOpen = model(false);

  readonly organization = viewStateSignal(this.organizationService.getOrganization());

  readonly sections: NavSection[] = NAV_GROUPS.map((group) => ({
    ...group,
    items: NAV_ITEMS.filter((item) => item.group === group.id),
  }));

  readonly asideClasses = computed(
    () =>
      [
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-200 md:static',
        this.drawerOpen() ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        this.collapsed() ? 'w-[260px] md:w-16' : 'w-[260px]',
      ].join(' '),
  );

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }
}
