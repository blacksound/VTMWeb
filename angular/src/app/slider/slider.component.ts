import { Component } from '@angular/core';
import { Controller } from '../controller-classes/controller'
import { Slider } from '../controller-classes/slider'
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent {

  value: Number;
  minval: Number;
  maxval: Number;
  name: String;

  update(slider: Slider) {
    this.value = slider.value;
    this.minval = slider.minval;
    this.maxval = slider.maxval;
    this.name = slider.name;
  }
}
