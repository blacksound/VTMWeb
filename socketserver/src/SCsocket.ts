import * as socket_io from "socket.io-client";
import { OscSocket } from './OscSocket';
import * as udp from "dgram";
import * as wildcard_middleware from 'socketio-wildcard';

let patch = wildcard_middleware(socket_io.Manager);

let id_count = -1;
let get_id = (): string => {
    id_count += 1;
    return id_count.toString();
}

export default () => {

    let osc_socket = new OscSocket();
    let ping_timeout = 5000;
    
    osc_socket.on('connect', (osc_connection, url, options, callback) => {
        let socket = socket_io.connect(url, JSON.parse(options));
        let id: string = get_id();
        
        patch(socket); //use wildcard middleware

        socket.on('ping', () => {
            let timeoutID = setTimeout(() => {
                socket.disconnect();
            }, ping_timeout);
            osc_connection.send('ping', () => {
                clearTimeout(timeoutID);
            });
        });

        socket.on('connect', () => {
            callback();
            console.log('SC-socket-client:', "connected to", url);
            osc_connection.send('connect');
        });

        //forward all messages from socket.io server to Super Collider   
        socket.on('*', (packet) => {
            osc_connection.send(...packet.data);
        });

        //forward all messages from Super Collider to socket.io server
        osc_connection.on('message', (...args: any[]) => {
            socket.emit(...args);
        });

        osc_connection.on('disconnect', (...args: any[]) => {
            socket.disconnect();
        });
    });

    return osc_socket;
}
