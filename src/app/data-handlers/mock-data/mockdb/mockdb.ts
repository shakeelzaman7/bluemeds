import { applications } from "./applications";
import { profiles } from "./profiles";
import { role_profiles } from "./roleprofiles";
import { roles } from "./roles";
import { users } from "./users";

export const mockdb = {
    "apps": applications,
    "users": users,
    "roles": roles,
    "profiles": profiles,
    "role_profiles": role_profiles
}