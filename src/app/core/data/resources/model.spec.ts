import { Model } from "./model";

class ModelMock extends Model {
    resourceName?(): string {
        return "mock_model"
    }
}

class MockModelWithoutResourceName extends Model {
    
    resourceName?(): string {
        return null
    }
}

describe("Model", () => {
    let model = new ModelMock();
    it('should be created', () => {
        expect(model).toBeTruthy();
      });

    it('should have a resourceName', () => {
        expect(model.resourceName()).toBeTruthy()
    })

    it('should throw if resourceName is null', () => {
        expect(() => {
            const failedModel = new MockModelWithoutResourceName();
        }).toThrowError()
    })
})