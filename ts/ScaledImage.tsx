class ScaledImage extends Nitro.Component<{ image: HTMLImageElement | HTMLCanvasElement, scale: int, background?: string, absolute?: boolean }> {

	element = document.createElement('canvas');

	constructor() {
		super();
		this.element.style.position = 'absolute';
		this.element.style.border = '2px solid black';
	}

	render(_?: Nitro.Renderer): void | HTMLElement {
		const input = this.input;

		if (input.absolute) {
			this.element.style.position = 'absolute';
		}

		this.element.width = input.image.width * input.scale;
		this.element.height = input.image.height * input.scale;

		const ctx = this.element.getContext('2d')!;
		ctx.imageSmoothingEnabled = false;

		if (input.background !== undefined) {
			this.element.style.backgroundColor = input.background;
		}

		ctx.drawImage(input.image, 0, 0, this.element.width, this.element.height);
	}

}