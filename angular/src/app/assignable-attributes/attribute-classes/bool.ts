import { Attribute } from './attribute';

export class Bool extends Attribute {

  value: boolean;

  constructor (name, callback: Function) {
    super(name, callback);
  }

  init (data: { value?: boolean; }) {
    
    //supply defaults:
    let { 
      value = false
     } = data;
    
    this.value = value;
  }
}
