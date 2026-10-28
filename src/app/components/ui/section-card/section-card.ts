import { Component, computed, input } from '@angular/core';

export type SectionCardPadding = 'none' | 'lg' | 'xl';

const PADDING_CLASSES: Record<SectionCardPadding, string> = {
  none: '',
  lg: 'p-space-lg',
  xl: 'p-space-xl',
};

/** Tarjeta con borde y fondo de superficie. El padre puede añadir clases de layout (por ejemplo `xl:col-span-2`). */
@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.html',
  host: { class: 'block rounded-lg border border-outline-variant bg-surface-container-lowest' },
})
export class SectionCard {
  readonly padding = input<SectionCardPadding>('lg');

  readonly paddingClass = computed(() => PADDING_CLASSES[this.padding()]);
}
