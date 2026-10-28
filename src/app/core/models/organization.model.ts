export interface Organization {
  id: string;
  name: string;
  taxId: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
}
