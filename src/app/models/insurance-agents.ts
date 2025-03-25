import { Model } from "../core/data/resources/model";

export class InsuranceAgent extends Model
{    
    public name: string = null;

    resourceName?(): string {
        return "insurance-agents"
    }
}