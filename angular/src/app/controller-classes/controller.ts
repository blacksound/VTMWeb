import { Type } from '@angular/core';

export class Controller {

  constructor (public callback: Function, public component: Type<any> ) {
    
  }
}
