# Create a slider

## from SuperCollider:
```
n = NetAddr("localhost", 8000);

n.sendMsg("/forward/all/attributes/add", JSON.stringify(
	(
		name: "midinote",
		type: "range",
		minval: 40,
		maxval: 64,
		value: 52
	)
));
```

Remove all attributes matching regex /test/:
```
n.sendMsg("/forward/all/attributes/remove", "test")
```


Make a synth and set it on OSC callback:
```
s.boot;

a = SynthDef(\test, {arg midinote = 40;
	Out.ar(0, Pan2.ar(Saw.ar(midinote.midicps, 0.3)));
}).play(s);

OSCFunc({arg msg;
	var data = JSON.parse(msg[1].asString);
	a.set(\midinote, data[\data]);
}, "/midinote");
```