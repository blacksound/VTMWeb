# Create a slider


Start the socketserver:

```
cd path/to/socketserver
npm start
```

In a different terminal, start angular:

```
cd path/to/angular
npm start
```
Visit http://localhost:4200 in your browser

## In SuperCollider:

Include the folder socketserver/sc in your list of SuperCollider class folders (Preferences -> Interpreter).

Connect to different namespaces in socket-io:
```
~url = "http://localhost:7000";
//connect to namespace "attributes":
~attributes = SocketIO(~url ++ "/attributes", (query: "name=scfoo")).on('connect', {"Connected".postln});
//connect to namespace "backend":
~backend = SocketIO(~url ++ "/backend", (query: "name=scfoo")).on('connect', {"Connected".postln});
```
Make a spec:
```
~spec = (
	name: "midinote",
	type: "range",
	minval: 40,
	maxval: 64,
	value: 52
);
```

Get a notification on added specs:
```
~attributes.on('add', {arg spec;
	JSON.parse(spec.asString).postln;
});

```
Then add it (syntax: namespace, room, method, ...args):
```
~backend.emit("attributes", "all", "add", JSON.stringify(~spec));
```

Get a callback when a slider moves:
```
~attributes.on('set', {arg name, val;
	"%: %".format(name, val).postln;
});
```

Set a value (notice no feedback):
```
~attributes.emit('set', 'test.pan', 0.2);

```

Remove it:
```
~backend.emit("attributes", "all", "remove", "midinote");
````

Remove all attributes matching regex /test/:
```
~backend.emit("attributes", "all", "removeMatching", "test");
```
Disconnect:
```
~attributes.disconnect;
~backend.disconnect;
```
