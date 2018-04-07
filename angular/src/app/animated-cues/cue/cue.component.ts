import { Component, OnInit } from '@angular/core';
import { Cue } from '../cue'
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';

    
@Component({
  selector: 'app-cue',
  templateUrl: './cue.component.html',
  styleUrls: ['./cue.component.css'],
  /*
  animations: [
    trigger('aState', [
      state('small', style({transform: 'scale(1)'})),
      state('large', style({transform: 'scale(4.2)'})),
      transition('small => large', animate('1s ease', keyframes([
        style({transform: 'scale(1)', offset: 0}),
        style({transform: 'scale(0.7) rotate(15deg)', offset: 0.15}),
        style({transform: 'scale(1)', offset: 0.3}),
        style({transform: 'scale(4.2)', offset: 1})
      ]))),
      transition('large => small', animate('1s ease', keyframes([
        style({transform: 'scale(4.2)', offset: 0}),
        style({transform: 'scale(5) rotate(-15deg)', offset: 0.15}),
        style({transform: 'scale(4.2)', offset: 0.3}),
        style({transform: 'scale(1)', offset: 1})
      ])))
    ])
  ]
  */
})
export class CueComponent implements OnInit {

  cue: Cue;

  constructor() { }

  ngOnInit() {
  }

  update(cue: Cue) {
    this.cue = cue;
  }

  delta(utc: number) {
    return this.cue.delta(utc);
  }

  text() {
    return this.cue.text;
  }

  color() {
    return this.cue.color;
  }
}
