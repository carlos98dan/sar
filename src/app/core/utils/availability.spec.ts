import { Reservation, ReservationStatus } from '../models/reservation.model';
import { Resource, ResourceAvailability } from '../models/resource.model';
import { AvailabilityWindow, evaluateWindow, isValidWindow } from './availability';

const WINDOW: AvailabilityWindow = { date: '2026-10-24', from: '10:00', to: '11:00' };

function resource(availability: ResourceAvailability = 'available'): Resource {
  return {
    id: 'res-sala',
    code: 'SR-101',
    name: 'Sala de reuniones 101',
    category: 'Salas de reuniones',
    siteId: 'site-principal',
    siteName: 'Sede Principal',
    location: 'Piso 1',
    capacity: 12,
    availability,
    nextReservationAt: null,
  };
}

function reservation(
  startsAt: string,
  endsAt: string,
  status: ReservationStatus = 'confirmed',
): Reservation {
  return {
    id: 'rsv-1',
    code: 'RSV-1',
    title: 'Reunión',
    resource: { id: 'res-sala', name: 'Sala de reuniones 101' },
    requester: { id: 'usr-1', name: 'Persona', department: 'Área' },
    attendees: 4,
    startsAt,
    endsAt,
    status,
    createdAt: '2026-10-20T10:00:00-05:00',
  };
}

describe('isValidWindow', () => {
  it('acepta una franja donde la hora de fin es posterior', () => {
    expect(isValidWindow(WINDOW)).toBe(true);
  });

  it('rechaza una franja donde la hora de fin no es posterior', () => {
    expect(isValidWindow({ ...WINDOW, to: '10:00' })).toBe(false);
    expect(isValidWindow({ ...WINDOW, to: '09:30' })).toBe(false);
  });
});

describe('evaluateWindow', () => {
  it('marca como disponible un recurso sin reservas en la franja', () => {
    const result = evaluateWindow(resource(), [], WINDOW);

    expect(result).toEqual({ status: 'available', reservation: null });
  });

  it('marca como reservado un recurso con una reserva que se cruza con la franja', () => {
    const overlapping = reservation('2026-10-24T10:30:00-05:00', '2026-10-24T12:00:00-05:00');

    const result = evaluateWindow(resource(), [overlapping], WINDOW);

    expect(result.status).toBe('booked');
    expect(result.reservation).toBe(overlapping);
  });

  it('no bloquea con una reserva que termina justo al inicio de la franja', () => {
    const before = reservation('2026-10-24T09:00:00-05:00', '2026-10-24T10:00:00-05:00');

    expect(evaluateWindow(resource(), [before], WINDOW).status).toBe('available');
  });

  it('no bloquea con una reserva que empieza justo al final de la franja', () => {
    const after = reservation('2026-10-24T11:00:00-05:00', '2026-10-24T12:00:00-05:00');

    expect(evaluateWindow(resource(), [after], WINDOW).status).toBe('available');
  });

  it('ignora reservas canceladas, rechazadas o sin asistencia', () => {
    const statuses: ReservationStatus[] = ['cancelled', 'rejected', 'no_show'];

    for (const status of statuses) {
      const inactive = reservation(
        '2026-10-24T10:00:00-05:00',
        '2026-10-24T11:00:00-05:00',
        status,
      );
      expect(evaluateWindow(resource(), [inactive], WINDOW).status).toBe('available');
    }
  });

  it('ignora reservas de otro día o de otro recurso', () => {
    const otherDay = reservation('2026-10-25T10:00:00-05:00', '2026-10-25T11:00:00-05:00');
    const otherResource = {
      ...reservation('2026-10-24T10:00:00-05:00', '2026-10-24T11:00:00-05:00'),
      resource: { id: 'res-otro', name: 'Otra sala' },
    };

    expect(evaluateWindow(resource(), [otherDay, otherResource], WINDOW).status).toBe('available');
  });

  it('marca como no disponible un recurso en mantenimiento o fuera de servicio, aunque no tenga reservas', () => {
    expect(evaluateWindow(resource('maintenance'), [], WINDOW).status).toBe('unavailable');
    expect(evaluateWindow(resource('out_of_service'), [], WINDOW).status).toBe('unavailable');
  });

  it('no usa el estado "ocupado" actual del recurso para decidir una franja', () => {
    expect(evaluateWindow(resource('occupied'), [], WINDOW).status).toBe('available');
  });
});
