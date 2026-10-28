import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SearchInput } from '../../components/ui/search-input/search-input';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { ROLE_LABELS } from '../../core/config/roles';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { matchesQuery } from '../../core/utils/search';
import { viewStateSignal } from '../../core/utils/view-state';

@Component({
  selector: 'app-users',
  imports: [DatePipe, Badge, Button, PageHeader, SearchInput, StatePanel, TableShell],
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

    return state.data.filter((user) =>
      matchesQuery(this.query(), [user.fullName, user.email, user.department, ROLE_LABELS[user.role]]),
    );
  });
}
