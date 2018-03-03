import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[controller-host]'
})
export class ControllerDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
