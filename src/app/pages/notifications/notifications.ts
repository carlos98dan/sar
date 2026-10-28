import { Component, inject, signal } from '@angular/core';

import { Alert } from '../../components/ui/alert/alert';
import { Badge } from '../../components/ui/badge/badge';
import { Button } from '../../components/ui/button/button';
import { PageHeader } from '../../components/ui/page-header/page-header';
import { SectionCard } from '../../components/ui/section-card/section-card';
import { TableShell } from '../../components/ui/table-shell/table-shell';
import { CHANNEL_LABELS, EVENT_LABELS, RECIPIENT_LABELS } from '../../core/config/notifications';
import {
  NotificationChannel,
  NotificationRecipient,
  NotificationRule,
} from '../../core/models/notification.model';
import { OperationsStore } from '../../core/services/operations.store';

/** Agrega o quita un elemento de una lista, sin duplicados. */
function toggleItem<T>(items: T[], item: T, checked: boolean): T[] {
  const rest = items.filter((current) => current !== item);
  return checked ? [...rest, item] : rest;
}

/** Canales y destinatarios de cada notificación del sistema. Los eventos son fijos; solo se configuran. */
@Component({
  selector: 'app-notifications',
  imports: [Alert, Badge, Button, PageHeader, SectionCard, TableShell],
  templateUrl: './notifications.html',
})
export class Notifications {
  private readonly operations = inject(OperationsStore);

  readonly eventLabels = EVENT_LABELS;
  readonly channelLabels = CHANNEL_LABELS;
  readonly recipientLabels = RECIPIENT_LABELS;
  readonly channelOptions = Object.keys(CHANNEL_LABELS) as NotificationChannel[];
  readonly recipientOptions = Object.keys(RECIPIENT_LABELS) as NotificationRecipient[];
  readonly rules = this.operations.notificationRules;

  /** Regla en edición. `null` significa que no hay ninguna seleccionada. */
  readonly editing = signal<NotificationRule | null>(null);
  readonly channels = signal<NotificationChannel[]>([]);
  readonly recipients = signal<NotificationRecipient[]>([]);
  readonly errorMessage = signal<string | null>(null);

  startEdit(rule: NotificationRule): void {
    this.editing.set(rule);
    this.channels.set([...rule.channels]);
    this.recipients.set([...rule.recipients]);
    this.errorMessage.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.errorMessage.set(null);
  }

  setChannel(channel: NotificationChannel, checked: boolean): void {
    this.channels.update((items) => toggleItem(items, channel, checked));
  }

  setRecipient(recipient: NotificationRecipient, checked: boolean): void {
    this.recipients.update((items) => toggleItem(items, recipient, checked));
  }

  save(): void {
    const rule = this.editing();
    if (!rule) {
      return;
    }
    if (this.channels().length === 0) {
      this.errorMessage.set('Selecciona al menos un canal.');
      return;
    }
    if (this.recipients().length === 0) {
      this.errorMessage.set('Selecciona al menos un destinatario.');
      return;
    }

    this.operations.saveNotificationRule({
      ...rule,
      channels: this.channels(),
      recipients: this.recipients(),
    });
    this.cancelEdit();
  }

  toggle(rule: NotificationRule): void {
    this.operations.saveNotificationRule({ ...rule, active: !rule.active });
  }

  channelsLabel(rule: NotificationRule): string {
    return rule.channels.map((channel) => CHANNEL_LABELS[channel]).join(', ');
  }

  recipientsLabel(rule: NotificationRule): string {
    return rule.recipients.map((recipient) => RECIPIENT_LABELS[recipient]).join(', ');
  }
}
