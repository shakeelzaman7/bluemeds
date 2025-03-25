export interface FilterProductsResponse {
  products: Product[];
  message: string;
}

export interface Product {
  portal_publication_id: number;
  product_name: string;
  selected?: boolean;
}

// interface for events calendar
export interface CalendarEventResponse {
  dates: EventDates;
  message: string;
}

export interface EventDates {
  next_orders: NextOrders;
  past_orders: DeliveredDate[];
}

export interface NextOrders {
  delivery_dates: string[];
  payment_dates: string[];
}

export interface DeliveredDate {
  order_id: number;
  delivery_date: string;
  payment_date: string | null;
}
