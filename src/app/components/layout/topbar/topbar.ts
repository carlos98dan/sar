import { Component, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ThemeService } from '../../../core/services/theme.service';
import { viewStateSignal } from '../../../core/utils/view-state';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
})
export class Topbar {
  private readonly organizationService = inject(OrganizationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly title = input.required<string>();
  readonly menuClick = output<void>();

  readonly sites = viewStateSignal(this.organizationService.listSites());
  readonly selectedSiteId = signal('all');
  readonly userMenuOpen = signal(false);
  readonly theme = this.themeService.theme;

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
