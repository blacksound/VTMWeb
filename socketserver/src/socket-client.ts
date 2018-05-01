import { ArgumentParser } from 'argparse';
import scsocket from './SCsocket';

let parser = new ArgumentParser({
    version: '0.0.1',
    addHelp:true,
    description: 'SocketIO for SuperCollider'
});

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
let args = parser.parseArgs();

scsocket().listen(args['port'], args['ip']);
