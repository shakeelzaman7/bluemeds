import { Model } from "../core/data/resources/model";

export class Profile extends Model {

    name: string = null;
    appId: number = null;

    resourceName?(): string {
        return "profiles";
    }
}