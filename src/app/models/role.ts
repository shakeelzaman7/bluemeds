import { Model } from "../core/data/resources/model";

export class Role extends Model {

    name: string = null
    description: string = null
    active: boolean = false

    resourceName?(): string {
        return "roles"
    }

}