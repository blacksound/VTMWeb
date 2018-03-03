import { Controller } from './controller';
import { SliderComponent } from '../slider/slider.component'

export class Slider extends Controller {
  minval: number = 0;
  maxval: number = 100;

  constructor (public name: string) {
    super(name, SliderComponent)
  }
}
