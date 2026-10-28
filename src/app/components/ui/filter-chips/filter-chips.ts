import { Component, input, model } from '@angular/core';

export interface FilterChipOption {
  value: string;
  label: string;
}

/** Grupo de filtros de un solo valor, con estado de botón pulsado para lectores de pantalla. */
@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.html',
})
export class FilterChips {
  readonly label = input.required<string>();
  readonly options = input.required<FilterChipOption[]>();
  readonly value = model.required<string>();
}
