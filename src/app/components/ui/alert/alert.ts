import { Component, booleanAttribute, computed, input } from '@angular/core';

export type AlertTone = 'success' | 'danger';

const TONE_CLASSES: Record<AlertTone, string> = {
  success: 'border-success/30 bg-success-container text-success',
  danger: 'border-danger/30 bg-danger-container text-danger',
};

/** Mensaje de estado. `success` se anuncia como status y `danger` como alert. */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
  },
})
export class Alert {
  readonly tone = input<AlertTone>('success');
  /** Nombre de icono de Material Symbols. Vacío para no mostrar icono. */
  readonly icon = input<string>('');
  /** Texto más pequeño y alineado al inicio, para mensajes dentro de formularios. */
  readonly dense = input(false, { transform: booleanAttribute });

  readonly role = computed(() => (this.tone() === 'danger' ? 'alert' : 'status'));

  readonly classes = computed(
    () =>
      `flex rounded border p-space-md ${this.dense() ? 'items-start text-body-sm' : 'items-center text-body-md'} gap-space-sm ${TONE_CLASSES[this.tone()]}`,
  );
}
