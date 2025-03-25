import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  async me(): Promise<any> {
    return this.get("me").toPromise();
  }

  public static current: ApiService;

  get url(): string {
    return this.protocol + environment.serverDomain + environment.api.endpoint ;
  }

  constructUrl(endpoint:string, addKey:boolean = true)
  {
    return this.url + "/" + endpoint;
  }

  get protocol() : string
  {
    return environment.secure ? 'https://' : 'http://';
  }

  constructor(private http: HttpClient) {
    ApiService.current = this;
  }

  postRaw(url: string, body?: any, reqOpts?: any) {
    return this.http.post(url, body, reqOpts);
  }

  getRaw<T = any>(url: string, queryParams?: Record<string, string | number | boolean>, reqOpts: {
    headers?: HttpHeaders;
    observe?: 'body';
  } = { observe: 'body' }) {
    const options = {
      ...reqOpts,
      params: queryParams ? new HttpParams({ fromObject: queryParams }) : undefined
    };

    return this.http.get<T>(url, options);
  }

  get<T = any>(endpoint: string, params?: any, reqOpts?: any) {
    return this.getRaw<T>(this.url + '/' + endpoint, params, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.url + '/' + endpoint, body, reqOpts).toPromise<any>();
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
  }
}
