import { Component, input } from '@angular/core';

/** Contenedor de tabla con scroll horizontal y pie opcional con el conteo de resultados. */
@Component({
  selector: 'app-table-shell',
  templateUrl: './table-shell.html',
})
export class TableShell {
  /** Texto del pie. Si está vacío no se muestra el pie. */
  readonly summary = input<string>('');
}
