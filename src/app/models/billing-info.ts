import { Model } from "../core/data/resources/model";
import { Address } from "./address";

export class BillingInfo extends Model {
    name: string = null;
    personalIdentityNumber: string = null;
    address: string = null;
    userId: number = null;
    state_id: string = null;
    city_id: string = null;
    zip_code: string = null;
    addressToUse: string = null;

    resourceName?(): string {
        return "profile/billing";
    }
}
