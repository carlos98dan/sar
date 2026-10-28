import { Reservation } from './reservation.model';

export interface DashboardSummary {
  today: {
    reservations: number;
    pendingApproval: number;
    confirmed: number;
    cancelled: number;
  };
  resources: {
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  upcoming: Reservation[];
}
