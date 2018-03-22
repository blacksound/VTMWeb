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

  private socket;
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
    
    this.socket = this.socketService.getNamespace('attributes');
    this.socket.on('connect', () => {
      console.log('Attributes connected');
    });
    this.socket.on('add', (...specs) => {
      specs.forEach(spec => {
        let data = JSON.parse(spec); //OSC arg is a JSON string
        let name = data['name'];
        //must have a name:
        if (name !== undefined) {
          this.addAttribute(name, data);
        }
      });
    });

    this.socket.on('remove', (name: string) => {
      this.removeAttribute(name);
    });
    
    this.socket.on('removeMatching', (regex) => {
      this.removeAttributesMatching(regex);
    });

    this.socket.on('set', (name: string, val: number) => {
      this.setAttribute(name, val);
    });
  }

  select(name: string) {
    let filtered = this.attributes.filter(attribute => attribute.name === name);
    return filtered[0];
  }

  setAttribute(name: string, val: number) {
    this.select(name).value = val;
  }

  addAttribute(name: string, data: {}) {
    let valueType = data['type'];
    let valueClass = types[valueType];

    let callback = (val) => {
      this.socket.emit('set', name, val);
    }

    if (valueType !== undefined) {
      let attribute: Attribute = new valueClass(name, callback);
      attribute.init(data);
      this.attributes.push(attribute);
      this.observable.next(attribute); //push the new controller to all subscribers
    }
  }

  removeAttributesMatching(regex: any = /a^/) { //match nothing as default:
    regex = new RegExp(regex);
    this.attributes = this.attributes.filter(attribute => {
      return attribute.name.match(regex) === null;
    });
    this.updateTrigger.next();
  }

  removeAttribute(name: string) {
    this.attributes = this.attributes.filter(attribute => attribute.name !== name);
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
