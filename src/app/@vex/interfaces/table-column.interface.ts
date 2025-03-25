export interface TableColumn<T> {
  label: string;
  buttonLabel?: string;
  property: string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'boolean' | 'transform' | 'date' | 'html';
  tooltip?:boolean;
  visible?: boolean;
  sorteable?:boolean;
  cssClasses?: string[];
  dateFormat?: string;
  color?:string;
  transform?: (a: T) => string
}
