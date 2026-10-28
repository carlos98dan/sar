import { ReservationStatus } from '../models/reservation.model';
import { availableActions, requiresReason, targetStatus } from './reservation-transitions';

describe('reservation transitions', () => {
  it('una reserva pendiente puede aprobarse, pedir ajustes, rechazarse o cancelarse', () => {
    expect(availableActions('pending')).toEqual(['approve', 'adjust', 'reject', 'cancel']);
  });

  it('una reserva confirmada puede iniciar uso o registrar no asistencia', () => {
    expect(availableActions('confirmed')).toContain('start');
    expect(availableActions('confirmed')).toContain('no_show');
  });

  it('una reserva finalizada, cancelada o rechazada no tiene acciones', () => {
    const closed: ReservationStatus[] = ['completed', 'cancelled', 'rejected', 'no_show', 'draft'];
    for (const status of closed) {
      expect(availableActions(status)).toEqual([]);
    }
  });

  it('calcula el estado resultante de cada acción', () => {
    expect(targetStatus('approve', 'pending')).toBe('confirmed');
    expect(targetStatus('start', 'confirmed')).toBe('in_progress');
    expect(targetStatus('finish', 'in_progress')).toBe('completed');
    expect(targetStatus('reschedule', 'confirmed')).toBe('confirmed');
  });

  it('exige motivo para rechazar, pedir ajustes y cancelar', () => {
    expect(requiresReason('reject')).toBe(true);
    expect(requiresReason('adjust')).toBe(true);
    expect(requiresReason('cancel')).toBe(true);
    expect(requiresReason('approve')).toBe(false);
  });
});
