import { Injectable } from '@angular/core';
import { Observable} from 'rxjs/Rx'
import { Subject }           from 'rxjs/Subject';
import { SocketService } from '../socket.service'
import { Cue } from './cue'


@Injectable()
export class CueHandlerService {

  private cues: Cue[] = [];
  private observable: Subject<Cue>;
  private updateTrigger: Subject<void>; //trigger when update is needed

  constructor(private socketService: SocketService) {
    this.observable = new Subject();
    this.updateTrigger = new Subject();
    this.connectToSocket();

    //make some initial cues for testing
    //let id = setInterval(() => {
      
    //}, 300);
    let cont = this;
    function doSomething() {
      cont.addCue(Date.now() + 2000, 'red', 'cue 1');
    }

    (function loop() {
        var rand = Math.round((Math.random() * 1500) + 100);
        setTimeout(function() {
                doSomething();
                loop();  
        }, rand);
    }());
  }

  connectToSocket(): void {
    
    this.socketService.on('cues/add', (msg: any) => {
      let args = msg['args'];
      args.forEach(arg => {
        let data = JSON.parse(arg['value']); //OSC arg is a JSON string
        let utc = data['utc'];
        let text = data['text'];
        let color = data['color'];
        //must have a name:
        if (name !== undefined) {
          this.addCue(utc, text, color);
        }
        this.filterCues();
      });
    });
  }

  filterCues() {
    let now = Date.now();
    this.cues = this.cues.filter(cue => {
      return cue.pending(now);
    });
  }

  addCue(utc: number, color?: string, text?: string) {
    let cue: Cue = new Cue(utc, color, text);
    this.cues.push(cue);
    this.observable.next(cue);
  }

  getUpdateTrigger(): Observable<void> {
    return this.updateTrigger;
  }

  getCues(): Observable<Cue> {
    this.filterCues();
    //return all current and future cues:
    return Observable.merge(Observable.from(this.cues), this.observable);
  }
}
