SocketIO2 {

	var <>addr, <>namespace, url;

	*new { arg url, netAddr;
		^super.newCopyArgs(netAddr, namespace);
	}

	*connect { arg url, netAddr = NetAddr("localhost", 8002);
		var sock = this.new(url, netAddr);
		^sock.prConnect;
	}

	prConnect { arg namespace;
		if (namespace.notNil) {
			addr.sendMsg("connect", url, namespace);
		} {
			addr.sendMsg("connect", url);
		};
	}

	connect { arg namespace;
		^SocketIO.connect(url, addr).prConnect(namespace);
	}

	on { arg selector, callback;
		var argTemplate;
		argTemplate = [
			{arg aSelector; aSelector == selector.asSymbol;}
		];
		OSCFunc({|msg, time, addr, recvPort|
			callback.(*msg[2..]);
		}, "/SocketIO/%".format(namespace), addr, argTemplate: argTemplate);
	}

	emit { arg ...args;

		if (args.last.class == Function) {
			var argTemplate, id, callback;

			callback = args[args.size - 1];
			id = UniqueID.next;
			args[args.size - 1] = "SOCKETIO-REPLY-ID:%".format(id);

			argTemplate = [
				{arg aReqId; aReqId == id;}
			];

			OSCFunc({|msg, time, addr, recvPort|
				callback.(*msg[2..]);
			}, "/SocketIO/reply", addr, argTemplate: argTemplate).oneShot;

		};

		addr.sendMsg("/SocketIO/%".format(namespace), *args);
	}

	schedEmit { arg delta ...args;
		addr.sendBundle(delta, namespace, *args);
	}

}
