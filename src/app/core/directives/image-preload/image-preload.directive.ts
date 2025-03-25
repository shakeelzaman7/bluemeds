import {Directive, Input, HostBinding} from '@angular/core'
@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'img[default]',
  host: {
    '(error)':'updateUrl()',
    '(load)': 'load()',
    '[src]':'src'
    }
})

export class ImagePreloadDirective {
  @Input() src:string;
  @Input() default:string;
  @Input() lastResort:string;
  @HostBinding('class') className;

  updateUrl() {
    if(this.src == this.default)
    {      
      this.src = this.lastResort;
    }
    else
    {
      this.src = this.default
    }
  }
  load(){
    this.className = 'image-loaded';
  }
}