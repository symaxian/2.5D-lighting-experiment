class RgbColor {

	constructor(public r: int, public g: int, public b: int, public a: int = 255) {}

	isBlack() {
		return this.r === 0 && this.g === 0 && this.b === 0;
	}

	toCss(): string {
		return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a/255 + ')';
	}

	pack(): PackedColor {
		return Colors.pack(this.r, this.g, this.b, this.a);
	}

	static parseColorString(input: string): RgbColor {
		if (input.startsWith('rgb(')) {
			const values = input.substr(4).split(',');
			return new RgbColor(parseInt(values[0], 10), parseInt(values[1], 10), parseInt(values[2], 10));
		}

		if (input.startsWith('#') || input.length === 6) {
			return new RgbColor(
				parseInt(input.substr(0, 2), 16),
				parseInt(input.substr(2, 2), 16),
				parseInt(input.substr(4, 2), 16)
			);
		}

		return new RgbColor(255, 255, 255);
	}

}

namespace Colors {

	export function pack(r: int, g: int, b: int, a: int = 255): PackedColor {
		return (r << 0) | (g << 8) | (b << 16) | (a << 24);
	}

	export function unpack(color: PackedColor): RgbColor {
		return new RgbColor((color >> 0) & 255, (color >> 8) & 255, (color >> 16) & 255, (color >> 24) & 255);
	}

	export function cssToPacked(input: string): PackedColor {
		// TODO: Optimize
		return RgbColor.parseColorString(input).pack();
	}

	export function packedToCss(packedColor: PackedColor): string {
		const values = Colors.unpack(packedColor);
		if (values.a !== 255) {
			return 'rgba(' + values.r + ',' + values.g + ',' + values.b + ',' + values.a + ')';
		}
		return 'rgb(' + values.r + ',' + values.g + ',' + values.b + ')';
	}

	export const WHITE = Colors.pack(255, 255, 255);
	export const BLACK = 0;

}