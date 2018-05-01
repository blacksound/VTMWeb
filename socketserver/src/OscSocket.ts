//imports:
import * as udp from "dgram";
import * as osc from 'osc-min';
import { EventEmitter } from 'events';
import { Subject } from 'rxjs/Subject';
import { Observable} from 'rxjs/Rx';

// for converting OSC timetag to unix time:
const TWO_POW_32 = 4294967296;
const UNIX_EPOCH = 2208988800;

export class OscSocket extends EventEmitter {
    private socket;
    private observable;
    private id_count = 999;
    
    constructor() {
        super();
        this.observable = new Subject();
    }

    packArgs(...args: any[]) {
        let newargs: any[] = [];

        args.forEach((arg) => {

            switch (typeof arg) {
                case "function": {
                    let id = this.nextID();
                    this.once("SocketIO/reply:" + id, (...args) => {
                        arg(...args);
                    });
                    newargs.push(
                        {
                            type: "string",
                            value: "SOCKETIO-REPLY-ID:" + id
                        }
                    );
                    break;
                }
                case "object": {
                    newargs.push(
                        {
                            type: "string",
                            value: JSON.stringify(arg)
                        } 
                    );
                    break;
                }
                default: {
                    newargs.push(
                        {
                            type: typeof arg,
                            value: arg
                        } 
                    );
                    break;
                }
            }
        });
        return newargs;
    }

    static makeOSCbuf(address, args): Buffer {
        
        let buf = osc.toBuffer({
            address: address,
            args: args
        });

        return buf;
    }

    static unpackArgs(...args) {

    }

    parse(msg, rinfo) {
        let parsed = osc.fromBuffer(msg);
        let messages: any[] = [];
        let utc: number;

        let unbundle = (element: any) => {
            if (element["oscType"] == "bundle") {
                // osc-min timetag is calculated wrong (uses int32, should be uint32)
                // Timetag from first bundle is re-calculated and put in each message as utc (milliseconds since 1970-01-01)
         
                let dataview = new DataView(msg.buffer); //make sure it's big endian
                let seconds = dataview.getUint32(8, false); //timetag seconds is byte num 8-11
                let fractional = dataview.getUint32(12, false); //timetag fractional is byte num 12-15
                let utc = Math.round((seconds + (fractional / TWO_POW_32) - UNIX_EPOCH) * 1000);    
                
                for (let el of element["elements"]) {
                    //el["utc"] = utc;
                    unbundle(el); //recursive unbundle
                }
            } else {
                messages.push(element);
            }
        }

        unbundle(parsed);

        for (let message of messages) {
            let address = message["address"].replace(/^\//g, ''); //remove leading slash
            let args = message['args'];
            let newargs = [];

            /*
            if utc exists (eg. sent as bundle), then put utc as first argument
            */
            
            if (utc !== undefined) {
                newargs.push(utc);
            }

            args.forEach(element => {
                //if argument is a string of 'OSCSOCKET-REPLY-ID:num', then make a reply callback with ID
                if ((typeof element["value"] === 'string') && (element["value"].indexOf('SOCKETIO-REPLY-ID:') > -1)) {
                    //match:
                    let request_id: string = element["value"].slice(18);
                    let callback = (...args) => {
                        let newargs = this.packArgs(request_id, ...args);
                        let buf = OscSocket.makeOSCbuf("/SocketIO/reply", newargs);
                        this.socket.send(buf, 0, buf.length, rinfo['port'], rinfo['address']);
                    };
                    element["value"] = callback;
                }
                newargs.push(element["value"]);
            });

            switch (address) {

                case 'SocketIO/connect':
                    let [id, url, options, callback] = newargs;
                    let newID = this.nextID();
                    id = newID;
                    let oscSendFunc = (event, ...args) => {
                        let newargs = this.packArgs(id, event, ...args);
                        let buf = OscSocket.makeOSCbuf("/SocketIO/emit", newargs);
                        this.socket.send(buf, 0, buf.length, rinfo['port'], rinfo['address']);
                    }
                    let observable = Observable.merge(this.observable).filter((data) => {
                        return (data['rinfo']['port'] == rinfo['port']) 
                        && (data['rinfo']['address'] == rinfo['address'])
                        && (id == data['id']);
                    });
                    let callbackWrap = () => {
                        callback(newID);
                    }
                    let osc_connection = new OscConnection(oscSendFunc, observable);
                    this.emit('connect', osc_connection, url, options, callbackWrap);
                    break;

                case 'SocketIO/emit':
                    this.observable.next({
                        rinfo: rinfo,
                        id: newargs[0],
                        event: newargs[1],
                        args: newargs.slice(2)
                    });
                    break;
                
                case 'SocketIO/schedEmit':
                    this.observable.next({
                        rinfo: rinfo,
                        id: newargs[0],
                        event: newargs[1],
                        args: [utc].concat(newargs.slice(2))
                    });
                    break;
                
                case "SocketIO/reply":
                    this.emit("SocketIO/reply:" + newargs[0], ...newargs.slice(1));
                    break;
                default:
                    this.emit(address, ...newargs);
            }
        }
    }

    nextID (){
        this.id_count += 1;
        return "id" + this.id_count.toString();
    }

    listen(port: number = 8002, ip: string = "127.0.0.1") {
        this.socket = udp.createSocket("udp4", (msg, rinfo) => {
            this.parse(msg, rinfo);
        });
        this.socket.bind(port, ip);
    }
}

export class OscConnection extends EventEmitter {
    
    constructor(private callback, private observable: Observable<any>) {
        super();
        observable.subscribe((data) => {
            this.emit(data['event'], ...data['args']);
        });
    }

    send (event, ...args) {
        this.callback(event, ...args);
    }
}
