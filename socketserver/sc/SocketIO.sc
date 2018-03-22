
SocketIO {

	var <>addr, <>namespace;

	*new { arg netAddr, namespace;
		^super.newCopyArgs(netAddr, namespace).init;
	}

	*connect { arg namespace, netAddr = NetAddr("localhost", 8002);
		var sock = this.new(netAddr, namespace);
		^sock.connect;
	}

	connect {
		addr.sendMsg("connect", namespace);
	}

	init {

	}

	on {arg selector, callback;
		var argTemplate;
		argTemplate = [
			{arg aSelector; aSelector == selector.asSymbol;}
		];
		OSCFunc({|msg, time, addr, recvPort|
			callback.(*msg[2..]);
		}, "/SocketIO/%".format(namespace), addr, argTemplate: argTemplate);
	}

	emit {arg ...args;

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

		addr.sendMsg(namespace, *args);
	}

	schedEmit {arg delta ...args;
		addr.sendBundle(delta, namespace, *args);
	}

}
