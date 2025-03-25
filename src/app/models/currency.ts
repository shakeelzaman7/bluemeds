import { Model } from "../core/data/resources/model";


export class Currency extends Model
{    
    public name: string = null;
    public code:string = null;
    public active:boolean = false

    resourceName?(): string {
        return "currencies"
    }
}