//imports:
import * as http from "http";
import * as socket_io from "socket.io";
import * as wildcard_middleware from 'socketio-wildcard';
import scsocket from './SCsocket';

let wildcard = wildcard_middleware();

//setup socket.io:
let httpPort = 7000;
let server = http.createServer();
server.listen(httpPort, '127.0.0.1');
let io = socket_io.listen(server, {
    pingInterval: 1000
});

//connect a local SuperCollider socket-client. This can also be another process on a different device
scsocket('http://localhost:7000', 'foo').mountOSC(8002, 57120);

function get_name(socket): string {
    let name: string = socket.handshake.query.name || 'anonymous';
    return name.toLowerCase();
}

io.on('connection', (socket: any) => {
    let name = get_name(socket);
    console.log("Socket server:", name, "connected");

    socket.on('disconnect', () => {
        console.log(name, "disconnected");
    });
});

io.of('attributes').on('connection', (socket: any) => {
    console.log("Socket server:", get_name(socket) + " connected to attributes");
    socket.on('set', (name, val) => {
        console.log("Socket server: set", name, "to", val);
        socket.broadcast.emit('set', name, val);
    });
});

io.of('backend').use(wildcard).on('connection', (socket: any) => {
    console.log("Socket server:", get_name(socket) + " connected to backend");

    socket.on('*', (packet) => {
        let data = packet.data;
        if (data.length > 2) {
            let namespace = io.of(data[0]);
            let room = data[1];

            if (room !== 'all') {
                namespace = namespace.in(room);
            }

            console.log("Socket server:", "to", data[1], "of", data[0] + ":", data.slice(2));
            namespace.emit(data[2], ...data.slice(3));
        }
    });
});
