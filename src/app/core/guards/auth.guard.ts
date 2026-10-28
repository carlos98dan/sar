import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Protege las rutas con sesión. Si no hay sesión vigente, envía a /login recordando el destino. */
export const authGuard: CanActivateFn = (_route, state: RouterStateSnapshot) => {
  if (inject(AuthService).isAuthenticated()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
