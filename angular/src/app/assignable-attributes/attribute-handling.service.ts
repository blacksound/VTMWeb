import { Injectable }           from '@angular/core';
import { Observable} from 'rxjs/Rx'
import { Subject }           from 'rxjs/Subject';
import { SocketService } from '../socket.service'
import { Attribute }               from './attribute-classes/attribute'
import { Range } from './attribute-classes/range'
import { Bool } from './attribute-classes/bool'

const types = {
  range: Range,
  bool: Bool
};

@Injectable()
export class AttributeHandlingService {

  private attributes: Attribute[] = [];
  private observable: Subject<Attribute>;
  private updateTrigger: Subject<void>; //trigger when update is needed, ie. on removal of attributes

  constructor(private socketService: SocketService) {
    this.observable = new Subject();
    this.updateTrigger = new Subject();
    this.connectToSocket();

    //make some initial attributes for testing
    this.addAttribute('test.pan', {
      value: 0,
      minval: -1,
      maxval: 1,
      type: 'range'
    });

    this.addAttribute('test.amp', {
      value: 1,
      minval: 0,
      maxval: 1,
      type: 'range'
    });
  }

  connectToSocket(): void {
    
    this.socketService.on('attributes/add', (msg: any) => {
      let args = msg['args'];
      args.forEach(arg => {
        let data = JSON.parse(arg['value']); //OSC arg is a JSON string
        let name = data['name'];
        //must have a name:
        if (name !== undefined) {
          this.addAttribute(name, data);
        }
      });
    });

    this.socketService.on('attributes/remove', (msg: any) => {
      let regex = msg['args'][0]['value']; //first OSC argument (should be string)
      this.removeAttributesMatching(regex);
    });
  }

  addAttribute(name, data: {}) {
    let valueType = data['type'];
    let valueClass = types[valueType];
    if (valueType !== undefined) {
      let attribute: Attribute = new valueClass(name, this.socketService.makeCallback(name));
      attribute.init(data);
      this.attributes.push(attribute);
      this.observable.next(attribute); //push the new controller to all subscribers
    }
  }

  removeAttributesMatching(regex: any = /a^/) { 
    regex = new RegExp(regex); //match nothing as default:
    this.attributes = this.attributes.filter(attribute => {
      return attribute.name.match(regex) === null;
    });
    this.updateTrigger.next();
  }

  removeAllAttributes() {
    this.attributes = [];
    this.updateTrigger.next();
  }

  getUpdateTrigger(): Observable<void> {
    return this.updateTrigger;
  }

  getAttributes(regex: any = /[\s\S]*/): Observable<Attribute> {  
    regex = new RegExp(regex); //match all as default:
    //return all current and future attributes, filtered by regex:
    return Observable.merge(Observable.from(this.attributes), this.observable).filter((attribute: Attribute) => {
      return attribute.name.match(regex) !== null;
    });
  }
}
