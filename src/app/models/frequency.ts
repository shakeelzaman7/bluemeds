import { Model } from "../core/data/resources/model";

export class Frequency extends Model
{    
    public name: string = null;
    public freqDays: string = null;

    resourceName?(): string {
        return "frequencies"
    }
}