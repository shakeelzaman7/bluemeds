import { Model } from "../core/data/resources/model";

export class State extends Model {
    id: number = null;
    code: string = null;
    country_id: number = null;
    name: string = null;
    status: boolean = null;

    resourceName?(): string {
        return "profile/billing";
    }
}