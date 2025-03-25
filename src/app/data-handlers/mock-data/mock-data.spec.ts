import { Model } from 'src/app/core/data/resources/model';
import { Resource } from 'src/app/core/data/resources/resource';

import { MockDataHandler } from './mock-data';

class MockModel extends Model {
  resourceName?(): string {
    return "applications"
  }
  
}

describe('MockDataService', () => {
  let service: MockDataHandler;

  beforeEach(() => {
    service = new MockDataHandler();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getIndex retrieves data', async () => {
    let apps = await service.getIndex(new Resource(MockModel));
    expect(apps).toBeTruthy();
  });
 
  it('should provide real resource', async () => {
    await expectAsync(service.getIndex(null)).toBeRejectedWith(new Error("MockDataHandler: resource cannot be null"));
  });
});
