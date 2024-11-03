const Nitro = {};

Nitro.Component = class {

	input = null;

	constructor() {}

	/**
	 * @param {any} element
	 */
	mountUnder(element) {}
	unmount() {}

	/** @return {!boolean} */
	isMounted() {}

	wasMounted() {}
	wasUnmounted() {}

	/**
	 * @param {any} input
	 */
	setInput(input) {}

	setDirty() {}
	render() {}
	getElement() {}
	childByKey() {}

};

Nitro.PureComponent = class {}

Nitro.updateChildren = () => {};
