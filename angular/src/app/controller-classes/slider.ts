import { Controller } from './controller';
import { SliderComponent } from '../slider/slider.component'

interface SliderData {
  minval: number;
  maxval: number;
  value: number;
  name: string;
  step: number;
}

export class Slider extends Controller {

  data: SliderData;

  constructor (data: {}, callback: Function) {
    super(callback, SliderComponent);
    this.update(data);
  }

  update (data: { minval?: number; maxval?: number; value?: number; name?: string; step?: number;}) {
    
    //supply defaults:
    let { 
      minval = 0,
      maxval = 100,
      value = 0,
      name = "unnamed",
      step = 0.001
     } = data;
    
    this.data = {
      minval: minval,
      maxval: maxval,
      value: value,
      name: name,
      step: step
    };
  }
}
