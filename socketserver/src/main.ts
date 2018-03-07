//imports:
import { Server } from "./server";
import * as http from "http";
import * as socket_io from "socket.io";
import * as udp from "dgram";
import * as osc from 'osc-min';

//create http server for serving socket.io-client
let httpPort = 7000;
let app = Server.bootstrap().app;
app.set("port", httpPort);
let httpServer = http.createServer(app);
httpServer.listen(httpPort);

let oscReturnSocket = udp.createSocket("udp4");

//setup socket.io
let io = socket_io.listen(httpServer);
let openSockets: any[] = []; //anonymous sockets here

io.on('connection', (socket: any) => {
    let name: string = socket.handshake.query.name || 'anonymous';
    name = name.toLowerCase();
    //allow multiple sockets with same name:
    openSockets.push({
        name: name,
        socket: socket
    });
    console.log(name, "connected"); 
    socket.emit('init');

    //remove socket on disconnect
    socket.on('disconnect', () => {
        openSockets.forEach(function (obj, i) {
            if (socket === obj.socket) {
                openSockets.splice(i, 1);
                console.log(obj.name, "disconnected");
            }
        });
    });

    socket.on('callback', (data) => {
        //remove leading slash if it exist:
        let address = data.path.replace(/^\//g, '');
        address = "/" + address;
        delete data.path;

        let buf = osc.toBuffer({
            address: address,
            args: [
              {
                type: "string",
                value: JSON.stringify(data)
              }
            ]
        });
        oscSocket.send(buf, 0, buf.length, 57120, "localhost");
    });
});

// for converting OSC timetag to unix time:
const TWO_POW_32 = 4294967296;
const UNIX_EPOCH = 2208988800;

// socket for OSC communication
let oscPort = 8000;
let oscSocket = udp.createSocket("udp4", function(msg, rinfo) {
    let parsed = osc.fromBuffer(msg);
    let messages: any[] = [];

    let unbundle = (element: any) => {
        if (element["oscType"] == "bundle") {

            //osc-min timetag is calculated wrong (uses int32, should be uint32), so calculate again:
            let dataview = new DataView(msg.buffer); //make sure it's big endian
            let seconds = dataview.getUint32(8, false); //timetag seconds is byte num 8-11
            let fractional = dataview.getUint32(12, false); //timetag fractional is byte num 12-15
            let unixepoch = seconds + (fractional / TWO_POW_32) - UNIX_EPOCH;
            let date = new Date();
            date.setTime(unixepoch * 1000);
            for (let el of element["elements"]) {
                el["date"] = date;
                unbundle(el); //recursive unbundle
            }
        } else {
            messages.push(element);
        }
    }

    console.log("OSC packet received");
    unbundle(parsed);

    for (let message of messages) {
        let full_address = message["address"].replace(/^\//g, ''); //remove leading slash
        let address_array = full_address.split("/");
        //remove unnecessary data:
        delete message['oscType'];
        delete message["address"];
        console.log(full_address, message["args"]); 

        let method = address_array.splice(0, 1)[0]; //pop first
        switch(method) {
            //forward to selected browser(s), address syntax: /browser/who/method
            case "forward": {
                if (address_array.length > 1) {
                    let who = address_array.splice(0, 1)[0]; //pop first
                    for (let connected of openSockets) {
                        if ((connected.name == who) || (who == 'all')) {
                            connected.socket.emit(address_array.join("/"), message);
                        }
                    }
                }
                break;
            }
            case "vtm": {
                //VTM functionality
                break;
            }
            default: {
                console.log("OSC method not found")
            }
        }
    }
});
  
oscSocket.bind(oscPort, "127.0.0.1");
console.log("Listening for OSC packets on port", oscPort);
