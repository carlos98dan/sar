import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.html',
  host: { class: 'relative block w-full' },
})
export class SearchInput {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly value = model('');
}
