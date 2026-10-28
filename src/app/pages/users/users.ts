import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Badge } from '../../components/ui/badge/badge';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { User, UserRole } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { viewStateSignal } from '../../core/utils/view-state';

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadministrador',
  organization_admin: 'Administrador de organización',
  site_coordinator: 'Coordinador de sede',
  approver: 'Aprobador',
  operator: 'Operador',
  user: 'Usuario',
};

@Component({
  selector: 'app-users',
  imports: [DatePipe, Badge, PageHeader, StatePanel],
  templateUrl: './users.html',
})
export class Users {
  private readonly userService = inject(UserService);

  readonly roleLabels = ROLE_LABELS;
  readonly users = viewStateSignal(this.userService.list());

  readonly query = signal('');

  readonly filtered = computed<User[]>(() => {
    const state = this.users();
    if (state.status !== 'ready') {
      return [];
    }

    const term = this.query().trim().toLowerCase();

    return state.data.filter(
      (user) =>
        !term ||
        [user.fullName, user.email, user.department, ROLE_LABELS[user.role]].some((value) =>
          value.toLowerCase().includes(term),
        ),
    );
  });
}
