import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RedirectService {
  private urlKey = '';

  constructor() { }

  setRedirectUrl(url: string): void {
    localStorage.setItem(this.urlKey, url);
  }

  getRedirectUrl(): string | null {
    return localStorage.getItem(this.urlKey);
  }

  clearRedirectUrl(): void {
    localStorage.removeItem(this.urlKey);
  }
}
