import { Model } from "./model";
import { Pagination } from "./pagination";
import { Resource } from "./resource";

/**
 * Provides the structure for a DataHandler
 */
export interface IResourceDataHandler {
    
    rcp<T extends Model>(resource: Resource<T>, endpoint: string, filters: any): Promise<Pagination<T>>;

    requirementsParam() : string;

    /**
     * 
     * @param resource The resource to be queried
     * 
     * @returns Paginated list for the selected resource
     */
    destroy<T extends Model>(resource: Resource<T>, model: T): Promise<boolean>;

    /**
     * 
     * @param resource The resource to be queried
     * 
     * @returns Paginated list for the selected resource
     */
    getIndex<T extends Model>(resource: Resource<T>, params?:{[key: string]: number | boolean | string}): Promise<Pagination<T>>;


    /**
     * @param resource The resource requirements to be queried
     * @param model The model to be stored
     * @param morph [optional] Modifies the model
     * 
     * @returns Paginated list for the selected resource
     */
    storeRequirements<T extends Model>(resource: Resource<T>): Promise<any>;

    /**
     * @param resource The resource requirements to be queried
     * @param model The model to be stored
     * @param morph [optional] Modifies the model
     * 
     * @returns Paginated list for the selected resource
     */
    updateRequirements<T extends Model>(resource: Resource<T>, model: T): Promise<any>;

    /**
     * @param resource The resource to be queried
     * @param model The model to be stored
     * @param morph [optional] Modifies the model
     * 
     * @returns Paginated list for the selected resource
     */
    store<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T>;

    /**
    * @param resource The resource to be queried
    * @param model The model to be stored
    * @param morph [optional] Modifies the model
    * 
    * @returns Paginated list for the selected resource
    */
    show<T extends Model>(resource: Resource<T>, id: number): Promise<T>;

    /**
    * @param resource The resource to be queried
    * @param model The model to be stored
    * @param morph [optional] Modifies the model
    * 
    * @returns Paginated list for the selected resource
    */
    update<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T>;
}