import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/** Layout persistente: sidebar + topbar + contenido de la ruta activa. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly drawerOpen = signal(false);

  readonly title = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentTitle()),
    ),
    { initialValue: this.currentTitle() },
  );

  /** Toma el `data.title` de la ruta más profunda que lo defina. */
  private currentTitle(): string {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = 'ReserveHub';
    while (route) {
      title = route.data['title'] ?? title;
      route = route.firstChild;
    }
    return title;
  }
}
