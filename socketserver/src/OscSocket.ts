//imports:
import * as udp from "dgram";
import * as osc from 'osc-min';
import { EventEmitter } from 'events';

// for converting OSC timetag to unix time:
const TWO_POW_32 = 4294967296;
const UNIX_EPOCH = 2208988800;

export class OscSocket extends EventEmitter {
    private socket;
    port: number;
    ip: string;
    constructor() {
        super();
    }

    sendMessage(namespace, ...args: any[]) {
        let newargs: any[] = [];

        args.forEach((arg) => {
            let argtype = typeof arg;
            switch (argtype) {
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
                            type: argtype,
                            value: arg
                        } 
                    );
                    break;
                }
            }
        });

        let buf = osc.toBuffer({
            address: "/SocketIO/" + namespace,
            args: newargs
        });

        this.socket.send(buf, 0, buf.length, this.port, this.ip);
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
            let full_address = message["address"].replace(/^\//g, ''); //remove leading slash
            let args = message['args'];
            let newargs = [];

            /*
            if utc exists (eg. sent as bundle), then put utc as first argument
            */
            
            if (utc !== undefined) {
                newargs.push(utc);
            }

            args.forEach(element => {
                newargs.push(element["value"]);
            });

            /*
            MAKE REPLY:
            if last argument is a string of 'OSCSOCKET-REPLY-ID:num', then make a reply callback with ID
            */
            let last_arg = newargs[newargs.length - 1];
            if (typeof last_arg === 'string') {
                //match:
                if (last_arg.indexOf('SOCKETIO-REPLY-ID:') > -1) {
                    let request_id: number = parseInt(last_arg.slice(19));
                    let callback = (args: {
                        type: string,
                        value: any
                    }[]) => {
                        let buf = osc.toBuffer({
                            address: "/SocketIO/reply",
                            args: [
                                {
                                    type: "integer",
                                    value: request_id
                                }
                            ].concat(args)
                        });
                        this.socket.send(buf, 0, buf.length, rinfo['port'], rinfo['address']);
                    };

                    newargs[newargs.length - 1] = callback;
                }
            }
            
            this.emit(full_address, ...newargs);
        }
    }

    mountOSC(recv_port: number = 8002, sc_port: number = 57120, recv_ip: string = "127.0.0.1", sc_ip: string = "127.0.0.1") {
        this.port = sc_port;
        this.ip = sc_ip;
        if (this.socket === undefined) {
            this.socket = udp.createSocket("udp4", (msg, rinfo) => {
                this.parse(msg, rinfo);
            });
            this.socket.bind(recv_port, recv_ip);
        };
    }
}
