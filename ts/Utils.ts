type Size<T> = {
	width: T;
	height: T;
}

type ColorStruct = {
	r: number;
	g: number;
	b: number;
	a: number;
}

type PackedColor = number;

type BitSet = int;

const enum NoiseType {
	SIMPLEX,
	PERLIN,
	OPEN_SIMPLEX
}

type NoiseTypeString = 'simplex' | 'perlin' | 'opensimplex';

// Prevent drag-and-drop events from interferring with our own drag handling
// document.addEventListener('dragstart', event => event.preventDefault());
// document.addEventListener('dragover', event => event.preventDefault());

namespace Utils {

	export function noiseTypeFromString(value: NoiseTypeString): NoiseType {
		switch (value) {
			case 'simplex': return NoiseType.SIMPLEX;
			case 'perlin': return NoiseType.PERLIN;
			case 'opensimplex': return NoiseType.OPEN_SIMPLEX;
		}
		throw new Error();
	}

	export function clamp(min: number, value: number, max: number) {
		if (value < min) return min;
		if (value > max) return max;
		return value;
	}

	export function arrayOf<T>(value: T, count: int): T[] {
		const array = new Array(count);
		array.fill(value);
		return array;
	}

	export function compareArrays(a1: any[], a2: any[]): boolean {
		if (a1.length !== a2.length) {
			return false;
		}
		for (let i = 0; i < a1.length; i++) {
			if (a1[i] !== a2[i]) {
				return false;
			}
		}
		return true;
	}

	export function copyArray<T>(array: T[]): T[] {
		const ret = [];
		for (const item of array) {
			ret.push(item);
		}
		return ret;
	}

	export function copyJson<T>(json: T): T {
		return JSON.parse(JSON.stringify(json));
	}

	export function max(array: number[]): number {
		let max = array[0];
		for (const item of array) {
			if (item > max) {
				max = item;
			}
		}
		return max;
	}

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

	export function onNextMouseUp(onmouseup: (e: MouseEvent) => void) {
		const handler = function(e: MouseEvent) {
			onmouseup(e);
			window.removeEventListener('mouseup', handler);
		};
		window.addEventListener('mouseup', handler);
	}

	export function formatFloat(value: float, decimalPlaces: int): string {
		let str = value.toString();
		if (str.indexOf('.') === -1) {
			// No decimal
			return str + '.' + '0'.repeat(decimalPlaces);
		}
		const parts = str.split('.');
		const decimalPart = parts[1];
		if (decimalPart.length > decimalPlaces) {
			return parts[0] + '.' + decimalPart.substring(0, decimalPlaces);
		}
		return parts[0] + '.' + decimalPart + '0'.repeat(decimalPlaces - decimalPart.length);
	}

	export function chanceNumberToText(value: number): string {
		let text = (value * 100) + '';
		if (text.length > 2) {
			text = text.substr(0, 2);
		}
		return text + '%';
	}

	export function directionFromXY(x: number, y: number): Direction | null {
		if (x === -1) return Direction.WEST;
		if (x === 1) return Direction.EAST;
		if (y === -1) return Direction.NORTH;
		if (y === 1) return Direction.SOUTH;
		return null;
	}

	export function directionToXDelta(dir: Direction): number {
		if (dir === Direction.WEST) return -1;
		if (dir === Direction.EAST) return 1;
		return 0;
	}

	export function directionToYDelta(dir: Direction): number {
		if (dir === Direction.NORTH) return -1;
		if (dir === Direction.SOUTH) return 1;
		return 0;
	}

	export function getUrlParam(key: string): string | null {
		return new URLSearchParams(window.location.search).get(key);
	}

	export function getBooleanUrlParam(key: string, _default: boolean): boolean {
		const v = getUrlParam(key);
		if (v !== null) {
			const value = v.toLowerCase();
			if (value === 'true' || value === '1') return true;
			if (value === 'false' || value === '0') return false;
		}
		return _default;
	}

	export function flipCoin() {
		return Math.random() > 0.5;
	}

	export function randomBetween(min: number, max: number) {
		return Math.floor(Math.random() * (max + 1 - min)) + min;
	}

	export function randomFrom<T>(...items: T[]) {
		return items[Math.floor(Math.random() * items.length)];
	}

	export function randomFromArray<T>(items: T[]): T {
		return items[Math.floor(Math.random() * items.length)];
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

	export function logImage(message: string, url: string, scale = 1) {
		const img = new Image();
		img.onload = function() {
			const width = img.width * scale;
			const height = img.height * scale;
			const style = 'font-size: 0; padding: ' + 0 + 'px ' + Math.floor(width/2) + 'px; line-height: ' + height + 'px;';
			console.log(message + '\n%c+', style + 'background: url(' + url + '); background-size: ' + (img.width * scale) + 'px ' + (img.height * scale) + 'px; background-repeat: none; color: transparent; border: 1px solid white');
		};
		img.src = url;
	}

	export function scaleCanvas(input: HTMLCanvasElement, scale: int, willReadFrequently = false): CanvasRenderingContext2D {
		const output = document.createElement('canvas');
		output.width = input.width * scale;
		output.height = input.height * scale;
		const ctx = output.getContext('2d', { willReadFrequently: willReadFrequently })!!;
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(input, 0, 0, output.width, output.height);
		return ctx;
	}

	export function loadString(path: string, callback: (data: string) => void) {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			const DONE = 4;
			const OK = 200;
			if (xhr.readyState === DONE) {
				if (xhr.status === OK && typeof xhr.response === 'string') { // Check the response type to make Closure happy
					callback(xhr.response);
				}
				else {
					console.error('Error fetching "' + path + '": ' + xhr.status);
				}
			}
		};

		xhr.open('GET', path);
		xhr.send(null);
	}

	export function loadJson<T>(path: string, callback: (data: T) => void) {
		loadString(path, data => {
			callback(JSON.parse(data));
		});
	}

}
