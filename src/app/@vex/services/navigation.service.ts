import { Injectable } from '@angular/core';
import { NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading, NavigationAnchor } from '../interfaces/navigation-item.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

    items: NavigationItem[] = [];

  private _openChangeSubject = new Subject<NavigationDropdown>();
  openChange$ = this._openChangeSubject.asObservable();

  constructor() {}

  triggerOpenChange(item: NavigationDropdown) {
    this._openChangeSubject.next(item);
  }

  isLink(item: NavigationItem): item is NavigationLink {
    return item.type === 'link';
  }

  isDropdown(item: NavigationItem): item is NavigationDropdown {
    return item.type === 'dropdown';
  }

  isSubheading(item: NavigationItem): item is NavigationSubheading {
    return item.type === 'subheading';
  }

  isAnchor(item: NavigationItem): item is NavigationAnchor {
    return item.type === 'anchor';
  }

}
