import { Model } from "../core/data/resources/model";


export class Application extends Model
{    

    public name: string = null;
    public description:string = null;
    public img:string = null;
    public url?: string = null
    public active:boolean = false
    public token?:string = null
    public svg?:string = null;
    public color?:string = null;

    resourceName?(): string {
        return "apps"
    }
}