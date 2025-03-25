import { Model } from "../core/data/resources/model";

export class MedicineRequest extends Model {
    resourceName(): string {
        return "medicine-requests";
    }

    contact_name: string = null;
    contact_phone: string = null;
    contact_email: string = null;
    pharmacy: string = null;
    medicine_name: string = null;
    
}

