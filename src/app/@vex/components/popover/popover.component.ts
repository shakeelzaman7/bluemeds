import { Component, OnInit, TemplateRef, Type } from '@angular/core';
import { PopoverContent, PopoverRef } from './popover-ref';
import { popoverAnimation } from '../../animations/popover.animation';

@Component({
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  animations: [popoverAnimation]
})
export class PopoverComponent implements OnInit {
  renderMethod: 'template' | 'component' | 'text' = 'component';
  content: PopoverContent;
  context;

  constructor(private popoverRef: PopoverRef) {
  }

  get contentTemplate() : TemplateRef<any> {
    return this.content as any;
  }

  get contentComponent() : Type<any> {
    return this.content as any;
  }

  ngOnInit() {
    this.content = this.popoverRef.content;

    if (typeof this.content === 'string') {
      this.renderMethod = 'text';
    }

    if (this.content instanceof TemplateRef) {
      this.renderMethod = 'template';
      this.context = {
        close: this.popoverRef.close.bind(this.popoverRef)
      };
    }

  }
}
