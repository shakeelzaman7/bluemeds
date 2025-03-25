import { IDefinesCollections, IDefinesRelationships } from "../core/data/cast";
import { Model } from "../core/data/resources/model";
import { Portal } from "./portal";
import { Product } from "./product";


export class Publication extends Model implements IDefinesRelationships, IDefinesCollections
{
    public product: Product = null;
    public code:string = null;
    public portalPublicationId:number = null;
    public active:boolean = false
    public portals: Portal[] = [];
    public priceText: string = null;
    public normalPriceText: number = null;
    public bluemedsPriceText : string = null;
    public discountText: string = null;
    public portalPriceText: string = null;
    public discountPercentage: string = null;
    public currencyCode: string = null;
    public currencySymbol: string = null;


    resourceName?(): string {
        return "publications"
    }

    defineRelationship?(): Object {
        return {
            product: Product
        }
    }

    defineCollections?(): Object {
        return {
            portals: Portal
        }
    }
}
