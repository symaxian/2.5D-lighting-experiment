function assert(condition: boolean, message = ''): asserts condition {
	if (!condition) {
		if (message.length) {
			console.error('Assertion failed: ' + message);
		}
		else {
			console.error('Assertion failed');
		}
	}
};

const component = new ShapeCastingDemo();
component.mountUnder(document.body);