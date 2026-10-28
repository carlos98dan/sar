import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageHeader } from '../../components/ui/page-header/page-header';
import { StatePanel } from '../../components/ui/state-panel/state-panel';

/** Página provisional para los módulos del menú que aún no tienen pantalla. */
@Component({
  selector: 'app-module-pending',
  imports: [PageHeader, StatePanel],
  templateUrl: './module-pending.html',
})
export class ModulePending {
  readonly title = inject(ActivatedRoute).snapshot.data['title'] as string;
}
