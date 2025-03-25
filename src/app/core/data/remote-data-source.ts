import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable } from "rxjs";
import { Model } from "./resources/model";
import { Resource } from "./resources/resource";

export class ResourceDataSource<T extends Model> implements DataSource<Resource<T>>
{
    private resource: Resource<T>;
    private lessonsSubject = new BehaviorSubject<T[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    constructor(resource: Resource<T>) {
        this.resource = resource;
    }

    connect(collectionViewer: CollectionViewer): Observable<readonly any[]> {
        return this.lessonsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.lessonsSubject.complete();
        this.loadingSubject.complete();
    }

    async execute(endpoint: string, params: any, filter: string,
        sortDirection: string,
        pageIndex: number,
        pageSize: number, search?: string) {
        this.loadingSubject.next(true);
        params = params ?? {};
        params = Object.assign(params, this.indexParams(filter,
            sortDirection,
            pageIndex,
            pageSize, search))

        const pag = await this.resource.rcp(endpoint, params);
        this.lessonsSubject.next(pag.data);
        this.loadingSubject.next(false)
        return pag;
    }

    async loadResource(filter: string,
        sortDirection: string,
        pageIndex: number,
        pageSize: number, search?: string) {
        this.loadingSubject.next(true);

        const pag = await this.resource.index(this.indexParams(filter,
            sortDirection,
            pageIndex,
            pageSize, search));
        this.lessonsSubject.next(pag.data);
        this.loadingSubject.next(false)
        return pag;
    }

    indexParams(filter: string, sortDirection: string, pageIndex: number, pageSize: number, search?: string): any {
        const filters: any = {}
        if (filter) {
            filters.sort = filter;
            if (sortDirection) {
                filters.sort = sortDirection == "desc" ? "-" + filters.sort : filters.sort;
            }
        }

        pageIndex = pageIndex ? pageIndex : 0;
        pageSize = pageSize ? pageSize : 20;

        if (pageIndex > 0) {
            filters.page = pageIndex;
        }

        if (search) {
            filters["filter[search]"] = search;
        }
        return filters;
    }

}