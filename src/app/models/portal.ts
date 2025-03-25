import { Model } from "../core/data/resources/model";
interface PublicationConfig
{
    price: number;
    currency_code: string;
}

export class Portal extends Model
{
    public name: string = null;
    public url:string = null;
    public active:boolean = false
    public config: PublicationConfig = null;

    resourceName?(): string {
        return "portals";
    }
}
