import { Injectable, OnInit }           from '@angular/core';
import { Observable }           from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';
import { SocketService } from './socket.service'
import { Controller }               from './controller-classes/controller';
import { Slider } from './controller-classes/slider'
import { of } from 'rxjs/observable/of';


const types = {
  slider: Slider
};


@Injectable()
export class ControllerService {

  controllers: Controller[] = [];
  subject: Subject<Controller>;

  constructor(private socketService: SocketService) {
    this.subject = new Subject();
    this.fetchControllers();

    //make some initial controllers for testing
    let pan = {
      name: 'pan',
      value: 0,
      minval: -1,
      maxval: 1,
      type: 'slider'
    };

    let amp = {
      name: 'amp',
      value: 1,
      minval: 0,
      maxval: 1,
      type: 'slider'
    };

    this.controllers.push(new Slider(pan, this.socketService.makeCallback('pan')));
    this.controllers.push(new Slider(amp, this.socketService.makeCallback('amp')));
  }

  fetchControllers(): void {
    this.socketService.socket.on('makeController', (msg: any) => {
      let data = JSON.parse(msg['args'][0]['value']); //first OSC arg is a JSON string
      this.makeController(data);
    });
  }

  makeController(data: {}) {
    let name = data['name'];
    //must have a name:
    if (name !== undefined) {
      let type = data['type']; //only 'slider' type at the moment
      let component = types[type];
      //must have a component
      if (component !== undefined) {
        let path: string = data['path'];
        if (path === undefined) {
          path = name;
        }
        let controller: Controller = new component(data, this.socketService.makeCallback(path));
        this.controllers.push(controller);
        this.subject.next(controller); //push the new controller to all subscribers
      }
    }
  }

  getControllers(): Observable<Controller[]> {
    //push all controllers typically to components on init
    return of(this.controllers);
  }

  updateControllers(): Observable<Controller> {
    //pushes new controllers one at a time as they are created
    return this.subject;
  }
}
