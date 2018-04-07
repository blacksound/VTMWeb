//imports:
import * as udp from "dgram";
import * as osc from 'osc-min';
import { EventEmitter } from 'events';

let oscReturnSocket = udp.createSocket("udp4");

// for converting OSC timetag to unix time:
const TWO_POW_32 = 4294967296;
const UNIX_EPOCH = 2208988800;

export class API extends EventEmitter {
    private socket;

    parse(msg, rinfo) {
        let parsed = osc.fromBuffer(msg);
        let messages: any[] = [];

        // osc-min timetag is calculated wrong (uses int32, should be uint32)
        // Timetag from first bundle is re-calculated and put in each message as utc (milliseconds since 1970-01-01)
        let dataview = new DataView(msg.buffer); //make sure it's big endian
        let seconds = dataview.getUint32(8, false); //timetag seconds is byte num 8-11
        let fractional = dataview.getUint32(12, false); //timetag fractional is byte num 12-15
        let utc = Math.round((seconds + (fractional / TWO_POW_32) - UNIX_EPOCH) * 1000);    
        
        let unbundle = (element: any) => {
            if (element["oscType"] == "bundle") {
                for (let el of element["elements"]) {
                    el["utc"] = utc;
                    unbundle(el); //recursive unbundle
                }
            } else {
                messages.push(element);
            }
        }

        unbundle(parsed);

        for (let message of messages) {
            let full_address = message["address"].replace(/^\//g, ''); //remove leading slash
            let address_array = full_address.split("/");
            let args = message['args'];
            let newargs = [];

            /*
            ADD UTC:
            if any argument is a string of 'OSCSOCKET-UTC', then replace it with utc
            */
            args.forEach(element => {
                if (element["value"] === 'OSCSOCKET-UTC') {
                    newargs.push(utc);
                } else {
                    newargs.push(element["value"]);
                }
            });

            //remove unnecessary data:
            delete message['oscType'];
            delete message["address"];
            let method = address_array.splice(0, 1)[0]; //pop first

            /*
            MAKE REPLY:
            if last argument is a string of 'OSCSOCKET-REPLY-ID:num', then make a reply callback with ID
            */
            let last_arg = args[args.length - 1];
            if (typeof last_arg === 'string') {
                //match:
                if (last_arg.indexOf('OSCSOCKET-REPLY-ID:')) {
                    let request_id: number = parseInt(last_arg.slice(13));

                    let callback = (args: {
                        type: string,
                        value: any
                    }[]) => {
                        let buf = osc.toBuffer({
                            address: "/API/reply",
                            args: [
                                {
                                    type: "integer",
                                    value: request_id
                                }
                            ].concat(args)
                        });
                        this.socket.send(buf, 0, buf.length, rinfo['port'], rinfo['address']);
                    };

                    args[args.lengt - 1] = callback;
                }
            }
            
            console.log(method, address_array, message);
            this.emit(method, address_array, ...args);
        }
    }

    mountOSC(port: number, ip: string) {
        if (this.socket === undefined) {
            this.socket = udp.createSocket("udp4", (msg, rinfo) => {
                this.parse(msg, rinfo);
            });
            this.socket.bind(port, ip);
        };
    }
}
