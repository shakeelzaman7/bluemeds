
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Type } from "@angular/core";
import { Model } from "./model"
import { Pagination } from "./pagination";
import { IResourceDataHandler } from "./resource-data-handler";

/**
 *  Provides access to the T resource 
 *  
 */
export class Resource<T extends Model> {
    base: new() => T;
    dataHandler: IResourceDataHandler
    resourceName:string
    private parentEndpoint = "";
    /**
     * Sets or changes data handler
     * 
     * @param data Data handler for queries
     * @returns this resource
     */
    public withDataHandler(data: IResourceDataHandler) {
        this.dataHandler = data;
        return this;
    }

    public endpoint() {
        return this.parentEndpoint + new this.base()
                .resourceName()
    }
    

    public getChildResource<Child extends Model>(base: new() => Child, parent: T): Resource<Child>
    {
        const child =  new Resource(base, this.dataHandler)
        child.parentEndpoint = this.endpoint() + "/" + parent.id + "/";
        return child;
    }

    public async rcp(endpoint:string, filters:any) {
        return this.dataHandler.rcp(this, endpoint, filters);
    }

    /**
     * 
     * @returns Paginated list for the selected resource in the selected data handler
     */
    public async index(params?:{[key: string]: number | boolean | string}) : Promise<Pagination<T>> {
        await this.checkDataHandler();
        return this.dataHandler.getIndex(this, params);
    } 

    public async storeRequirements(): Promise<any> {
        return await this.dataHandler.storeRequirements(this);
    }

    public async updateRequirements(model: T): Promise<any> {
        return await this.dataHandler.updateRequirements(this, model);
    }

    public async store(model: T, morph?:any): Promise<T> 
    {
        await this.checkDataHandler();
        
        let response : T = await this.dataHandler.store(this, model, morph);
        for(let key in morph)
        {
            response[key as string] = response;
        }
        return response;
    }

    private async checkDataHandler() {
        if(!this.dataHandler) throw new Error("Resource.index data handler was not set")
    }

    public async show(id: number): Promise<T> {
        await this.checkDataHandler();
        return this.dataHandler.show(this, id);
    }
    
    public async update(model: T, morph?:any): Promise<T> 
    {
        await this.checkDataHandler();
        let response = await this.dataHandler.update(this, model, morph);
        for(let key in morph)
        {
            response[key as string] = response;
        }
        return response;
    }

    public async destroy(model: T) : Promise<boolean> 
    {
        await this.checkDataHandler();
        return this.dataHandler.destroy(this, model);
    }    

    /**
     * 
     * @param base Type for the resource
     * @param dataHandler Data handler where queries will be made
     */
    constructor(base: new() => T, dataHandler?: IResourceDataHandler)
    {

        if(base == null) throw new Error("Resource: base param cannot be empty")
        
        this.base  = base;
        this.resourceName = new base().resourceName()

        if(dataHandler)
        {
            this.dataHandler = dataHandler;
        }
    }
}