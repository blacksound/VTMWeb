import { Attribute } from './attribute';

export class Range extends Attribute {

  minval: number;
  maxval: number;
  step: number;
  value: number;

  constructor (name, callback: Function) {
    super(name, callback);
  }

  init (data: { minval?: number; maxval?: number; value?: number; step?: number;}) {
    
    //supply defaults:
    let { 
      minval = 0,
      maxval = 100,
      value = 0,
      step = 0.001
     } = data;
    
     this.minval = minval;
     this.maxval = maxval;
     this.value = value;
     this.step = step;
  }
}
