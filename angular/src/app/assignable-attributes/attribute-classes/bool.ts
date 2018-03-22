import { Attribute } from './attribute';

export class Bool extends Attribute {


  constructor (name, callback: Function) {
    super(name, callback);
  }

  init (data: { value?: number; }) {
    
    //supply defaults:
    let { 
      value = 0
     } = data;
    
    this.value = value;
  }
}
