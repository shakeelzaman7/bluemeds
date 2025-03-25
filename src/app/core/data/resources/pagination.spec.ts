import { Model } from "./model";
import { Pagination } from "./pagination";

class MockModel extends Model {
    
    resourceName?(): string {
        return "mock"
    }
}

describe("Pagination", () => {
    it("should cast to the data type on the data property", () => {
        let data = {
            success: false,
            data: [{id: 1}, {id: 2}, {id: 3}],
            meta: null
        }
        let pagination = new Pagination(MockModel, data)
        expect(pagination.data[0]).toBeInstanceOf(MockModel)
    });

    it("should handle null data", () => {
        let data = {
            success: false,
            data: null,
            meta: null
        }
        let pagination = new Pagination(MockModel, data)
        expect(pagination.data).toEqual([])        
    });
})