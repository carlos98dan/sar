import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrganizationService } from '../../../core/services/organization.service';
import { viewStateSignal } from '../../../core/utils/view-state';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
})
export class Topbar {
  private readonly organizationService = inject(OrganizationService);

  readonly title = input.required<string>();
  readonly menuClick = output<void>();

  readonly sites = viewStateSignal(this.organizationService.listSites());
  readonly selectedSiteId = signal('all');
}
