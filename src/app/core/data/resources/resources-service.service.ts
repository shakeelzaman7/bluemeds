import { Injectable, Injector, Type } from '@angular/core';
import { environment } from 'src/environments/environment';
import { implementsInterface } from '../../helpers/string-helper';
import { Model } from './model';
import { Resource } from './resource';
import { IResourceDataHandler } from './resource-data-handler';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  constructor(private injector: Injector) { }

  dataHandler() : IResourceDataHandler
  {
    return this.injector.get(environment.currentDataHandler);
  }

  getResource<T extends Model>(type: new() => T): Resource<T> {
    return new Resource(type, this.dataHandler())
  }
}
