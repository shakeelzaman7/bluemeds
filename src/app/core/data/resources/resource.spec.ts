import { Model } from "./model";
import { Pagination } from "./pagination";
import { Resource } from "./resource";
import { IResourceDataHandler } from "./resource-data-handler";

class MockModel extends Model {
    public name: string = null
    resourceName?(): string {
        return "mock1"
    }
}


class MockData implements IResourceDataHandler
{
    update<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
      throw new Error("Method not implemented.");
    }
    async destroy<T extends Model>(resource: Resource<T>, model: T): Promise<boolean> {
      return false
    }
    async show<T extends Model>(resource: Resource<T>, id: number): Promise<T> {
      return new resource.base()
    }
    async store<T extends Model>(resource: Resource<T>, model: T, morph?: any): Promise<T> {
      return new resource.base()
    }
    mock1 = [{id:1, name:"mock"}]
    mock2 = [{id:1, name:"mock1"}]

    async getIndex<T extends Model>(resource: Resource<T>): Promise<Pagination<T>> {
        
        let mockResponse = {
            success: true,
            data: this[resource.resourceName],
            meta: null
        };
  
        return new Pagination(resource.base, mockResponse)
    }
}


describe("Resource", () => {
    let resource: Resource<MockModel>
    

    it('should be created', () => {
        resource = new Resource(MockModel)
        expect(resource).toBeTruthy();
      });
    
    it('should throw on failed definition', () => {        
        expect(() => {resource = new Resource(null)}).toThrowError();
      });

    it('data handler can be assigned in constructor', () => {        
        resource = new Resource(MockModel, {} as IResourceDataHandler)
        expect(resource.dataHandler).toBeTruthy();
      });
    
    it('resourceName is assigned in constructor', () => {        
        resource = new Resource(MockModel, {} as IResourceDataHandler)
        expect(resource.resourceName).toBe("mock1");
      });

    it('can assign data handler', () => {        
        resource = new Resource(MockModel)
        resource.withDataHandler({} as IResourceDataHandler)
        expect(resource.dataHandler).toBeTruthy();
      });

    
})


describe("Resource + IndexMethod", () => {
    let resource: Resource<MockModel>

    it('should fail if data handler is not set', async () => { 
        resource = new Resource(MockModel)
        await expectAsync(resource.index()).toBeRejectedWith(new Error("Resource.index data handler was not set"))       
      });

    it('can extract index from data handler', async () => { 
        resource = new Resource(MockModel, new MockData())
        let pagination = await resource.index()
        expect(pagination.success).toBe(true)
        expect(pagination.data[0].name).toBe("mock")
        expect(pagination.data[0].id).toBe(1)
        
      });

    
})