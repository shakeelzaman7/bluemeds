import { Model } from "../core/data/resources/model";

export interface ProductDetails {
    complete_name:String
    healthcare_plan:String
    ingredient_1: String
    ingredient_2: String
    ingredient_3: String
    ingredient_4: String
    ingredient_5: String
    ingredient_6: String
    measurement: String
    product_class: String
    provider: String
    therapeutic_area: String
    concentration: String
    requires_recipe: boolean
}

export class Product extends Model
{    
    public name: string = null;
    public completeName: string = null;
    public healthcarePlan: string = null;
    public packaging: string = null;
    public presentation: string = null;
    public content: number = null;
    public productCode: string = null;
    public packagingUnit : string = null;
    public codeType: string = null;
    public code: string = null;
    public details: ProductDetails = null;
    public active:boolean = false;

    resourceName?(): string {
        return "products"
    }
}