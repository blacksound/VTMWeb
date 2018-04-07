import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[cue-host]'
})
export class CuesDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
