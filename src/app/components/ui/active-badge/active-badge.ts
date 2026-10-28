import { Component, input } from '@angular/core';

import { Badge } from '../badge/badge';

/** Insignia de activo o inactivo. Las etiquetas se pueden cambiar para concordar con el sustantivo. */
@Component({
  selector: 'app-active-badge',
  imports: [Badge],
  templateUrl: './active-badge.html',
})
export class ActiveBadge {
  readonly active = input.required<boolean>();
  readonly activeLabel = input('Activo');
  readonly inactiveLabel = input('Inactivo');
}
