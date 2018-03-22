import { ArgumentParser } from 'argparse';
import scsocket from './SCsocket';

let parser = new ArgumentParser({
    version: '0.0.1',
    addHelp:true,
    description: 'SocketIO for SuperCollider'
});

parser.addArgument(
    [ '-s', '--scport' ],
    {
      help: 'Super Collider port',
      type: 'int',
      defaultValue: 57120
    }
);

parser.addArgument(
    [ '-p', '--port' ],
    {
      help: 'Port for sending/receiving OSC-messages',
      type: 'int',
      defaultValue: 8002
    }
);
parser.addArgument(
    [ '-i', '--ip' ],
    {
      help: 'IP for sending/receiving OSC-messages',
      type: 'string',
      defaultValue: '127.0.0.1'
    }
);
parser.addArgument(
    [ '-u', '--url' ],
    {
        help: 'Socket.io url',
        type: 'string',
        defaultValue: 'http://localhost:7000'
    }
);
parser.addArgument(
    ['-n', '--name'],
    {
        help: 'Name',
        type: 'string',
        defaultValue: 'anonymous'
    }
);
let args = parser.parseArgs();

scsocket(args['url'], args['name']).mountOSC(args['port'], args['scport'], args['ip']);
