import { Model } from "../core/data/resources/model";

export class PaymentMethod extends Model {
  name: string = null;
  expiry_date: string = null;
  card_number_hint: string = null;
  expiration_date: string = null;
  card_type: string = null;
  card_holder_name: string = null;
  payment_medium_token_id: string = null;
  default: boolean = false;
  extra_data: any[] = [];

  resourceName(): string {
    return "profile/payments";
  }
}
