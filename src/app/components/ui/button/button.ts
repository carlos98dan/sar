import { Directive, HostBinding, booleanAttribute, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

const BASE =
  'flex items-center gap-space-sm rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container disabled:cursor-not-allowed disabled:opacity-60';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 w-8 justify-center',
  md: 'h-9',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container px-space-md text-body-md font-medium text-on-primary hover:bg-primary',
  outline:
    'border border-outline-variant bg-surface-container-lowest px-space-md text-body-md font-medium text-on-surface hover:bg-surface-container-high',
  ghost: 'px-space-sm text-label-md font-medium text-primary hover:bg-primary-fixed',
};

/**
 * Estilo de botón para elementos nativos: `<button appButton>` o `<a appButton>`.
 * Se aplica como directiva para que las clases base se apliquen consistentemente.
 */
@Directive({
  selector: '[appButton]',
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** Ocupa el ancho disponible y centra el contenido. */
  readonly block = input(false, { transform: booleanAttribute });
  readonly round = input(false, { transform: booleanAttribute });

  private baseStyles = computed(() => {
    const baseClasses = `${BASE} ${SIZE_CLASSES[this.size()]} ${VARIANT_CLASSES[this.variant()]}`;
    const blockClasses = this.block() ? 'w-full justify-center' : '';
    const roundClasses = this.round() ? '!rounded-full' : '';
    return `${baseClasses} ${blockClasses} ${roundClasses}`.trim();
  });

  @HostBinding('class')
  get buttonClass(): string {
    return this.baseStyles();
  }
}
