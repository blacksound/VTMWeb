import { Type } from '@angular/core';

export class Controller {
  value: Number = 0;
  constructor (public name: string, public component: Type<any> ) {
    
  }
}
