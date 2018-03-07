import { Component } from '@angular/core';
import { Range } from '../assignable-attributes/attribute-classes/range'
import { MatSliderChange } from '@angular/material/slider'
import { ControllerComponent } from '../controller.component'


@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent extends ControllerComponent {

  range: Range;

  onMove (change: MatSliderChange) {
    this.range.value = change.value;
    this.range.callback(change.value);
  }
  value() {
    return this.range.value;
  }
  update(range: Range) {
    this.range = range;
  }
  name() {
    return this.range.name;
  }
}
