import { Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-outline-variant bg-surface-container-low text-secondary',
  primary: 'border-primary-fixed-variant/30 bg-primary-fixed text-on-primary-fixed-variant',
  success: 'border-success/30 bg-success-container text-success',
  warning: 'border-warning/30 bg-warning-container text-warning',
  danger: 'border-danger/30 bg-danger-container text-danger',
};

@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  readonly classes = computed(
    () =>
      `inline-flex h-[22px] items-center gap-space-xs whitespace-nowrap rounded border px-space-sm text-label-sm ${TONE_CLASSES[this.tone()]}`,
  );
}
