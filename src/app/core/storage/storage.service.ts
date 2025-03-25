import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageCache: Storage | null = null;

  private async getStorage(): Promise<Storage> {
    return this.storageCache ?? (await this.storage.create());
  }

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public async set(key: string, value: any) {
    return (await this.getStorage())?.set(key, value);
  }

  public async get(key: string, defaultValue?:any)
  {
    return (await (await this.getStorage())?.get(key)) ?? defaultValue;
  }

  public  async clear() {
    return await (await this.getStorage()).clear();
  }
}