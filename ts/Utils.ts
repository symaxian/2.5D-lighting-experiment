type PackedColor = number;

namespace Utils {

	export function createCanvas(width: int_NativePixels, height: int_NativePixels, willReadFrequently = false): CanvasRenderingContext2D {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		if (willReadFrequently) {
			return canvas.getContext('2d', {
				'willReadFrequently': true
			})!;
		}
		return canvas.getContext('2d')!;
	}

	export function listenToMouseMoveUntilMouseUp(onpointermove: (e: MouseEvent) => void, onpointerup: ((e: MouseEvent) => void) | null = null, cursorOverride: string | null = null) {
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

	export function listenToPointerMoveUntilPointerDown(onpointermove: (e: MouseEvent) => void, onpointerdown: ((e: MouseEvent) => void) | null = null) {
		// Bracket notation is used here because the older version of Closure being used will minify these names
		assert(window['onpointermove'] === null);
		assert(window['onpointerdown'] === null);
		window['onpointermove'] = onpointermove;
		window['onpointerdown'] = (e: MouseEvent) => {
			window['onpointermove'] = null;
			window['onpointerdown'] = null;
			if (onpointerdown !== null) onpointerdown(e);
		};
	}

	export function pythagoreanDistance(x1: number, y1: number, x2: number, y2: number): number {
		const x = x2 - x1;
		const y = y2 - y1;
		return Math.sqrt(x * x + y * y);
	}

	export function pythagoreanDistanceSquared(x1: number, y1: number, x2: number, y2: number): number {
		const x = x2 - x1;
		const y = y2 - y1;
		return x * x + y * y;
	}

	export function pythagoreanDistanceSquared3(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
		const x = x2 - x1;
		const y = y2 - y1;
		const z = z2 - z1;
		return x * x + y * y + z * z;
	}

	export function radiansToDegrees(radians: Radians): Degrees {
		return radians * 180/Math.PI;
	}

	export function degreesToRadians(degrees: Degrees): Radians {
		return degrees * Math.PI/180;
	}

	export function getRadianAngleForDirection(direction: Direction): Radians {
		switch (direction) {
			case Direction.NORTH: return 3*Math.PI/2;
			case Direction.SOUTH: return Math.PI/2;
			case Direction.EAST: return 0;
			case Direction.WEST: return Math.PI;
		}
	}

}
