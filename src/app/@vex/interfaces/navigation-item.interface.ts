import { Icon } from '@visurel/iconify-angular';

export type NavigationItem = NavigationLink | NavigationDropdown | NavigationSubheading | NavigationAnchor;

export interface NavigationLink {
  type: 'link';
  route: string | any;
  fragment?: string;
  label: string;
  icon?: Icon;
  isLogged: boolean;
  routerLinkActiveOptions?: { exact: boolean };
  isHeaderNav?: boolean;
  badge?: {
    value: string;
    bgClass: string;
    textClass: string;
  };
}

export interface NavigationAnchor {
  type: 'anchor';
  href: string | any;
  fragment?: string;
  label: string;
  icon?: Icon;
  isLogged: boolean;
  routerLinkActiveOptions?: { exact: boolean };
  isHeaderNav?: boolean;
  badge?: {
    value: string;
    bgClass: string;
    textClass: string;
  };
}

export interface NavigationDropdown {
  type: 'dropdown';
  label: string;
  icon?: Icon;
  isLogged: boolean;
  children: Array<NavigationLink | NavigationDropdown>;
  isHeaderNav?: boolean;
  badge?: {
    value: string;
    bgClass: string;
    textClass: string;
  };
}

export interface NavigationSubheading {
  type: 'subheading';
  label: string;
  children: Array<NavigationLink | NavigationDropdown>;
  isLogged: boolean;
  isHeaderNav?: boolean;
}

