import { Cast, IDefinesCollections } from "../cast"
import { Model } from "./model"

/**
 * Provides the basic model of a pagination
 */
export class PaginationBase {
    
    success:boolean = false
    data: any[] = null
    meta:any = null

    constructor(data: PaginationBase) {
        this.success = data.success
        this.data = data.data
        this.meta = data.meta
    }
}

/**
 * A pagination of an specific module
 */
export class Pagination<T extends Model> extends PaginationBase {
    
    data: T[] = null

    /**
     * Creates a new Pagination
     * @param model Type of the model to be used
     * @param data Data to be imported in the pagination
     */
    constructor(model : new() => T, data: PaginationBase)
    {
        super(data)
        this.data = []

        
        data.data?.forEach(element => {
            this.data.push(Cast.cast(model, element))
        });

        if(data.meta)
        {
            this.meta = data.meta;
        }
        else {
            this.meta = {};
            this.meta.page_size = data["per_page"]
            this.meta.current_page = data["current_page"]
            this.meta.total = data["total"]
        }
    }
}
