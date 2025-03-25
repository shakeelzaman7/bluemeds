import { IDefinesRelationships } from "../core/data/cast";
import { Model } from "../core/data/resources/model";
import { Role } from "./role";

export class User extends Model implements IDefinesRelationships {
    

    firstName: string = null
    lastName: string = null
    title: string = null
    gender: "Male" | "Female" | "Unknown" = "Unknown"
    phone: string  = null
    email: string = null    
    active: boolean = false    
    role?: Role = null
    countries?: [] = null

    defineRelationship?(): Object {
        return {
            role: Role
        }
    }

    resourceName?(): string {
        return "users";
    }
}