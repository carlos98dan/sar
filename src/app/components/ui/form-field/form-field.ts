import { Component, input } from '@angular/core';

/**
 * Etiqueta, control proyectado y mensaje de error. El id del error es `<controlId>-error`,
 * para enlazarlo con `aria-describedby` desde el control.
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  host: { class: 'flex flex-col gap-space-xs' },
})
export class FormField {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  /** Mensaje de error visible. Vacío para ocultarlo. */
  readonly error = input<string>('');
}
