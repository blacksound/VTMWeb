//imports:
import { Server } from "./server";
import * as http from "http";
import * as socket_io from "socket.io";
import * as udp from "dgram";
let osc = require('osc-min');

//create http server for serving socket.io-client
let httpPort = 8080;
let app = Server.bootstrap().app;
app.set("port", httpPort);
let httpServer = http.createServer(app);
httpServer.listen(httpPort);

//setup socket.io
let io = socket_io.listen(httpServer);
let openSockets: any[] = []; //array for holding open sockets
io.on('connection', function(socket: any) {
    openSockets.push(socket);
    console.log("Socket connect", socket);
    //remove socket on disconnect
    socket.on('disconnect', () => {
        console.log("Socket disconnect", socket);
        openSockets.forEach(function (socket2, i) {
            if (socket === socket2) {
                openSockets.splice(i, 1);
            }
        });
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
            console.log(element);
            messages.push(element);
        }
    }

    console.log("OSC packet received");
    unbundle(parsed);

    for (let message of messages) {
        for (let socket of openSockets) {
            let address = message["address"];
            delete message['messageType'];
            delete message["address"];
            socket.emit(message["address"], message);
        }
    }
});
  
oscSocket.bind(oscPort, "127.0.0.1");
console.log("Listening for OSC packets on port", oscPort);