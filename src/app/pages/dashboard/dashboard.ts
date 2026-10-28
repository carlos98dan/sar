import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { ReservationStatusBadge } from '../../components/ui/reservation-status-badge/reservation-status-badge';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { StatCard } from '../../components/ui/stat-card/stat-card';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { DashboardService } from '../../core/services/dashboard.service';
import { viewStateSignal } from '../../core/utils/view-state';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, Button, PageHeader, ReservationStatusBadge, SectionCard, StatCard, StatePanel],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  readonly today = new Date();
  readonly summary = viewStateSignal(this.dashboardService.getSummary());
}
