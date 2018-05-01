SocketIO {

	var <>addr, <>permanent = true, <id, <connected = false;

	*new { arg url, options, netAddr = NetAddr("localhost", 8002), permanent = false;
		^super.newCopyArgs(netAddr, permanent).prConnect(url, options);
	}

	generateId {
		var id = "";
		10.do({id = id ++ [rrand(48, 57), rrand(65, 90), rrand(97, 122)].choose.asAscii}); //ASCII 0-9, a-z, A-Z
		^(id ++ UniqueID.next.wrap(0, 999999).asString.padLeft(6, "0")).asSymbol;
	}

	prConnect { arg url, options;
		var callback;
		this.on('connect', {connected = true;});
		id = this.generateId;
		options = JSON.stringify(options ? ());
		//callback = this.prMakeCallback({arg anId; id = anId; connected = true});
		addr.sendMsg("/SocketIO/connect", id, url, options, this.prMakeCallback({arg ...args;
			id = args[0];
		}));
		this.on('ping', {arg callback;
			callback.();
		});
		if (permanent.not) {
			CmdPeriod.doOnce({this.disconnect});
		};
	}

	disconnect {
		if (connected) {
			addr.sendMsg("/SocketIO/emit", id, "disconnect");
			connected = false;
		} {
			"Socket not connected".warn;
		};
	}

	prOn { arg selector, callback;
		var argTemplate;
		argTemplate = [
			{arg anId; anId == id},
			{arg aSelector; aSelector == selector.asSymbol;}
		];
		^OSCFunc({|msg, time, addr, recvPort|
			msg = msg[3..].collect({arg message;
				if (message.isSymbol && {message.asString[..17] == "SOCKETIO-REPLY-ID:"}) {
					var reply_id = message.asString[18..];
					message = {arg ...args;
						addr.sendMsg("/SocketIO/reply", reply_id, *args);
					};
				};
				message;
			});
			callback.(*msg);
		}, "/SocketIO/emit", addr, argTemplate: argTemplate).permanent_(permanent);
	}

	on { arg selector, callback;
		this.prOn(selector, callback);
	}

	once { arg selector, callback;
		this.prOn(selector, callback).oneShot;
	}

	prMakeCallback {arg callback;
		var argTemplate, id;

		id = this.generateId;

		argTemplate = [
			{arg aReqId; aReqId == id;}
		];

		OSCFunc({|msg, time, addr, recvPort|
			callback.(*msg[2..]);
		}, "/SocketIO/reply", addr, argTemplate: argTemplate).oneShot;

		^"SOCKETIO-REPLY-ID:%".format(id);
	}

	emit { arg ...args;

		if (args.last.class == Function) {
			args[args.size - 1] = this.prMakeCallback(args.last);
		};

		if (connected) {
			addr.sendMsg("/SocketIO/emit", id, "message", *args);
		} {
			"Socket not connected".warn;
		};
	}

	schedEmit { arg delta ...args;
		if (connected) {
			addr.sendBundle(delta, "/SocketIO/schedEmit", id, "message", *args);
		} {
			"Socket not connected".warn;
		};
	}
}
