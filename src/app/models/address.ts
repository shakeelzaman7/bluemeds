import {Model} from "../core/data/resources/model";

export class Address extends Model {
  resourceName?(): string {
    return "profile/addresses"
  }

  name: string = null;
  address_line_1: string = null;
  state: string = null;
  notes: string = null;
  lat: number = null;
  lng: number = null;
  contactEmail: string = '';
  contactPhone: string = null;
  contact_phone_2: string = null;
  contactName: string = null;
  zone: string = null;
  state_id: string = null;
  city_id: string = null;
  zip_code: string = null;
}
