import { Component } from '@angular/core';
import { Controller } from '../controller-classes/controller'
import { Slider } from '../controller-classes/slider'
import { MatSliderChange } from '@angular/material/slider'

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent {

  slider: Slider

  onMove (change: MatSliderChange) {
    this.slider.data.value = change.value;
    this.slider.callback(change.value);
  }
  value() {
    return this.slider.data.value;
  }
  update(slider: Slider) {
    this.slider = slider;
  }
  name() {
    return this.slider.data.name;
  }
}
