import { Directive, booleanAttribute, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

const BASE =
  'flex h-9 items-center gap-space-sm rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container px-space-md text-body-md font-medium text-on-primary hover:bg-primary',
  outline:
    'border border-outline-variant bg-surface-container-lowest px-space-md text-body-md font-medium text-on-surface hover:bg-surface-container-high',
  ghost: 'px-space-sm text-label-md font-medium text-primary hover:bg-primary-fixed',
};

/**
 * Estilo de botón para elementos nativos: `<button appButton>` o `<a appButton>`.
 * Se aplica como directiva para que las clases que pase el padre (márgenes, anchos) se combinen sin envolver el elemento.
 */
@Directive({
  selector: '[appButton]',
  host: {
    '[class]': 'classes()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  /** Ocupa el ancho disponible y centra el contenido. */
  readonly block = input(false, { transform: booleanAttribute });

  readonly classes = computed(
    () =>
      `${BASE} ${VARIANT_CLASSES[this.variant()]}${this.block() ? ' w-full justify-center' : ''}`,
  );
}
