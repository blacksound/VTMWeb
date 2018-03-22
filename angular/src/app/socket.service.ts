import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Subject }           from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';

@Injectable()
export class SocketService {
  private url = 'http://localhost:7000/';  
  public socket: any;
  private subjects = {};

  constructor() {

    this.socket = io(this.url, { 
      query: "name=Foobrowser"
    });

    this.socket.on('connect', () => {
      console.log("Socket connected");
    });
  }

  connectTo(selector: string): Subject<any> {
    //get or create Subject:
    if (this.subjects[selector] === undefined) {
      let subject = new Subject();
      this.subjects[selector] = subject;
      this.socket.on(selector, (data: any) => {
        subject.next(data);
      });
    }
    return this.subjects[selector];
  }

  getNamespace(namespace: string): any {
    return io('http://localhost:7000/' + namespace);
  }

  //expose method socket.on:
  on(selector: string, callback: Function): void {
    new Promise((fulfill, reject) => {
      this.socket.emit('callback', {
      })
    });
    this.socket.on(selector, callback);
  } 

  //make a callback for attributes to send their values to the socketserver. Path is OSC-address
  makeCallback(path: string): Function {
    return (data) => {
      this.socket.emit('callback', {
        path: path,
        data: data
      });
    }
  }
}
