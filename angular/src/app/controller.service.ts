import { Injectable, OnInit }           from '@angular/core';
import { Observable }           from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';
import { SocketService } from './socket.service'
import { Controller }               from './controller-classes/controller';
import { Slider } from './controller-classes/slider'
import { of } from 'rxjs/observable/of';

let types = {
  slider: Slider
};

@Injectable()
export class ControllerService {

  controllers: Controller[] = [];
  observable: Observable<Controller[]>;
  subject: Subject<Controller>;

  constructor(private socketService: SocketService) {
    
    this.controllers = [
      new Slider("amp"),
      new Slider("pan")
    ];

    this.subject = new Subject();
    this.fetchControllers();
  }

  fetchControllers(): void {
    this.socketService.getMethod("makeController").subscribe(data => {
      let args = data['args'];
      let name = args[0]['value'];
      let type = types[args[1]['value']]; //only 'slider' type at the moment
      let value = args[2]['value'];
      let controller: Controller = new type(name);
      controller.value = value;
      this.controllers.push(controller);
      this.subject.next(controller);
    });
  }

  getControllers(): Observable<Controller[]> {
    return of(this.controllers);
  }

  updateControllers(): Observable<Controller> {
    return this.subject;
  }
}
