namespace RenderUtils {

	export function copyCanvas(canvas: CanvasRenderingContext2D, willReadFrequently = false): CanvasRenderingContext2D {
		const width = canvas.canvas.width;
		const height = canvas.canvas.height;
		const copy = Utils.createCanvas(width, height, willReadFrequently);
		copy.putImageData(canvas.getImageData(0, 0, width, height), 0, 0);
		return copy;
	}

	export function canvasFromImageData(imageData: ImageData): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = imageData.width;
		canvas.height = imageData.height;
		canvas.getContext('2d')!.putImageData(imageData, 0, 0);
		return canvas;
	}

	export function recolorImageData(imageData: ImageData, r: int, g: int, b: int, a: int = 255) {
		const pixelData = imageData.data;
		for (let i = 0; i < pixelData.length; i += 4) {
			if (pixelData[i + 3] === 255) {
				pixelData[i] = r;
				pixelData[i + 1] = g;
				pixelData[i + 2] = b;
				pixelData[i + 3] = a;
			}
		}
	}

	export function outlineGlyphImageData(imageData: ImageData, r: int, g: int, b: int, a: int = 255) {
		const verticalDiff = imageData.width * 4;
		const horizontalDiff = 4;
		const pixelData = imageData.data;
		for (let i = 0; i < pixelData.length; i += 4) {
			const sr = pixelData[i];
			const sg = pixelData[i + 1];
			const sb = pixelData[i + 2];
			if ((sr + sg + sb !== 0) && (sr !== r || sg !== g || sb !== b)) {
				RenderUtils.setPixelColor(pixelData, i - verticalDiff - horizontalDiff, r, g, b, a);	// NW pixel
				RenderUtils.setPixelColor(pixelData, i - verticalDiff, r, g, b, a);						// N pixel
				RenderUtils.setPixelColor(pixelData, i - verticalDiff + horizontalDiff, r, g, b, a);	// NE pixel

				RenderUtils.setPixelColor(pixelData, i - horizontalDiff, r, g, b, a);		// W pixel
				RenderUtils.setPixelColor(pixelData, i + horizontalDiff, r, g, b, a);		// E pixel

				RenderUtils.setPixelColor(pixelData, i + verticalDiff - horizontalDiff, r, g, b, a);	// SW pixel
				RenderUtils.setPixelColor(pixelData, i + verticalDiff, r, g, b, a);						// S pixel
				RenderUtils.setPixelColor(pixelData, i + verticalDiff + horizontalDiff, r, g, b, a);	// SE pixel
			}
		}
	}

	export function generateOutlinedImage(canvas: HTMLCanvasElement, r: number, g: number, b: number, a: number = 255, blocky = false) {
		const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);

		const newCanvas = document.createElement('canvas');
		newCanvas.width = canvas.width;
		newCanvas.height = canvas.height;
		const newCtx = newCanvas.getContext('2d')!;
		const newImageData = newCtx.getImageData(0, 0, canvas.width, canvas.height);

		const verticalDiff = imageData.width * 4;
		const horizontalDiff = 4;
		const pixelData = imageData.data;
		const pixelDataLength = pixelData.length;
		for (let i = 0; i < pixelDataLength; i += 4) {
			if (pixelData[i + 3] === 255) {
				RenderUtils.setPixelColor(newImageData.data, i - verticalDiff, r, g, b, a);			// N pixel
				RenderUtils.setPixelColor(newImageData.data, i + verticalDiff, r, g, b, a);			// S pixel
				RenderUtils.setPixelColor(newImageData.data, i - horizontalDiff, r, g, b, a);		// W pixel
				RenderUtils.setPixelColor(newImageData.data, i + horizontalDiff, r, g, b, a);		// E pixel

				if (blocky) {
					RenderUtils.setPixelColor(newImageData.data, i - verticalDiff - horizontalDiff, r, g, b, a);		// NW pixel
					RenderUtils.setPixelColor(newImageData.data, i - verticalDiff + horizontalDiff, r, g, b, a);		// NE pixel
					RenderUtils.setPixelColor(newImageData.data, i + verticalDiff - horizontalDiff, r, g, b, a);		// SW pixel
					RenderUtils.setPixelColor(newImageData.data, i + verticalDiff + horizontalDiff, r, g, b, a);		// SE pixel
				}
			}
		}

		newCtx.putImageData(newImageData, 0, 0);
		newCtx.drawImage(canvas, 0, 0);
		return newCanvas;
	}

	export function generateOutlineForImage(canvas: CanvasRenderingContext2D, r: number, g: number, b: number, a: number = 255, blocky = false): CanvasRenderingContext2D {
		const width = canvas.canvas.width;
		const height = canvas.canvas.height;

		const imageData = canvas.getImageData(0, 0, width, height);

		const newCanvas = Utils.createCanvas(width, height, true);
		const newImageData = newCanvas.getImageData(0, 0, width, height);

		const verticalDiff = imageData.width * 4;
		const horizontalDiff = 4;
		const pixelData = imageData.data;
		const pixelDataLength = pixelData.length;
		for (let i = 0; i < pixelDataLength; i += 4) {
			if (pixelData[i + 3] === 255) {
				setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i - verticalDiff, r, g, b, a);			// N pixel
				setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i + verticalDiff, r, g, b, a);			// S pixel
				setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i - horizontalDiff, r, g, b, a);		// W pixel
				setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i + horizontalDiff, r, g, b, a);		// E pixel

				if (blocky) {
					setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i - verticalDiff - horizontalDiff, r, g, b, a);		// NW pixel
					setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i - verticalDiff + horizontalDiff, r, g, b, a);		// NE pixel
					setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i + verticalDiff - horizontalDiff, r, g, b, a);		// SW pixel
					setPixelColorIfOriginalPixelIsTransparent(pixelData, newImageData.data, i + verticalDiff + horizontalDiff, r, g, b, a);		// SE pixel
				}
			}
		}

		newCanvas.putImageData(newImageData, 0, 0);
		return newCanvas;
	}

	export function setPixelColorNoOpacity(pixelData: Uint8ClampedArray, i: number, r: number, g: number, b: number) {
		if (pixelData[i + 3] === 0) {
			pixelData[i] = r;
			pixelData[i + 1] = g;
			pixelData[i + 2] = b;
			pixelData[i + 3] = 255;
		}
	}

	export function setPixelColor(pixelData: Uint8ClampedArray, i: number, r: number, g: number, b: number, a: number = 255) {
		if (pixelData[i + 3] === 0) {
			pixelData[i] = r;
			pixelData[i + 1] = g;
			pixelData[i + 2] = b;
			pixelData[i + 3] = a;
		}
	}

	function setPixelColorIfOriginalPixelIsTransparent(originalImageData: Uint8ClampedArray, newImageData: Uint8ClampedArray, i: number, r: number, g: number, b: number, a: number = 255) {
		if (originalImageData[i + 3] !== 255 && newImageData[i + 3] === 0) {
			newImageData[i] = r;
			newImageData[i + 1] = g;
			newImageData[i + 2] = b;
			newImageData[i + 3] = a;
		}
	}

}