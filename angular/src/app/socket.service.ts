import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Subject }           from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';

@Injectable()
export class SocketService {
  private url = 'http://localhost:7000';  
  private socket: any;
  subjects = {};

  constructor() {
    
    this.socket = io(this.url, { query: "name=Foo"});

    this.socket.on('init', () => {
      console.log("Socket connected");
    });

    // create a Subject for each selector
    ["makeController"].forEach((selector) => {
      let subject = new Subject();
      this.subjects[selector] = subject;
      this.socket.on(selector, (data: any) => {
        subject.next(data);
      });
    });
  }

  getMethod(type: string): any {
    return this.subjects[type];
  }

  //make a callback for controllers to send their values to the socketserver. Path is OSC-address
  makeCallback(path: string): Function {
    return (data) => {
      this.socket.emit('callback', {
        path: path,
        data: data
      });
    }
  }
}
