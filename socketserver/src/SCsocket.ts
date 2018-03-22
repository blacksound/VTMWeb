import * as socket_io from "socket.io-client";
import { OscSocket } from './OscSocket';
import * as udp from "dgram";
import * as wildcard_middleware from 'socketio-wildcard';

let patch = wildcard_middleware(socket_io.Manager);

export default (url, name) => {

    let osc_socket = new OscSocket();
    let socket = socket_io.connect(url, {reconnect: true, query: "name=" + name});

    socket.on('connect', () => {
        console.log("SC-socket-client:", name, "connected");
    });

    osc_socket.on('connect', (namespace) => {
        let socket = socket_io.connect(url + "/" + namespace, {reconnect: true, query: "name=" + name});
        
        patch(socket); //use wildcard middleware

        socket.on('connect', () => {
            console.log('SC-socket-client:', name, "connected to", namespace);
        });

        //forward all messages from socket.io server to Super Collider
        socket.on('*', (packet) => {
            osc_socket.sendMessage(namespace, ...packet.data);
        });

        //forward all messages from Super Collider to socket.io server
        osc_socket.on(namespace, (...args: any[]) => {
            socket.emit(...args);
        });
    });

    return osc_socket;
}
