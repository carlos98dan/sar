import { Component, computed, inject } from '@angular/core';

import { Alert } from '../../components/ui/alert/alert';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { PERMISSIONS } from '../../core/config/permissions';
import { ROLE_LABELS, ROLE_ORDER } from '../../core/config/roles';
import { PermissionDef, PermissionId } from '../../core/models/permission.model';
import { UserRole } from '../../core/models/user.model';
import { OperationsStore } from '../../core/services/operations.store';
import { UserService } from '../../core/services/user.service';
import { viewStateSignal } from '../../core/utils/view-state';

/** Matriz de permisos por rol. El superadministrador conserva todos los permisos y no se puede editar. */
@Component({
  selector: 'app-roles',
  imports: [Alert, Button, PageHeader, StatePanel, TableShell],
  templateUrl: './roles.html',
})
export class Roles {
  private readonly operations = inject(OperationsStore);
  private readonly userService = inject(UserService);

  readonly roles = ROLE_ORDER;
  readonly roleLabels = ROLE_LABELS;
  readonly modules = [...new Set(PERMISSIONS.map((permission) => permission.module))];
  readonly grants = this.operations.rolePermissions;
  readonly users = viewStateSignal(this.userService.list());

  /** Cantidad de usuarios asignados a cada rol. */
  readonly userCounts = computed<Partial<Record<UserRole, number>>>(() => {
    const state = this.users();
    if (state.status !== 'ready') {
      return {};
    }
    return state.data.reduce<Partial<Record<UserRole, number>>>(
      (counts, user) => ({ ...counts, [user.role]: (counts[user.role] ?? 0) + 1 }),
      {},
    );
  });

  permissionsOf(module: string): PermissionDef[] {
    return PERMISSIONS.filter((permission) => permission.module === module);
  }

  isLocked(role: UserRole): boolean {
    return role === 'superadmin';
  }

  has(role: UserRole, permission: PermissionId): boolean {
    return this.isLocked(role) || this.grants()[role].includes(permission);
  }

  toggle(role: UserRole, permission: PermissionId, event: Event): void {
    const granted = (event.target as HTMLInputElement).checked;
    this.operations.setRolePermission(role, permission, granted);
  }

  reset(): void {
    this.operations.resetRolePermissions();
  }
}
