# Create a slider


Start the socketserver:

```
cd path/to/socketserver
npm start
```

Start angular:

```
cd path/to/angular
npm start
```
Visit http://localhost:4200 in your browser

## In SuperCollider:

Include the folder socketserver/sc in your list of SuperCollider class folders (Preferences -> Interpreter).

Connect to different namespaces in socket-io:
```
~attributes = SocketIO.connect('attributes'); //connect to namespace "attributes"
~backend = SocketIO.connect('backend'); //connect to namespace "backend"
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
