import { Model } from "../core/data/resources/model";


export class Country extends Model
{    
    public name: string = null;
    public default_currency:string = null;
    public active:boolean = false
    public code: string = null;
    resourceName?(): string {
        return "countries"
    }
}