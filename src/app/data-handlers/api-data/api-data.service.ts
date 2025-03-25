import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Cast } from "src/app/core/data/cast";
import { Model } from "src/app/core/data/resources/model";
import { Pagination, PaginationBase } from "src/app/core/data/resources/pagination";
import { Resource } from "src/app/core/data/resources/resource";
import { IResourceDataHandler } from "src/app/core/data/resources/resource-data-handler";
import { snakeCaseObject } from "src/app/core/helpers/string-helper";
import { environment } from "src/environments/environment";
import { ApiDataHandlerParams } from "./api-data-handler-params";

class Response<T> {
  data:T
}

export class Requirements {
  requirements: any = [];
  inputs: any = [];
  allowedTypes: string[] = ["string", "integer"]
  
  transformAllowedTypesToInputType = [
    {"text" : ["string", "alpha"]},
    {"number": ["integer", "double"]}
  ];

  required(inputName: string):boolean
  {
    return this.requirements[inputName]?.includes("required");
  }

}

@Injectable()
export class ApiDataService implements IResourceDataHandler {
  private config: ApiDataHandlerParams

  constructor(private http: HttpClient) {
    this.config = environment.dataHandlerParams
  }
  async rcp<T extends Model>(resource: Resource<T>, endpoint: string, filters: any): Promise<Pagination<T>> {
    let build: PaginationBase =
      await this.http.get<PaginationBase>(this.config.baseUrl + resource.endpoint() + "/" + endpoint, {
          params: filters
        })
        .toPromise();
    return new Pagination(resource.base, build)
  }
  requirementsParam(): string {
    return "_endpoint_rules"
  }
  async storeRequirements<T extends Model>(resource: Resource<T>): Promise<Requirements> {
    return  Cast.cast(Requirements, (await this.http.post<Response<Requirements>>(this.config.baseUrl + resource.endpoint() + "?" + this.requirementsParam(), {}).toPromise()).data)
  }
  async updateRequirements<T extends Model>(resource: Resource<T>, model: T): Promise<Requirements> {
    return  Cast.cast(Requirements, (await this.http.put<Response<Requirements>>(this.config.baseUrl + resource.endpoint() + "/" + model.id + "?" + this.requirementsParam(), {}).toPromise()).data)
  }

  async destroy<T extends Model>(resource: Resource<T>, model: T): Promise<boolean> {
    const response = await this.http.delete<Response<T>>(this.config.baseUrl + resource.endpoint() + "/" + model.id).toPromise();
    return true
  }

  async getIndex<T extends Model>(resource: Resource<T>, params?: { [key: string]: string | number | boolean; }): Promise<Pagination<T>> {
    let build: PaginationBase =
      await this.http.get<PaginationBase>(this.config.baseUrl + resource.endpoint(), {
          params: params
        })
        .toPromise();
    return new Pagination(resource.base, build)
  }

  async store<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
    if(morph)
      Object.assign(model, morph)
    const response =  await this.http.post<Response<T>>(this.config.baseUrl + resource.endpoint(), snakeCaseObject(model)).toPromise()
    return Cast.cast(resource.base, response.data);
  }

  async show<T extends Model>(resource: Resource<T>, id: number): Promise<T> {
    const response = await this.http.get<Response<T>>(this.config.baseUrl + resource.endpoint() + "/" + id).toPromise();
    return Cast.cast(resource.base, response.data);
  }

  async update<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
    if(morph)
      Object.assign(model, morph)
    const response =  await this.http.put<Response<T>>(this.config.baseUrl + resource.endpoint() + "/" + model.id, snakeCaseObject(model)).toPromise()
    return Cast.cast(resource.base, response.data);
  }
}
