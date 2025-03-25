import { Injectable } from '@angular/core';
import { Model } from 'src/app/core/data/resources/model';
import { Pagination } from 'src/app/core/data/resources/pagination';
import { Resource } from 'src/app/core/data/resources/resource';
import { IResourceDataHandler } from 'src/app/core/data/resources/resource-data-handler';
import { mockdb } from './mockdb/mockdb';

@Injectable()
export class MockDataHandler implements IResourceDataHandler {
    rcp<T extends Model>(resource: Resource<T>, endpoint: string, filters: any): Promise<Pagination<T>> {
        throw new Error('Method not implemented.');
    }
    requirementsParam(): string {
        throw new Error('Method not implemented.');
    }

    storeRequirements<T extends Model>(resource: Resource<T>): Promise<any> {
        throw new Error('Method not implemented.');
    }

    updateRequirements<T extends Model>(resource: Resource<T>, model: T): Promise<any> {
        throw new Error('Method not implemented.');
    }

    async update<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
        if (!resource) throw new Error("MockDataHandler: resource cannot be null")

        let index = mockdb[resource.resourceName].findIndex((res) => res.id === model.id);

        if(index < 0) {
            return mockdb[resource.resourceName][index] = model
        }
        return model;
    }

    async destroy<T extends Model>(resource: Resource<T>, model: T): Promise<boolean> {
        if (!resource) throw new Error("MockDataHandler: resource cannot be null")

        let index = mockdb[resource.resourceName].findIndex((res) => res.id === model.id);

        if(index < 0) return false;
        
        mockdb[resource.resourceName].splice(index,1);

        return true;
    }



    async store<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
        if (!resource) throw new Error("MockDataHandler: resource cannot be null")
        //Object.assign(model, morph)
        const collection: T[] = mockdb[resource.resourceName];
        let id = Math.max.apply(Math, collection.map(function (o) { return o.id; }))
        id = id < 0 ? 1 : id + 1;
        model.id = id;
        mockdb[resource.resourceName].push(model)

        return model;
    }

    isValidByParams<T extends Model>(model:T, params?:{[key: string]: number | boolean | string}): boolean
    {        
        return !Object.keys(params).find(k => !model.hasOwnProperty(k) || model[k] != params[k])
    }

    async getIndex<T extends Model>(resource: Resource<T>, params?:{[key: string]: number | boolean | string}): Promise<Pagination<T>> {

        if (!resource) throw new Error("MockDataHandler: resource cannot be null")

        let data = [];
        
        mockdb[resource.resourceName].forEach(element => {
            if(!params || this.isValidByParams(element, params))
                data.push(element)                             
        });

        let mockResponse = {
            success: true,
            data: data,
            meta: {
                "current_page": 1,
                "from": 1,
                "last_page": 9,
                "path": "http:\/\/45.33.24.50.nip.io\/api\/currencies",
                "per_page": 20,
                "to": 20,
                "total": 178
            }
        };

        return new Pagination(resource.base, mockResponse)
    }

    show<T extends Model>(resource: Resource<T>, id: number): Promise<T> {
        if (!resource) throw new Error("MockDataHandler: resource cannot be null")

        return mockdb[resource.resourceName].find(res => res.id == id)
    }
}
