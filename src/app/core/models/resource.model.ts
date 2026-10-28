export type ResourceAvailability = 'available' | 'occupied' | 'maintenance' | 'out_of_service';

export interface ResourceRef {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  code: string;
  name: string;
  category: string;
  siteId: string;
  siteName: string;
  location: string;
  capacity: number;
  availability: ResourceAvailability;
  /** ISO 8601 con zona horaria, o null si no tiene reservas próximas. */
  nextReservationAt: string | null;
}
