class DraggableLight extends Nitro.Component<{ scale: int, width: int, height: int, lightX: int, lightY: int, lightZ: int, lightMoved: (x: int, y: int, z: int) => void }> {

	render(_?: Nitro.Renderer): void | HTMLElement {
		const input = this.input;
		const scale = input.scale;

		const lightRadius = 3;
		const lightSize = (lightRadius * 2 * input.scale);
		const lightX = input.lightX - lightSize/2;
		const lightY = input.lightY - input.lightZ * scale - lightSize/2;

		const zIndexIndicatorY = input.lightY - (input.lightZ * scale);

		const stickWidth = scale;

		// console.log(input.lightX, input.lightY, input.lightZ);

		const style = 'position: absolute; display: block; border: 2px solid black; width: ' + (input.width * input.scale) + 'px; height: ' + (input.height * input.scale) + 'px';
		return <div style={style} onWheel={this.onWheel}>
			<div style={'position: absolute; background-color: red; width: ' + stickWidth + '; height: ' + (input.lightZ * scale) + 'px; left: ' + (input.lightX - stickWidth/2) + '; top: ' + zIndexIndicatorY + 'px'}></div>
			<div style={'position: absolute; background-color: yellow; width: ' + lightSize + '; height: ' + lightSize + 'px; border-radius: ' + (lightRadius * scale) + 'px; left: ' + lightX + '; top: ' + lightY + 'px'} onMouseDown={this.onMouseDown}></div>
		</div>;
		// throw new Error("Method not implemented.");
	}

	onMouseDown = (event: MouseEvent) => {
		listenToMouseMoveUntilMouseUp(e => {
			this.input.lightMoved(e.movementX, e.movementY, 0);
			// document.body.addEventListener('wheel', this.onWheel, { passive: false });
		}, e => {
			// document.body.removeEventListener('wheel', this.onWheel);
		}, 'grabbing');
	}

	private onWheel = (e: WheelEvent) => {
		if (e.deltaY < 0) {
			this.input.lightMoved(0, 0, 1);
		}
		else {
			this.input.lightMoved(0, 0, -1);
		}
		e.preventDefault();
	};

}

function listenToMouseMoveUntilMouseUp(onpointermove: (e: MouseEvent) => void, onpointerup: ((e: MouseEvent) => void) | null = null, cursorOverride: string | null = null) {
	// console.log('pointer down');
	assert(window['onpointermove'] === null);
	assert(window['onpointerup'] === null);
	window['onpointermove'] = onpointermove;
	if (cursorOverride !== null) {
		document.body.classList.add('force-' + cursorOverride);
	}
	window['onpointerup'] = (e: MouseEvent) => {
		// console.log('pointer up');
		window['onpointermove'] = null;
		window['onpointerup'] = null;
		if (cursorOverride !== null) {
			document.body.classList.remove('force-' + cursorOverride);
		}
		if (onpointerup !== null) onpointerup(e);
	};
}