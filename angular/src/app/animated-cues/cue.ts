import { Type } from '@angular/core';

export class Cue {

  constructor (public utc: number, public color?: string, public text?: string) {
    
  }

  pending(utc: number) {
    return this.utc > utc; 
  }

  delta(utc: number) {
    return this.utc - utc;
  }
}
