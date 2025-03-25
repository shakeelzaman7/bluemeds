import { Model } from "../core/data/resources/model";

export class RoleProfile extends Model {
    resourceName?(): string {
        return "role_profiles"
    }
    profileId: number = null
    roleId: number = null
    appId: number = null
}
